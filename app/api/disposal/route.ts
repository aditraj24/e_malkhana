import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { connectDB } from "@/lib/db"
import { Disposal } from "@/models/Disposal"
import { Property } from "@/models/Property"
import { Case } from "@/models/Case"
import { authOptions } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await connectDB()

  const body = await req.json()

  const {
    propertyId,
    disposalType,
    courtOrderReference,
    disposalDate,
    disposalAuthority,
    remarks,
    disposalPhoto,
    courtOrderPdf,
  } = body

  if (
    !propertyId ||
    !disposalType ||
    !courtOrderReference ||
    !disposalDate ||
    !disposalAuthority
  ) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 })
  }

  const property = await Property.findById(propertyId)

  if (!property || property.status === "DISPOSED") {
    return NextResponse.json({ error: "Invalid property" }, { status: 400 })
  }

  const parsedDate = new Date(disposalDate)
  if (isNaN(parsedDate.getTime())) {
    return NextResponse.json({ error: "Invalid disposal date" }, { status: 400 })
  }

  const disposal = await Disposal.create({
    propertyId,
    disposalType,
    courtOrderReference,
    disposalDate: parsedDate,
    disposalAuthority,
    remarks,
    disposalPhoto: disposalPhoto || undefined,
    courtOrderPdf: courtOrderPdf || undefined,
    handledBy: (session.user as any).id,
  })

  property.status = "DISPOSED"
  await property.save()


  const remaining = await Property.countDocuments({
    caseId: property.caseId,
    status: { $ne: "DISPOSED" },
  })

  if (remaining === 0) {
    await Case.findByIdAndUpdate(property.caseId, { status: "DISPOSED" })
  }

  return NextResponse.json(
    { message: "Property disposed successfully", disposalId: disposal._id },
    { status: 201 }
  )
}
