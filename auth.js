import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import authMongoClient from "@/lib/authMongo";

const googleConfigured = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
);

if (process.env.NODE_ENV === "production") {
  if (!process.env.AUTH_SECRET || Buffer.byteLength(process.env.AUTH_SECRET) < 32) {
    throw new Error("AUTH_SECRET must contain at least 32 bytes in production.");
  }
  if (!googleConfigured) {
    throw new Error("Google OAuth credentials are required in production.");
  }
}
const previewAuthEnabled =
  process.env.NODE_ENV !== "production" && !googleConfigured;

// Keep the development fallback stable across hot reloads and server restarts.
// A newly generated in-memory secret invalidates every existing JWT whenever
// Next.js reloads this module. Production intentionally still requires its own
// independent AUTH_SECRET.
const developmentAuthSecret =
  process.env.NODE_ENV !== "production"
    ? createHash("sha256")
        .update(
          `scenemates-local-session:${process.env.AUTH_GOOGLE_SECRET || "preview-only"}`,
        )
        .digest("hex")
    : undefined;
const authSecret =
  process.env.AUTH_SECRET || developmentAuthSecret;

const mongoAdapter = MongoDBAdapter(authMongoClient);

// SceneMates only needs Google for identity. Provider access and refresh tokens
// are deliberately excluded from the database to reduce breach impact.
const privacyFocusedAdapter = {
  ...mongoAdapter,
  async linkAccount(account) {
    const identityAccount = { ...account };
    [
      "access_token",
      "refresh_token",
      "id_token",
      "expires_at",
      "expires_in",
      "token_type",
      "scope",
      "session_state",
    ].forEach((field) => delete identityAccount[field]);

    return mongoAdapter.linkAccount(identityAccount);
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: privacyFocusedAdapter,
  secret: authSecret,
  trustHost:
    process.env.NODE_ENV !== "production" ||
    process.env.AUTH_TRUST_HOST === "true",
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 14,
  },
  cookies: {
    sessionToken: {
      // Use an app-specific cookie so JWTs issued by the old unstable secret
      // are ignored instead of producing a decryption error on every request.
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-scenemates.v2.session-token"
          : "scenemates.v2.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    ...(googleConfigured
      ? [
        Google({
          clientId: process.env.AUTH_GOOGLE_ID,
          clientSecret: process.env.AUTH_GOOGLE_SECRET,
          authorization: {
            params: {
              scope: "openid email profile",
              prompt: "select_account",
            },
          },
        }),
      ]
      : []),
    ...(previewAuthEnabled
      ? [
          Credentials({
            id: "dev-preview",
            name: "Local preview",
            credentials: {},
            authorize() {
              return {
                id: "local-preview-member",
                name: "SceneMates Preview",
              };
            },
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "dev-preview" && previewAuthEnabled) return true;
      if (account?.provider !== "google") return false;
      if (!profile?.email || profile.email_verified !== true) return false;

      const client = await authMongoClient.connect();
      const registeredUser = await client
        .db()
        .collection("users")
        .findOne({ email: profile.email }, { projection: { _id: 1 } });

      const cookieStore = await cookies();
      const authMode = cookieStore.get("scenemates_auth_mode")?.value;
      cookieStore.delete("scenemates_auth_mode");
      if (authMode === "login") {
        return registeredUser ? true : "/auth?error=NotRegistered";
      }
      if (authMode === "register" && registeredUser) {
        return "/auth?error=AlreadyRegistered";
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (!session.user || !token.sub) return session;

      // The browser receives only the minimum identity fields needed by the UI.
      session.user = {
        id: token.sub,
        name: session.user.name || "SceneMates member",
        image: session.user.image || null,
      };
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        // Reject malformed and external callback URLs.
      }
      return baseUrl;
    },
  },
});

export { googleConfigured, previewAuthEnabled };
