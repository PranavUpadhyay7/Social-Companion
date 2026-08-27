import { auth } from "@/auth";
import { logServerError } from "@/lib/securityLog";

export async function getSessionUser() {
  try {
    const session = await auth();
    return session?.user?.id ? session.user : null;
  } catch (error) {
    // Missing or invalid server configuration must fail closed.
    if (process.env.NODE_ENV !== "production") {
      logServerError("Authentication session unavailable", error);
    }
    return null;
  }
}
