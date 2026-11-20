import mongoose from "mongoose";

const trustReportSchema = new mongoose.Schema(
  {
    reporterProfileId: { type: String, required: true, index: true },
    targetType: { type: String, enum: ["promoter", "event"], required: true },
    targetId: { type: String, required: true, trim: true, maxlength: 120, index: true },
    reason: {
      type: String,
      enum: ["Promoter concern", "Event concern", "Misleading information", "Payment concern", "Venue mismatch", "Cancellation issue"],
      required: true,
    },
    details: { type: String, required: true, trim: true, maxlength: 1200 },
    status: { type: String, enum: ["Received", "Triaged", "Investigating", "Resolved", "Dismissed"], default: "Received", index: true },
    internalNotes: { type: String, maxlength: 2000, default: "", select: false },
  },
  { timestamps: true },
);

export default mongoose.models.TrustReport || mongoose.model("TrustReport", trustReportSchema);
