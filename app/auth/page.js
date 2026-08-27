import Link from "next/link";
import { redirect } from "next/navigation";
import { googleConfigured, previewAuthEnabled } from "@/auth";
import SideRays from "@/components/effects/SideRays";
import { getSessionUser } from "@/lib/session";
import {
  continueLocalPreview,
  loginWithGoogle,
  registerWithGoogle,
} from "./actions";

const messages = {
  NotRegistered: "This Google account is not registered yet. Register it first.",
  AlreadyRegistered: "This Google account is already registered. Log in instead.",
  AccessDenied: "Google could not verify this account. Please try again.",
  OAuthAccountNotLinked: "Use the same Google account you registered with.",
  Configuration: "Sign in is temporarily unavailable. Please try again shortly.",
};

export default async function AuthPage({ searchParams }) {
  const params = await searchParams;
  const callbackUrl =
    typeof params?.callbackUrl === "string" &&
    params.callbackUrl.startsWith("/") &&
    !params.callbackUrl.startsWith("//") &&
    !params.callbackUrl.startsWith("/auth")
      ? params.callbackUrl
      : "/clubbers";
  const user = await getSessionUser();
  if (user) redirect(callbackUrl);

  const errorMessage = params?.error
    ? messages[params.error] || "Authentication failed. Please try again."
    : "";

  return (
    <main className="relative flex min-h-[calc(100dvh-5rem)] items-center overflow-hidden px-5 py-10 text-white sm:px-8 lg:px-10">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <SideRays
          origin="top-right"
          speed={2.2}
          rayColor1="#ffffff"
          rayColor2="#a95bf4"
          intensity={2.2}
          spread={1.1}
          tilt={-32}
          saturation={1.35}
          blend={0.72}
          falloff={0.55}
          opacity={0.9}
        />
      </div>

      <section className="mx-auto grid w-full max-w-[1180px] items-end gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
        <div className="pb-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#c58aff]">
            SceneMates Clubbers
          </p>
          <h1 className="mt-5 max-w-[720px] text-[clamp(3.7rem,7vw,7.2rem)] font-medium leading-[0.88] tracking-[-0.07em] text-white">
            Meet before the music starts.
          </h1>
          <p className="mt-7 max-w-[520px] text-base leading-7 text-zinc-400">
            Discover people heading to your events, vibe with the right match and keep the conversation going after the night.
          </p>
        </div>

        <div className="rounded-2xl border border-white/12 bg-[#0a0a0d] p-6 shadow-[0_28px_90px_rgba(24,5,36,0.46)] sm:p-8">
          <h2 className="text-2xl font-medium tracking-[-0.04em] text-white">
            Enter Clubbers
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Your profile, vibes and conversations stay connected to your account.
          </p>

          {errorMessage && (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm leading-5 text-red-200"
            >
              {errorMessage}
            </p>
          )}

          {googleConfigured ? (
            <div className="mt-7 grid gap-3">
              <form action={registerWithGoogle}>
                <input type="hidden" name="callbackUrl" value={callbackUrl} />
                <button
                  type="submit"
                  className="flex min-h-12 w-full items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-zinc-950 transition hover:bg-[#d8b4fe] active:scale-[0.98]"
                >
                  Register with Google
                </button>
              </form>
              <form action={loginWithGoogle}>
                <input type="hidden" name="callbackUrl" value={callbackUrl} />
                <button
                  type="submit"
                  className="flex min-h-12 w-full items-center justify-center rounded-full border border-white/20 px-6 text-sm font-semibold text-white transition hover:border-[#c58aff] hover:text-[#d8b4fe] active:scale-[0.98]"
                >
                  Log in with Google
                </button>
              </form>
            </div>
          ) : previewAuthEnabled ? (
            <form action={continueLocalPreview} className="mt-7">
              <input type="hidden" name="callbackUrl" value={callbackUrl} />
              <button
                type="submit"
                className="flex min-h-12 w-full items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-zinc-950 transition hover:bg-[#d8b4fe] active:scale-[0.98]"
              >
                Continue to local preview
              </button>
              <p className="mt-4 text-xs leading-5 text-zinc-600">
                This local account is available only during development.
              </p>
            </form>
          ) : (
            <p className="mt-7 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm leading-5 text-red-200">
              Sign in is temporarily unavailable.
            </p>
          )}

          <p className="mt-7 text-xs leading-5 text-zinc-600">
            SceneMates never receives your Google password.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex text-xs font-medium text-zinc-400 transition hover:text-white"
          >
            Return home
          </Link>
        </div>
      </section>
    </main>
  );
}
