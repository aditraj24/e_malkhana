"use server"

import { connectDB } from "@/lib/db"
import { Property } from "@/models/Property"
import { Case } from "@/models/Case"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { asyncHandler } from "@/lib/async-handler"

export const linkPropertyToCase = asyncHandler(async (params: {
  propertyId: string;
  caseId: string;
}) => {
  const { propertyId, caseId } = params;
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error("Unauthorized")
  }

  await connectDB()

  const property = await Property.findById(propertyId)
  if (!property) {
    throw new Error("Property not found")
  }

  const userId = (session.user as any).id
  const userRole = (session.user as any).role

  if (
    userRole !== "ADMIN" &&
    property.currentOfficer?.toString() !== userId
  ) {
    throw new Error("Unauthorized")
  }

  const caseExists = await Case.findById(caseId)
  if (!caseExists) {
    throw new Error("Case not found")
  }

  property.caseId = caseId as any
  await property.save()

  return { linked: true }
});
