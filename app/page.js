import CrazyEvents from "@/components/home/CrazyEvents";
import Front from "@/components/home/Front";
import HowItWorks from "@/components/home/HowItWorks";
import HoverFeaturedEvents from "@/components/home/HoverFeaturedEvents";
import SideRays from "@/components/effects/SideRays";

export default function Home() {
  return (
    <div className="relative w-full min-h-screen">
      {/* Background (fixed, covers screen) */}
      {/*  <div className="fixed inset-0 -z-10">
        <LiquidChrome
          baseColor={[0.2, 0.0, 0.0]}
          speed={0.22}
          amplitude={0.25}
          interactive={false}
        />
      </div> */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Top Right */}
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
      {/* Foreground Content */}
      <Front />
      <HowItWorks />
      <HoverFeaturedEvents />
      <CrazyEvents />
    </div>
  );
}
