import CrazyEvents from "./Components/CrazyEvents";
import Front from "./Components/Front";
import LiquidChrome from "./Components/LiquidChrome";

export default function Home() {
  return (
    <div className="relative w-full min-h-screen">
      {/* Background (fixed, covers screen) */}
      <div className="fixed inset-0 -z-10">
        <LiquidChrome
          baseColor={[0.1, 0.0, 0.2]}
          speed={0.22}
          amplitude={0.15}
          interactive={false}
        />
      </div>
      {/* Foreground Content */}
      <Front />
      <CrazyEvents />
      <div className="" /> {/* just for testing scroll */}
    </div>
  );
}
