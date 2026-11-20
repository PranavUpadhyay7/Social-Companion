import mongoose from "mongoose";

const checkInSchema = new mongoose.Schema(
  {
    eventId: { type: Number, required: true, index: true },
    guestEntryId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, index: true },
    passId: { type: String, required: true, index: true },
    checkedInByProfileId: { type: String, required: true, index: true },
    method: { type: String, enum: ["search", "pass_id", "qr_input"], required: true },
    checkedInAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.models.CheckIn || mongoose.model("CheckIn", checkInSchema);
