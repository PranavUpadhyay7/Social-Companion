import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    userProfileId: { type: String, required: true, index: true },
    vibedProfileId: { type: String, required: true, index: true },
    eventName: { type: String, required: true, trim: true, maxlength: 140 },
    status: { type: String, enum: ["vibed"], default: "vibed" },
  },
  { timestamps: true },
);

matchSchema.index({ userProfileId: 1, vibedProfileId: 1 }, { unique: true });

export default mongoose.models.Match || mongoose.model("Match", matchSchema);

