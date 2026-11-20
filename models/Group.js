import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    ownerProfileId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    eventName: { type: String, required: true, trim: true, maxlength: 140 },
    city: { type: String, required: true, trim: true, maxlength: 80, index: true },
    vibe: { type: String, required: true, trim: true, maxlength: 50, index: true },
    description: { type: String, trim: true, maxlength: 800, default: "" },
    capacity: { type: Number, min: 2, max: 500, default: 8 },
    memberProfileIds: [{ type: String }],
    state: { type: String, enum: ["active", "closed"], default: "active", index: true },
  },
  { timestamps: true },
);

groupSchema.index({ state: 1, city: 1, createdAt: -1 });

export default mongoose.models.Group || mongoose.model("Group", groupSchema);
