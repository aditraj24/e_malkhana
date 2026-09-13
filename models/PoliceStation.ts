import mongoose, { Schema, models, model } from "mongoose"

const PoliceStationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true
    },
    sarkariId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    district: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
      index: true
    }
  },
  {
    timestamps: true
  }
)

PoliceStationSchema.index({ name: 1, district: 1 }, { unique: true })

export const PoliceStation = models.PoliceStation || model("PoliceStation", PoliceStationSchema)