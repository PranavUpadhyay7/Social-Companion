import ClubbersExperience from "@/components/clubbers/ClubbersExperience";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function ClubbersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/auth?callbackUrl=/clubbers");

  return (
    <main className="relative min-h-[calc(100dvh-5rem)] overflow-hidden px-4 pb-16 pt-7 text-white sm:px-8 sm:pt-10 lg:px-10">
      <ClubbersExperience />
    </main>
  );
}
