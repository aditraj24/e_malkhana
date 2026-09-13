import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { PoliceStation } from "@/models/PoliceStation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") || "ACTIVE"

    const policeStations = await PoliceStation.find({ status })
      .sort({ name: 1 })
      .lean()

    return NextResponse.json({
      success: true,
      data: policeStations
    })
  } catch (error: any) {
    console.error("Error fetching police stations:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await connectDB()

    const { name, sarkariId, district, address, phone } = await req.json()

    if (!name || !sarkariId || !district || !address) {
      return NextResponse.json({ error: "All required fields must be provided" }, { status: 400 })
    }

    const existingStation = await PoliceStation.findOne({
      $or: [
        { sarkariId: sarkariId.toUpperCase() },
        { name: name.toUpperCase(), district: district.toUpperCase() }
      ]
    })

    if (existingStation) {
      return NextResponse.json(
        { error: "Police station with this sarkari ID or name+district combination already exists" },
        { status: 409 }
      )
    }

    const policeStation = await PoliceStation.create({
      name: name.toUpperCase(),
      sarkariId: sarkariId.toUpperCase(),
      district: district.toUpperCase(),
      address,
      phone
    })

    return NextResponse.json({
      success: true,
      data: policeStation
    }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating police station:", error)
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