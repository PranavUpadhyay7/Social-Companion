import mongoose from "mongoose";

const eventChatRoomSchema = new mongoose.Schema(
  {
    eventId: { type: Number, required: true, unique: true, index: true },
    eventName: { type: String, required: true, trim: true, maxlength: 140 },
    closesAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true },
);

export default mongoose.models.EventChatRoom || mongoose.model("EventChatRoom", eventChatRoomSchema);
