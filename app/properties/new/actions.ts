"use server";

import { connectDB } from "@/lib/db";
import { Property } from "@/models/Property";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import QRCode from "qrcode";
import { asyncHandler } from "@/lib/async-handler";

export const createStandaloneProperty = asyncHandler(async (data: {
  caseId?: string;
  propertyType: string;
  category: string;
  belongingTo: string;
  natureOfProperty: string;
  gdNumber: string;
  gdDate: string;
  seizureDate: string;
  quantity: string;
  units: string;
  storageLocation: string;
  description: string;
  itemImages: string[];
}) => {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  await connectDB();

  const property = await Property.create({
    caseId: data.caseId || null,
    propertyType: data.propertyType,
    category: data.category,
    belongingTo: data.belongingTo,
    natureOfProperty: data.natureOfProperty,
    gdNumber: data.gdNumber || null,
    gdDate: data.gdDate ? new Date(data.gdDate) : null,
    seizureDate: new Date(data.seizureDate),
    quantity: Number(data.quantity),
    units: data.units,
    storageLocation: data.storageLocation,
    description: data.description,
    itemImage: data.itemImages,
    seizingOfficer: (session.user as any).id,
  });

  const qrData = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/properties/${property._id}/qr`;
  const qrCode = await QRCode.toDataURL(qrData);

  property.qrCode = qrCode;
  await property.save();

  return { propertyId: property._id.toString() };
});
