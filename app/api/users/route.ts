import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { User } from "@/models/User"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await connectDB()

    // Get search query from URL
    const searchParams = req.nextUrl.searchParams
    const search = searchParams.get("search")?.trim()

    // Build filter
    let filter: any = {}
    if (search) {
      filter = {
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { officerId: { $regex: search, $options: "i" } },
          { username: { $regex: search, $options: "i" } },
        ],
      }
    }

    const users = await User.find(filter)
      .populate("policeStation", "name sarkariId district")
      .sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      data: users,
    })
  } catch (error: any) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}