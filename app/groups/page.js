import SideRays from "@/components/effects/SideRays";
import GroupsExplorer from "@/components/groups/GroupsExplorer";

export default function GroupsPage() {
  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden text-white">
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
      <GroupsExplorer />
    </main>
  );
}
