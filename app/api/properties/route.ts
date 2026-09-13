import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import QRCode from "qrcode"

import { connectDB } from "@/lib/db"
import { Property } from "@/models/Property"
import { Case } from "@/models/Case"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectDB()

  const { searchParams } = new URL(req.url)
  const caseId = searchParams.get("caseId")

  // Filter properties by user visibility for non-ADMIN users
  const isAdmin = session.user.role === "ADMIN"
  const filter: any = caseId ? { caseId } : { caseId: null }
  if (!isAdmin) {
    filter.currentOfficer = session.user.id
  }

  const properties = await Property.find(filter).sort({ createdAt: -1 })

  return NextResponse.json(properties)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectDB()

  const body = await req.json()

  const {
    caseId,
    propertyType,
    category,
    belongingTo,
    natureOfProperty,
    gdNumber,
    gdDate,
    seizureDate,
    quantity,
    units,
    storageLocation,
    description,
    itemImages,
  } = body

  if (
    !propertyType ||
    !category ||
    !belongingTo ||
    !natureOfProperty ||
    !quantity ||
    !units ||
    !storageLocation ||
    !description ||
    !seizureDate ||
    !itemImages ||
    !Array.isArray(itemImages) ||
    itemImages.length === 0
  ) {
    return NextResponse.json({ error: "Invalid data. At least one image is required." }, { status: 400 })
  }

  // Only check if caseId exists if it's provided
  if (caseId) {
    const caseExists = await Case.findById(caseId)
    if (!caseExists) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }
  }

  const qrData = `PROPERTY:${caseId || "STANDALONE"}:${Date.now()}`
  const qrCode = await QRCode.toDataURL(qrData)

  const property = await Property.create({
    caseId: caseId || null,
    propertyType,
    category,
    belongingTo,
    natureOfProperty,
    gdNumber: gdNumber || null,
    gdDate: gdDate ? new Date(gdDate) : null,
    seizureDate: new Date(seizureDate),
    quantity,
    units,
    storageLocation,
    description,
    itemImage: itemImages,
    qrCode,
    seizingOfficer: session.user.id,
  })

  return NextResponse.json({ propertyId: property._id }, { status: 201 })
}
