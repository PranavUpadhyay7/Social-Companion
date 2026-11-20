import mongoose from "mongoose";

const guestEntrySchema = new mongoose.Schema(
  {
    eventId: { type: Number, required: true, index: true },
    promoterProfileId: { type: String, required: true, index: true },
    userProfileId: { type: String, default: "", index: true },
    source: { type: String, enum: ["public_request", "promoter_invitation", "platform_user"], required: true },
    referralCode: { type: String, trim: true, maxlength: 80, index: true },
    guestName: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, trim: true, maxlength: 20, default: "", select: false },
    phoneVerified: { type: Boolean, default: false },
    plusOnes: { type: Number, min: 0, max: 5, default: 0 },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Payment Required", "Confirmed", "Checked In", "Declined", "Cancelled"],
      default: "Pending",
      index: true,
    },
    paymentStatus: { type: String, enum: ["Not Required", "Pending", "Paid", "Refunded"], default: "Not Required" },
    checkInStatus: { type: String, enum: ["Not Checked In", "Checked In"], default: "Not Checked In" },
    notes: { type: String, trim: true, maxlength: 500, default: "", select: false },
    passId: { type: String, unique: true, sparse: true, index: true },
    passValueHash: { type: String, default: "", select: false },
    arrivalDeadline: { type: Date, default: null },
    checkedInAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true },
);

guestEntrySchema.index({ eventId: 1, status: 1, createdAt: -1 });

export default mongoose.models.GuestEntry || mongoose.model("GuestEntry", guestEntrySchema);
