import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { User } from "@/models/User"
import { PoliceStation } from "@/models/PoliceStation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await connectDB()

    const { policeStationId } = await req.json()

    if (!policeStationId) {
      return NextResponse.json({ error: "Police station ID is required" }, { status: 400 })
    }

    // Validate police station exists
    const policeStation = await PoliceStation.findById(policeStationId)
    if (!policeStation) {
      return NextResponse.json({ error: "Police station not found" }, { status: 404 })
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      id,
      { policeStation: policeStationId },
      { new: true }
    ).populate("policeStation", "name sarkariId district")

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: user
    })
  } catch (error: any) {
    console.error("Error transferring officer:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}