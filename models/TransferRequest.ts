import mongoose, { Schema, models, model } from "mongoose";

const transferItemSchema = new Schema(
  {
    itemType: {
      type: String,
      enum: ["CASE", "PROPERTY"],
      required: true,
    },
    itemId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "items.itemType",
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },
  },
  { _id: true }
);

const transferRequestSchema = new Schema(
  {
    fromOfficer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    toOfficer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    transferDate: {
      type: Date,
      required: true,
    },
    items: {
      type: [transferItemSchema],
      validate: {
        validator: (v: any[]) => v.length > 0,
        message: "At least one item is required for transfer",
      },
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED"],
      default: "PENDING",
      index: true,
    },
  },
  { timestamps: true }
);

// Auto-complete the request when all items are acted upon
transferRequestSchema.methods.checkCompletion = function () {
  const allActedOn = this.items.every(
    (item: any) => item.status !== "PENDING"
  );
  if (allActedOn) {
    this.status = "COMPLETED";
  }
};

export const TransferRequest =
  models.TransferRequest ||
  model("TransferRequest", transferRequestSchema);
