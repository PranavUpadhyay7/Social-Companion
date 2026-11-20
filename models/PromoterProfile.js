import mongoose from "mongoose";

const linkSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, maxlength: 60 },
    url: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false },
);

const promoterProfileSchema = new mongoose.Schema(
  {
    ownerProfileId: { type: String, required: true, unique: true, index: true },
    accountType: { type: String, enum: ["personal", "business"], default: "personal" },
    fullName: { type: String, trim: true, maxlength: 100, required: true },
    displayName: { type: String, trim: true, maxlength: 120, required: true },
    emailStatus: { type: String, enum: ["unverified", "verified"], default: "unverified" },
    phone: { type: String, trim: true, maxlength: 20, default: "" },
    phoneStatus: { type: String, enum: ["unverified", "demo_verified", "verified"], default: "unverified" },
    identityStatus: { type: String, enum: ["not_started", "demo_pending", "approved", "rejected"], default: "not_started" },
    livenessStatus: { type: String, enum: ["not_started", "demo_pending", "approved", "rejected"], default: "not_started" },
    businessRegistration: { type: String, trim: true, maxlength: 120, default: "" },
    taxIdentifier: { type: String, trim: true, maxlength: 40, default: "", select: false },
    bankStatus: { type: String, enum: ["not_started", "demo_pending", "approved", "rejected"], default: "not_started" },
    website: { type: String, trim: true, maxlength: 500, default: "" },
    instagram: { type: String, trim: true, maxlength: 200, default: "" },
    previousEvents: [linkSchema],
    venueReferences: [{ type: String, trim: true, maxlength: 180 }],
    documentPlaceholders: [{ type: String, trim: true, maxlength: 120, select: false }],
    declarationAcceptedAt: { type: Date, default: null },
    reviewState: {
      type: String,
      enum: ["Draft", "Submitted", "Under Review", "More Information Required", "Approved", "Rejected", "Suspended"],
      default: "Draft",
      index: true,
    },
    internalReviewNotes: { type: String, maxlength: 2000, default: "", select: false },
  },
  { timestamps: true },
);

export default mongoose.models.PromoterProfile || mongoose.model("PromoterProfile", promoterProfileSchema);
