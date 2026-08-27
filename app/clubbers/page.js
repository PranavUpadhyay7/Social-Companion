import SideRays from "@/components/effects/SideRays";
import ClubbersExperience from "@/components/clubbers/ClubbersExperience";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function ClubbersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/auth?callbackUrl=/clubbers");

  return (
    <main className="relative min-h-[calc(100dvh-5rem)] overflow-hidden px-4 pb-16 pt-7 text-white sm:px-8 sm:pt-10 lg:px-10">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <SideRays
          origin="top-right"
          speed={2.5}
          rayColor1="#ffffff"
          rayColor2="#a95bf4"
          intensity={2.5}
          spread={1.2}
          tilt={-35}
          saturation={1.5}
          blend={0.75}
          falloff={0.5}
          opacity={1}
        />
      </div>
      <ClubbersExperience />
    </main>
  );
}
