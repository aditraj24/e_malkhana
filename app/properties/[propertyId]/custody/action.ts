"use server";

import { connectDB } from "@/lib/db";
import { CustodyLog } from "@/models/CustodyLog";
import { Property } from "@/models/Property";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { asyncHandler } from "@/lib/async-handler";

export const addCustodyLog = asyncHandler(async (formData: {
    propertyId: string;
    fromOfficer: string;
    fromOfficerId: string;
    toOfficer: string;
    toOfficerId: string;
    fromLocation: string;
    toLocation: string;
    purpose: string;
    action: string;
    remarks: string;
    movementTimestamp: string;
}) => {
    const session = await getServerSession(authOptions);
    if (!session) {
        throw new Error("Unauthorized");
    }

    await connectDB();

    const property = await Property.findById(formData.propertyId);
    if (!property) {
        throw new Error("Property not found");
    }

    if (property.status === "DISPOSED") {
        throw new Error("Cannot add custody log to disposed property");
    }

    // Validate fromOfficerId exists in DB
    const fromOfficerUser = await User.findOne({
        officerId: formData.fromOfficerId.toUpperCase(),
    });
    if (!fromOfficerUser) {
        throw new Error(
            `From Officer ID "${formData.fromOfficerId}" not found in the system`
        );
    }

    // Validate toOfficerId if provided
    let toOfficerUser = null;
    if (formData.toOfficerId) {
        toOfficerUser = await User.findOne({
            officerId: formData.toOfficerId.toUpperCase(),
        });
        if (!toOfficerUser) {
            throw new Error(
                `To Officer ID "${formData.toOfficerId}" not found in the system`
            );
        }
    }

    await CustodyLog.create({
        propertyId: formData.propertyId,
        fromOfficer: formData.fromOfficer,
        fromOfficerId: formData.fromOfficerId.toUpperCase(),
        toOfficer: formData.toOfficer,
        toOfficerId: formData.toOfficerId
            ? formData.toOfficerId.toUpperCase()
            : undefined,
        fromLocation: formData.fromLocation,
        toLocation: formData.toLocation,
        purpose: formData.purpose,
        action: formData.action,
        remarks: formData.remarks,
        handler: (session.user as any).id,
        movementTimestamp: formData.movementTimestamp
            ? new Date(formData.movementTimestamp)
            : new Date(),
    });

    // Update property status based on action
    if (formData.action === "MOVED") {
        property.status = "IN_TRANSIT";
    } else if (formData.action === "RECEIVED") {
        property.status = "SEIZED";
    }
    property.lastMovementAt = new Date();

    // Update currentOfficer when property is transferred
    if (
        toOfficerUser &&
        (formData.purpose === "TRANSFER" || formData.action === "RECEIVED")
    ) {
        property.currentOfficer = toOfficerUser._id;
    }

    await property.save();

    return { success: true };
});
