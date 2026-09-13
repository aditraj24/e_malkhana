import mongoose, { Schema, models, model } from "mongoose";

const CustodyLogSchema = new Schema(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },

    fromOfficer: {
      type: String,
      required: true,
      trim: true,
    },

    fromOfficerId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    toOfficer: {
      type: String,
      trim: true,
    },

    toOfficerId: {
      type: String,
      trim: true,
      uppercase: true,
    },

    fromLocation: {
      type: String,
      required: true,
      trim: true,
    },

    toLocation: {
      type: String,
      required: true,
      trim: true,
    },

    purpose: {
      type: String,
      enum: [
        "COURT",
        "FSL",
        "ANALYSIS",
        "STORAGE",
        "DISPOSAL",
        "RELEASE",
        "TRANSFER",
      ],
      required: true,
      set: (v: string) => v?.toUpperCase(),
    },

    action: {
      type: String,
      enum: ["MOVED", "RECEIVED", "DISPOSED", "RELEASED"],
      required: true,
      set: (v: string) => v?.toUpperCase(),
    },

    remarks: {
      type: String,
      trim: true,
    },

    handler: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    blockchainHash: {
      type: String,
      trim: true,
    },

    movementTimestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export const CustodyLog =
  models.CustodyLog || model("CustodyLog", CustodyLogSchema);
