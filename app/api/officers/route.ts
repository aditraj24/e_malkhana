import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { User } from "@/models/User";

/* GET — list active officers (excluding the current user) with optional search */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  try {
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search")?.trim();

    const userId = (session.user as any).id;

    let filter: any = {
      _id: { $ne: userId },
      status: "ACTIVE",
      role: { $in: ["OFFICER", "SHO"] },
    };

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { officerId: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const officers = await User.find(filter)
      .select("fullName officerId policeStation")
      .populate("policeStation", "name sarkariId district")
      .sort({ fullName: 1 });

    return NextResponse.json(officers);
  } catch (error: any) {
    console.error("Error fetching officers:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
