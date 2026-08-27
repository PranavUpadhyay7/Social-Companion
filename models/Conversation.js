import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
      unique: true,
      index: true,
    },
    participantIds: [{ type: String, required: true }],
    eventName: { type: String, required: true, trim: true, maxlength: 140 },
    lastMessageText: { type: String, trim: true, maxlength: 1200, default: "" },
    lastMessageAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
);

export default mongoose.models.Conversation ||
  mongoose.model("Conversation", conversationSchema);

