import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Case } from "@/models/Case";
import { Property } from "@/models/Property";
import { User } from "@/models/User";
import { TransferRequest } from "@/models/TransferRequest";

/* ───── POST  — create a new transfer request ───── */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userRole = (session.user as any).role;
  if (userRole === "ADMIN")
    return NextResponse.json(
      { error: "Admins cannot transfer properties" },
      { status: 403 }
    );

  await connectDB();

  const userId = (session.user as any).id;
  const body = await req.json();
  const { toOfficerId, transferDate, cases = [], properties = [] } = body;

  if (!toOfficerId || (!cases.length && !properties.length)) {
    return NextResponse.json(
      { error: "Target officer and at least one item required" },
      { status: 400 }
    );
  }

  // Validate target officer exists and is active
  const toOfficer = await User.findOne({
    officerId: toOfficerId.toLowerCase(),
    status: "ACTIVE",
  });
  if (!toOfficer) {
    return NextResponse.json(
      { error: `Officer "${toOfficerId}" not found or inactive` },
      { status: 400 }
    );
  }

  if (toOfficer._id.toString() === userId) {
    return NextResponse.json(
      { error: "Cannot transfer to yourself" },
      { status: 400 }
    );
  }

  // Build items array
  const items: { itemType: string; itemId: string }[] = [];
  for (const caseId of cases) {
    items.push({ itemType: "CASE", itemId: caseId });
  }
  for (const propertyId of properties) {
    items.push({ itemType: "PROPERTY", itemId: propertyId });
  }

  // For cases, we don't modify the case record during request creation
  // The transfer request itself will be visible to both officers
  // Only when accepted will the case ownership change

  // For properties, we also don't modify during request creation
  // Only when accepted will the currentOfficer change
  const transferRequest = await TransferRequest.create({
    fromOfficer: userId,
    toOfficer: toOfficer._id,
    transferDate: new Date(transferDate),
    items,
  });

  return NextResponse.json(
    { message: "Transfer request created", id: transferRequest._id },
    { status: 201 }
  );
}

/* ───── GET  — list transfer requests for the logged-in officer ───── */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const direction = searchParams.get("direction"); // "sent" | "received"

  let filter: any = {};
  if (direction === "sent") {
    filter.fromOfficer = userId;
  } else if (direction === "received") {
    filter.toOfficer = userId;
  } else {
    filter.$or = [{ fromOfficer: userId }, { toOfficer: userId }];
  }

  const requests = await TransferRequest.find(filter)
    .populate("fromOfficer", "fullName officerId")
    .populate("toOfficer", "fullName officerId")
    .sort({ createdAt: -1 })
    .lean();

  // Populate item details
  for (const req of requests) {
    for (const item of (req as any).items) {
      if (item.itemType === "CASE") {
        const caseDoc = await Case.findById(item.itemId)
          .select("caseNumber crimeNumber crimeYear policeStation")
          .lean();
        (item as any).details = caseDoc;
      } else {
        const propDoc = await Property.findById(item.itemId)
          .select("propertyTag description category propertyType")
          .lean();
        (item as any).details = propDoc;
      }
    }
  }

  return NextResponse.json(requests);
}
