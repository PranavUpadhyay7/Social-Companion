import mongoose from "mongoose";

const roleAssignmentSchema = new mongoose.Schema(
  {
    profileId: { type: String, required: true, unique: true, index: true },
    roles: [{ type: String, enum: ["user", "promoter", "venue_representative", "door_staff", "platform_admin"] }],
    assignedEventIds: [{ type: Number }],
  },
  { timestamps: true },
);

export default mongoose.models.RoleAssignment || mongoose.model("RoleAssignment", roleAssignmentSchema);
