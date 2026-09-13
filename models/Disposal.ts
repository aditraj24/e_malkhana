import mongoose, { Schema, models, model } from "mongoose";

const disposalSchema = new Schema(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },

    disposalType: {
      type: String,
      enum: ["RETURNED", "DESTROYED", "AUCTIONED", "COURT_CUSTODY"],
      required: true,
    },

    courtOrderReference: {
      type: String,
      required: true,
      trim: true,
    },

    disposalDate: {
      type: Date,
      required: true,
    },

    disposalAuthority: {
      type: String,
      required: true,
      trim: true,
    },

    remarks: {
      type: String,
      trim: true,
    },

    disposalPhoto: {
      type: String,
      trim: true,
    },

    courtOrderPdf: {
      type: String,
      trim: true,
    },

    handledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export const Disposal = models.Disposal || model("Disposal", disposalSchema);
