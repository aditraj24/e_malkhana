import mongoose, { Schema, models, model } from "mongoose"
import { unique } from "next/dist/build/utils"

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["ADMIN", "SHO", "OFFICER"],
      default: "SHO",
      index: true
    },

    officerId: {
      type: String,
      required: true,
      trim: true,
      index: true,
      unique: true,
      lowercase: true
    },

    policeStation: {
      type: Schema.Types.ObjectId,
      ref: "PoliceStation",
      required: true,
      index: true
    },

    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED"],
      default: "ACTIVE",
      index: true
    }
  },
  {
    timestamps: true
  }
)

export const User = models.User || model("User", UserSchema)
