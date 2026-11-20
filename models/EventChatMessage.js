import mongoose from "mongoose";

const eventChatMessageSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "EventChatRoom", required: true, index: true },
    eventId: { type: Number, required: true, index: true },
    senderProfileId: { type: String, required: true, index: true },
    body: { type: String, required: true, trim: true, maxlength: 1200 },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true },
);

eventChatMessageSchema.index({ roomId: 1, createdAt: -1 });

export default mongoose.models.EventChatMessage || mongoose.model("EventChatMessage", eventChatMessageSchema);
