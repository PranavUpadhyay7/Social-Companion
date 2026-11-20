import mongoose from "mongoose";

const riskFlagSchema = new mongoose.Schema(
  {
    eventId: { type: Number, required: true, index: true },
    promoterProfileId: { type: String, required: true, index: true },
    rule: {
      type: String,
      enum: ["large_new_promoter", "unusual_price", "venue_mismatch", "duplicate_artwork", "last_minute_change", "complaint_spike", "suspicious_sales", "reused_banned_details"],
      required: true,
    },
    severity: { type: String, enum: ["low", "medium", "high"], required: true },
    explanation: { type: String, required: true, maxlength: 500 },
    state: { type: String, enum: ["open", "reviewing", "cleared", "actioned"], default: "open" },
    internalNotes: { type: String, maxlength: 2000, default: "", select: false },
  },
  { timestamps: true },
);

riskFlagSchema.index({ eventId: 1, rule: 1 }, { unique: true });

export default mongoose.models.RiskFlag || mongoose.model("RiskFlag", riskFlagSchema);
