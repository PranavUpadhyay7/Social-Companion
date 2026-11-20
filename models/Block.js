import mongoose from "mongoose";

const blockSchema = new mongoose.Schema(
  {
    blockerProfileId: { type: String, required: true, index: true },
    blockedProfileId: { type: String, required: true, index: true },
  },
  { timestamps: true },
);

blockSchema.index({ blockerProfileId: 1, blockedProfileId: 1 }, { unique: true });

export default mongoose.models.Block || mongoose.model("Block", blockSchema);
