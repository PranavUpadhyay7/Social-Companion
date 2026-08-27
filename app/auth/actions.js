"use server";

import { cookies } from "next/headers";
import { signIn, signOut } from "@/auth";

function safeRedirect(value) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/clubbers";
}

async function startGoogleFlow(mode, formData) {
  const redirectTo = safeRedirect(formData.get("callbackUrl"));
  const cookieStore = await cookies();
  cookieStore.set("scenemates_auth_mode", mode, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });

  await signIn("google", { redirectTo });
}

export async function registerWithGoogle(formData) {
  await startGoogleFlow("register", formData);
}

export async function loginWithGoogle(formData) {
  await startGoogleFlow("login", formData);
}

export async function continueLocalPreview(formData) {
  if (process.env.NODE_ENV === "production") return;
  await signIn("dev-preview", {
    redirectTo: safeRedirect(formData.get("callbackUrl")),
  });
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
