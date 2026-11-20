import mongoose from "mongoose";

const swipeSchema = new mongoose.Schema(
  {
    fromProfileId: { type: String, required: true, index: true },
    toProfileId: { type: String, required: true, index: true },
    decision: { type: String, enum: ["like", "pass"], required: true },
    eventName: { type: String, trim: true, maxlength: 140, default: "" },
  },
  { timestamps: true },
);

swipeSchema.index({ fromProfileId: 1, toProfileId: 1 }, { unique: true });
swipeSchema.index({ fromProfileId: 1, updatedAt: -1 });

export default mongoose.models.Swipe || mongoose.model("Swipe", swipeSchema);
