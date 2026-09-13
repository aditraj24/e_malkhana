import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { PoliceStation } from "@/models/PoliceStation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const policeStation = await PoliceStation.findById(id).lean()

    if (!policeStation) {
      return NextResponse.json({ error: "Police station not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: policeStation
    })
  } catch (error: any) {
    console.error("Error fetching police station:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

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

    const { name, sarkariId, district, address, phone, status } = await req.json()

    if (!name || !sarkariId || !district || !address) {
      return NextResponse.json({ error: "All required fields must be provided" }, { status: 400 })
    }

    const existingStation = await PoliceStation.findOne({
      $or: [
        { sarkariId: sarkariId.toUpperCase() },
        { name: name.toUpperCase(), district: district.toUpperCase() }
      ],
      _id: { $ne: (await params).id }
    })

    if (existingStation) {
      return NextResponse.json(
        { error: "Police station with this sarkari ID or name+district combination already exists" },
        { status: 409 }
      )
    }

    const policeStation = await PoliceStation.findByIdAndUpdate(
      id,
      {
        name: name.toUpperCase(),
        sarkariId: sarkariId.toUpperCase(),
        district: district.toUpperCase(),
        address,
        phone,
        status: status || "ACTIVE"
      },
      { new: true }
    )

    if (!policeStation) {
      return NextResponse.json({ error: "Police station not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: policeStation
    })
  } catch (error: any) {
    console.error("Error updating police station:", error)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Police station with this sarkari ID already exists" },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Check if police station has officers assigned
    const { User } = await import("@/models/User")
    const officerCount = await User.countDocuments({ policeStation: id })

    if (officerCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete police station with assigned officers. Transfer officers first." },
        { status: 400 }
      )
    }

    const policeStation = await PoliceStation.findByIdAndDelete(id)

    if (!policeStation) {
      return NextResponse.json({ error: "Police station not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Police station deleted successfully"
    })
  } catch (error: any) {
    console.error("Error deleting police station:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}