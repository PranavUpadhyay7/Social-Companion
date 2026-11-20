import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    eventId: { type: Number, required: true, unique: true, index: true },
    ownerProfileId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    shortTitle: { type: String, required: true, trim: true, maxlength: 45 },
    category: {
      type: String,
      enum: ["NIGHTLIFE", "MUSIC", "FOOD", "COMEDY", "TECH"],
      required: true,
    },
    city: { type: String, required: true, trim: true, maxlength: 80, index: true },
    venue: { type: String, required: true, trim: true, maxlength: 140 },
    description: { type: String, trim: true, maxlength: 3000, default: "" },
    exactVenueAddress: { type: String, trim: true, maxlength: 300, default: "" },
    venueContact: { type: String, trim: true, maxlength: 120, default: "", select: false },
    artistDetails: { type: String, trim: true, maxlength: 1500, default: "" },
    artistInstagram: { type: String, trim: true, maxlength: 160, default: "" },
    minimumAge: { type: Number, enum: [0, 18, 21, 25], default: 18 },
    dressCode: {
      type: String,
      enum: ["No dress code", "Casual", "Smart casual", "Partywear", "Formal", "Traditional / festive", "Venue-specific"],
      default: "Smart casual",
    },
    capacity: { type: Number, min: 1, max: 1_000_000, default: 100 },
    tableInformation: { type: String, trim: true, maxlength: 1200, default: "" },
    entryConditions: { type: String, trim: true, maxlength: 1200, default: "" },
    refundPolicy: { type: String, trim: true, maxlength: 1600, default: "" },
    dateISO: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    time: { type: String, required: true, trim: true, maxlength: 80 },
    priceAmount: { type: Number, required: true, min: 0, max: 1_000_000 },
    distance: { type: Number, min: 0, max: 1000, default: 0 },
    image: { type: String, required: true, trim: true, maxlength: 240 },
    imageMediaId: { type: String, required: true, trim: true, maxlength: 120 },
    status: {
      type: String,
      enum: ["Draft", "Verification Pending", "Venue Confirmation Pending", "Changes Required", "Venue Confirmed", "Published", "Cancelled", "Completed", "Suspended", "archived", "published"],
      default: "Draft",
      index: true,
    },
    venueConfirmation: {
      state: { type: String, enum: ["not_requested", "requested", "approved", "disputed"], default: "not_requested" },
      requestedAt: { type: Date, default: null },
      respondedAt: { type: Date, default: null },
      responseNote: { type: String, trim: true, maxlength: 1000, default: "", select: false },
      responseMode: { type: String, enum: ["none", "internal_demo", "venue_portal"], default: "none" },
    },
    guestListSettings: {
      enabled: { type: Boolean, default: false },
      capacity: { type: Number, min: 1, max: 1_000_000, default: 100 },
      closesAt: { type: Date, default: null },
      entryType: { type: String, enum: ["Free", "Payment Required", "Invite Only"], default: "Free" },
      plusOneAllowance: { type: Number, min: 0, max: 5, default: 0 },
      entryInstructions: { type: String, trim: true, maxlength: 1000, default: "" },
      referralCode: { type: String, trim: true, maxlength: 80, default: "" },
    },
    internalReviewNotes: { type: String, maxlength: 2000, default: "", select: false },
  },
  { timestamps: true },
);

eventSchema.index({ status: 1, city: 1, dateISO: 1 });
eventSchema.index({ ownerProfileId: 1, createdAt: -1 });

export default mongoose.models.Event || mongoose.model("Event", eventSchema);
