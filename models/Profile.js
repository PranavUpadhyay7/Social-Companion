import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    eventId: { type: Number, required: true },
    status: { type: String, enum: ["going", "interested"], required: true },
  },
  { _id: false },
);

const mediaSchema = new mongoose.Schema(
  {
    mediaId: { type: String, trim: true, maxlength: 120 },
    type: { type: String, enum: ["image", "video"], required: true },
    src: { type: String, required: true, trim: true, maxlength: 2000 },
    alt: { type: String, trim: true, maxlength: 160 },
  },
  { _id: false },
);

const profileSchema = new mongoose.Schema(
  {
    profileId: { type: String, required: true, unique: true, index: true },
    isCurrentUser: { type: Boolean, default: false },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    age: { type: Number, min: 18, max: 100 },
    gender: { type: String, trim: true, maxlength: 40 },
    pronouns: { type: String, trim: true, maxlength: 30 },
    city: { type: String, trim: true, maxlength: 100 },
    distance: { type: String, trim: true, maxlength: 40 },
    image: { type: String, trim: true },
    media: {
      type: [mediaSchema],
      validate: {
        validator: (items) => items.length <= 5,
        message: "A profile can contain up to five media uploads.",
      },
    },
    featuredMediaId: { type: String, trim: true, maxlength: 120, default: "" },
    trialChatSeeded: { type: Boolean, default: false },
    bio: { type: String, trim: true, maxlength: 500 },
    music: [{ type: String, maxlength: 50 }],
    favoriteSong: { type: String, trim: true, maxlength: 120 },
    partyGenres: { type: String, trim: true, maxlength: 180 },
    nightlifeStyle: { type: String, trim: true, maxlength: 180 },
    interests: [{ type: String, maxlength: 50 }],
    vibe: { type: String, trim: true, maxlength: 120 },
    events: [eventSchema],
    compatibility: { type: Number, min: 0, max: 100 },
  },
  { timestamps: true },
);

export default mongoose.models.Profile || mongoose.model("Profile", profileSchema);
