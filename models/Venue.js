import mongoose from "mongoose";

const venueSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 140 },
    city: { type: String, required: true, trim: true, maxlength: 80, index: true },
    address: { type: String, required: true, trim: true, maxlength: 300 },
    contactName: { type: String, trim: true, maxlength: 100, default: "" },
    contactPhone: { type: String, trim: true, maxlength: 20, default: "", select: false },
    representativeProfileIds: [{ type: String, index: true }],
    trustState: { type: String, enum: ["unreviewed", "trusted", "restricted"], default: "unreviewed" },
  },
  { timestamps: true },
);

venueSchema.index({ name: 1, city: 1 }, { unique: true });

export default mongoose.models.Venue || mongoose.model("Venue", venueSchema);
