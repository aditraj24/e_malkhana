import mongoose, { Schema, models, model } from "mongoose";

const propertySchema = new Schema(
  {
    caseId: {
      type: Schema.Types.ObjectId,
      ref: "Case",
      required: false,
      index: true,
    },

    propertyTag: {
      type: String,
      trim: true,
      index: true,
    },

    propertyType: {
      type: String,
      required: true,
      enum: ["CASE_RELATED", "KURKI", "UNCLAIMED"],
      uppercase: true,
    },

    gdNumber: {
      type: String,
      trim: true,
      default: null,
    },

    gdDate: {
      type: Date,
      default: null,
    },

    seizureDate: {
      type: Date,
      required: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    belongingTo: {
      type: String,
      enum: ["ACCUSED", "COMPLAINANT", "UNKNOWN"],
      default: "UNKNOWN",
      set: (v: string) => v?.toUpperCase(),
    },

    natureOfProperty: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    units: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    storageLocation: {
      type: String,
      required: true,
      trim: true,
    },

    serialNumber: {
      type: String,
      trim: true,
    },

    itemImage: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "At least one property image is required",
      },
    },

    qrCode: {
      type: String,
    },

    status: {
      type: String,
      enum: [
        "SEIZED",
        "IN_TRANSIT",
        "IN_LAB",
        "IN_COURT",
        "DISPOSED",
        "RELEASED",
      ],
      default: "SEIZED",
      index: true,
    },

    seizingOfficer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    currentOfficer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    lastMovementAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

propertySchema.index({ caseId: 1, serialNumber: 1 }, { sparse: true });

propertySchema.pre("save", function () {
  if (this.isNew) {
    if (!this.propertyTag) {
      const tail = this._id.toString().slice(-6).toUpperCase();
      this.propertyTag = `PROP-${tail}`;
    }
    if (!this.currentOfficer && this.seizingOfficer) {
      this.currentOfficer = this.seizingOfficer;
    }
  }
});

// Delete cached model to ensure schema changes take effect during dev
if (models.Property) {
  delete (mongoose.connection as any).models.Property;
}
export const Property = model("Property", propertySchema);
