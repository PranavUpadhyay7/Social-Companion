import { clubbers } from "@/data/clubbers";
import { currentUserProfile } from "@/data/currentUserProfile";
import Conversation from "@/models/Conversation";
import Match from "@/models/Match";
import Message from "@/models/Message";
import Profile from "@/models/Profile";

const profileFields = {
  profileId: 1,
  name: 1,
  image: 1,
  city: 1,
  age: 1,
  compatibility: 1,
};

function profileMedia(media = []) {
  return media.slice(0, 5).map((item) => ({
    mediaId: item.mediaId || item.id,
    type: item.type,
    src: item.src,
    alt: item.alt || item.name,
  }));
}

export async function seedTrialData(currentUser) {
  if (!currentUser?.id) throw new Error("An authenticated user is required.");

  const currentUserId = String(currentUser.id);
  await Profile.updateOne(
    { profileId: currentUserId },
    {
      $setOnInsert: {
        profileId: currentUserId,
        isCurrentUser: true,
        ...currentUserProfile,
        name: currentUser.name || currentUserProfile.name,
        image: currentUser.image || currentUserProfile.media?.[0]?.src || "",
        media: currentUser.image
          ? [
              {
                mediaId: "google-profile",
                type: "image",
                src: currentUser.image,
                alt: `${currentUser.name || "Member"}'s profile photo`,
              },
            ]
          : profileMedia(currentUserProfile.media),
        featuredMediaId: currentUser.image
          ? "google-profile"
          : currentUserProfile.featuredMediaId || currentUserProfile.media?.[0]?.id || "",
        music: currentUserProfile.partyGenres
          ? currentUserProfile.partyGenres.split(",").map((item) => item.trim())
          : [],
      },
    },
    { upsert: true },
  );

  await Profile.bulkWrite(
    clubbers.map((clubber) => ({
      updateOne: {
        filter: { profileId: String(clubber.id) },
        update: {
          $set: {
            profileId: String(clubber.id),
            name: clubber.name,
            age: clubber.age,
            gender: clubber.gender,
            pronouns: clubber.pronouns,
            city: clubber.city,
            distance: clubber.distance,
            image: clubber.image,
            media: profileMedia(clubber.media),
            featuredMediaId: `${clubber.id}-profile`,
            bio: clubber.bio,
            music: clubber.music,
            favoriteSong: clubber.favoriteSong,
            interests: clubber.interests,
            vibe: clubber.vibe,
            events: clubber.events,
            compatibility: clubber.compatibility,
          },
        },
        upsert: true,
      },
    })),
  );

  const zoya = clubbers.find((clubber) => clubber.name === "Zoya");
  if (!zoya) return;

  const currentProfile = await Profile.findOne({ profileId: currentUserId })
    .select({ trialChatSeeded: 1 })
    .lean();
  if (currentProfile?.trialChatSeeded) return;

  const match = await Match.findOneAndUpdate(
    { userProfileId: currentUserId, vibedProfileId: String(zoya.id) },
    {
      $setOnInsert: {
        userProfileId: currentUserId,
        vibedProfileId: String(zoya.id),
        eventName: zoya.event,
      },
    },
    { upsert: true, returnDocument: "after" },
  );
  const conversation = await Conversation.findOneAndUpdate(
    { matchId: match._id },
    {
      $setOnInsert: {
        matchId: match._id,
        participantIds: [currentUserId, String(zoya.id)],
        eventName: zoya.event,
      },
    },
    { upsert: true, returnDocument: "after" },
  );

  if ((await Message.countDocuments({ conversationId: conversation._id })) === 0) {
    const messages = await Message.create([
      {
        conversationId: conversation._id,
        senderProfileId: String(zoya.id),
        body: "Are you going for the opening set?",
      },
      {
        conversationId: conversation._id,
        senderProfileId: currentUserId,
        body: "Yes, planning to reach around 10.",
        readAt: new Date(),
      },
    ]);
    const last = messages.at(-1);
    await Conversation.updateOne(
      { _id: conversation._id },
      { lastMessageText: last.body, lastMessageAt: last.createdAt },
    );
  }
  await Profile.updateOne(
    { profileId: currentUserId },
    { $set: { trialChatSeeded: true } },
  );
}

export async function serializeConversations(currentUserId) {
  const conversations = await Conversation.find({
    participantIds: currentUserId,
  })
    .sort({ lastMessageAt: -1, createdAt: -1 })
    .lean();

  const otherIds = conversations.map((conversation) =>
    conversation.participantIds.find((id) => id !== currentUserId),
  );
  const profiles = await Profile.find(
    { profileId: { $in: otherIds } },
    profileFields,
  ).lean();
  const profileById = new Map(profiles.map((profile) => [profile.profileId, profile]));

  return Promise.all(
    conversations.map(async (conversation) => {
      const otherId = conversation.participantIds.find(
        (id) => id !== currentUserId,
      );
      const profile = profileById.get(otherId);
      const messages = await Message.find({ conversationId: conversation._id })
        .sort({ createdAt: 1 })
        .limit(100)
        .lean();

      return {
        id: conversation._id.toString(),
        profileId: otherId,
        name: profile?.name || "Clubber",
        image: profile?.image || "",
        city: profile?.city || "Mumbai",
        age: profile?.age || null,
        compatibility: profile?.compatibility || null,
        event: conversation.eventName,
        lastMessageAt: conversation.lastMessageAt?.toISOString() || null,
        messages: messages.map((message) => ({
          id: message._id.toString(),
          from: message.senderProfileId === currentUserId ? "me" : "them",
          text: message.body,
          createdAt: message.createdAt.toISOString(),
          readAt: message.readAt?.toISOString() || null,
        })),
      };
    }),
  );
}
