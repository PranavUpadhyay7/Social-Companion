import { connectMongo } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/session";
import RoleAssignment from "@/models/RoleAssignment";

export async function getAccessContext() {
  const user = await getSessionUser();
  if (!user) return null;
  await connectMongo();
  const assignment = await RoleAssignment.findOne({ profileId: String(user.id) }).lean();
  return {
    user,
    profileId: String(user.id),
    roles: new Set(["user", ...(assignment?.roles || [])]),
    assignedEventIds: new Set(assignment?.assignedEventIds || []),
  };
}

export function hasRole(access, ...roles) {
  return Boolean(access && roles.some((role) => access.roles.has(role)));
}

export async function ensureRole(profileId, role) {
  await connectMongo();
  await RoleAssignment.updateOne(
    { profileId },
    { $setOnInsert: { profileId }, $addToSet: { roles: role } },
    { upsert: true },
  );
}
