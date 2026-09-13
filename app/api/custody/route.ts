import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { connectDB } from "@/lib/db"
import { CustodyLog } from "@/models/CustodyLog"
import { Property } from "@/models/Property"
import { User } from "@/models/User"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectDB()

  const { searchParams } = new URL(req.url)
  const propertyId = searchParams.get("propertyId")

  if (!propertyId) {
    return NextResponse.json({ error: "propertyId is required" }, { status: 400 })
  }

  const logs = await CustodyLog.find({ propertyId }).sort({ movementTimestamp: -1 })

  return NextResponse.json(logs)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectDB()

  const body = await req.json()

  const {
    propertyId,
    fromOfficer,
    fromOfficerId,
    toOfficer,
    toOfficerId,
    fromLocation,
    toLocation,
    purpose,
    action,
    remarks,
    movementTimestamp,
  } = body

  if (
    !propertyId ||
    !fromOfficer ||
    !fromOfficerId ||
    !fromLocation ||
    !toLocation ||
    !purpose ||
    !action
  ) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 })
  }

  // Validate fromOfficerId exists
  const fromOfficerUser = await User.findOne({ officerId: fromOfficerId.toUpperCase() })
  if (!fromOfficerUser) {
    return NextResponse.json(
      { error: `From Officer ID "${fromOfficerId}" not found in the system` },
      { status: 400 }
    )
  }

  // Validate toOfficerId if provided
  let toOfficerUser = null
  if (toOfficerId) {
    toOfficerUser = await User.findOne({ officerId: toOfficerId.toUpperCase() })
    if (!toOfficerUser) {
      return NextResponse.json(
        { error: `To Officer ID "${toOfficerId}" not found in the system` },
        { status: 400 }
      )
    }
  }

  const property = await Property.findById(propertyId)

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 })
  }

  const custody = await CustodyLog.create({
    propertyId,
    fromOfficer,
    fromOfficerId: fromOfficerId.toUpperCase(),
    toOfficer,
    toOfficerId: toOfficerId ? toOfficerId.toUpperCase() : undefined,
    fromLocation,
    toLocation,
    purpose,
    action,
    remarks,
    handler: (session.user as any).id,
    movementTimestamp: movementTimestamp
      ? new Date(movementTimestamp)
      : new Date(),
  })

  property.lastMovementAt = new Date()
  property.status =
    action === "MOVED"
      ? "IN_TRANSIT"
      : action === "RECEIVED"
      ? "SEIZED"
      : property.status

  // Update currentOfficer when property is transferred to another officer
  if (toOfficerUser && (purpose === "TRANSFER" || action === "RECEIVED")) {
    property.currentOfficer = toOfficerUser._id
  }

  await property.save()

  return NextResponse.json({ custodyId: custody._id }, { status: 201 })
}
