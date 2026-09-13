"use server";

import { connectDB } from "@/lib/db";
import { Property } from "@/models/Property";
import { Disposal } from "@/models/Disposal";
import { Case } from "@/models/Case";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { asyncHandler } from "@/lib/async-handler";

export const disposeProperty = asyncHandler(async (formData: {
  propertyId: string;
  disposalType: string;
  courtOrderReference: string;
  disposalDate: string;
  disposalAuthority: string;
  remarks: string;
  disposalPhoto: string;
  courtOrderPdf: string;
}) => {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }


  await connectDB();

  const property = await Property.findById(formData.propertyId);
  if (!property || property.status === "DISPOSED") {
    throw new Error("Invalid property or already disposed");
  }

  await Disposal.create({
    propertyId: formData.propertyId,
    disposalType: formData.disposalType,
    courtOrderReference: formData.courtOrderReference,
    disposalDate: new Date(formData.disposalDate),
    disposalAuthority: formData.disposalAuthority,
    remarks: formData.remarks,
    disposalPhoto: formData.disposalPhoto || undefined,
    courtOrderPdf: formData.courtOrderPdf || undefined,
    handledBy: (session.user as any).id,
  });

  property.status = "DISPOSED";
  await property.save();

  const remaining = await Property.countDocuments({
    caseId: property.caseId,
    status: { $ne: "DISPOSED" },
  });
  if (remaining === 0) {
    await Case.findByIdAndUpdate(property.caseId, { status: "DISPOSED" });
  }

  return { disposed: true };
});
