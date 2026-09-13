import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
import { Property } from "@/models/Property";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const isAdmin = (session.user as any).role === "ADMIN";
  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);

  const standalone = searchParams.get("standalone");
  const caseRelated = searchParams.get("caseRelated");
  const q = searchParams.get("q")?.trim();
  const propertyTag = searchParams.get("propertyTag")?.trim();
  const category = searchParams.get("category")?.trim();
  const seizureDateFrom = searchParams.get("seizureDateFrom");
  const seizureDateTo = searchParams.get("seizureDateTo");
  const status = searchParams.get("status");

  const filter: any = {};

  // Filter by property association
  if (standalone === "true") {
    filter.caseId = null;
  } else if (caseRelated === "true") {
    filter.caseId = { $ne: null };
  }

  // Officer visibility
  if (!isAdmin) {
    filter.currentOfficer = userId;
  }

  // Search filters
  if (propertyTag) {
    filter.propertyTag = new RegExp(propertyTag, "i");
  }

  if (category) {
    filter.category = new RegExp(category, "i");
  }

  if (status && status !== "ALL") {
    filter.status = status.toUpperCase();
  }

  if (seizureDateFrom || seizureDateTo) {
    filter.seizureDate = {};
    if (seizureDateFrom) filter.seizureDate.$gte = new Date(seizureDateFrom);
    if (seizureDateTo) filter.seizureDate.$lte = new Date(seizureDateTo);
  }

  if (q) {
    const regex = new RegExp(q, "i");
    // Merge with existing $or if present
    const textOr = [
      { propertyTag: regex },
      { description: regex },
      { natureOfProperty: regex },
      { storageLocation: regex },
      { category: regex },
    ];

    if (filter.$or) {
      // Need to combine officer $or with text search $or using $and
      const officerOr = filter.$or;
      delete filter.$or;
      filter.$and = [{ $or: officerOr }, { $or: textOr }];
    } else {
      filter.$or = textOr;
    }
  }

  const properties = await Property.find(filter)
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return NextResponse.json(properties);
}
