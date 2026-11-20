import CrazyEvents from "@/components/home/CrazyEvents";
import Front from "@/components/home/Front";
import ForPromoters from "@/components/home/ForPromoters";
import HowItWorks from "@/components/home/HowItWorks";
import HoverFeaturedEvents from "@/components/home/HoverFeaturedEvents";
import NightCoverflow from "@/components/home/NightCoverflow";
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
          speed={1.5}
          rayColor1="#ffffff"
          rayColor2="#a95bf4"
          intensity={2}
          spread={0.2}
          tilt={10}
          saturation={1.5}
          blend={0.7}
          falloff={1}
          opacity={1}
        />
      </div>
      {/* Foreground Content */}
      <Front />
      <ForPromoters />
      <HowItWorks />
      <NightCoverflow />
      <HoverFeaturedEvents />
      <CrazyEvents />
    </div>
  );
}
