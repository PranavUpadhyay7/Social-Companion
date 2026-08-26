"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function parseHSL(hslStr) {
  const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 40, s: 80, l: 80 };
  return {
    h: parseFloat(match[1]),
    s: parseFloat(match[2]),
    l: parseFloat(match[3]),
  };
}

function buildBoxShadow(glowColor, intensity) {
  const { h, s, l } = parseHSL(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const layers = [
    [0, 0, 1, 0, 60, true],
    [0, 0, 6, 0, 40, true],
    [0, 0, 15, 0, 30, true],
    [0, 0, 25, 2, 20, true],
    [0, 0, 50, 2, 10, true],
    [0, 0, 3, 0, 50, false],
    [0, 0, 15, 0, 30, false],
    [0, 0, 50, 2, 10, false],
  ];

  return layers
    .map(([x, y, blur, spread, alpha, inset]) => {
      const opacity = Math.min(alpha * intensity, 100);
      return `${inset ? "inset " : ""}${x}px ${y}px ${blur}px ${spread}px hsl(${base} / ${opacity}%)`;
    })
    .join(", ");
}

const positions = [
  "80% 55%",
  "69% 34%",
  "8% 6%",
  "41% 38%",
  "86% 85%",
  "82% 18%",
  "51% 4%",
];
const colorMap = [0, 1, 2, 0, 1, 2, 1];

function buildMeshGradients(colors) {
  const gradients = positions.map((position, index) => {
    const color = colors[Math.min(colorMap[index], colors.length - 1)];
    return `radial-gradient(at ${position}, ${color} 0px, transparent 50%)`;
  });
  gradients.push(`linear-gradient(${colors[0]} 0 100%)`);
  return gradients;
}

export default function BorderGlow({
  children,
  className = "",
  edgeSensitivity = 30,
  glowColor = "40 80 80",
  backgroundColor = "#120F17",
  borderRadius = 28,
  glowRadius = 40,
  glowIntensity = 1,
  coneSpread = 25,
  animated = false,
  colors = ["#c084fc", "#f472b6", "#38bdf8"],
  fillOpacity = 0.5,
}) {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [cursorAngle, setCursorAngle] = useState(45);
  const [edgeProximity, setEdgeProximity] = useState(0);
  const [sweepActive, setSweepActive] = useState(false);

  const handlePointerMove = useCallback((event) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = x - cx;
    const dy = y - cy;
    const kx = dx === 0 ? Infinity : cx / Math.abs(dx);
    const ky = dy === 0 ? Infinity : cy / Math.abs(dy);
    setEdgeProximity(Math.min(Math.max(1 / Math.min(kx, ky), 0), 1));
    let degrees = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (degrees < 0) degrees += 360;
    setCursorAngle(degrees);
  }, []);

  useEffect(() => {
    if (!animated) return;
    let frame;
    const startedAt = performance.now();
    setSweepActive(true);

    const sweep = (time) => {
      const progress = Math.min((time - startedAt) / 1800, 1);
      setCursorAngle(110 + 355 * progress);
      setEdgeProximity(Math.sin(progress * Math.PI));
      if (progress < 1) frame = requestAnimationFrame(sweep);
      else setSweepActive(false);
    };

    frame = requestAnimationFrame(sweep);
    return () => cancelAnimationFrame(frame);
  }, [animated]);

  const colorSensitivity = edgeSensitivity + 20;
  const isVisible = isHovered || sweepActive;
  const borderOpacity = isVisible
    ? Math.max(
        0,
        (edgeProximity * 100 - colorSensitivity) / (100 - colorSensitivity),
      )
    : 0;
  const glowOpacity = isVisible
    ? Math.max(
        0,
        (edgeProximity * 100 - edgeSensitivity) / (100 - edgeSensitivity),
      )
    : 0;
  const gradients = buildMeshGradients(colors);
  const angle = `${cursorAngle.toFixed(3)}deg`;

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      className={`relative isolate grid border border-white/15 ${className}`}
      style={{
        background: backgroundColor,
        borderRadius: `${borderRadius}px`,
        transform: "translate3d(0, 0, 0.01px)",
      }}
    >
      <div
        className="absolute inset-0 -z-[1] rounded-[inherit]"
        style={{
          border: "1px solid transparent",
          background: [
            `linear-gradient(${backgroundColor} 0 100%) padding-box`,
            ...gradients.map((gradient) => `${gradient} border-box`),
          ].join(", "),
          opacity: borderOpacity,
          maskImage: `conic-gradient(from ${angle} at center, black ${coneSpread}%, transparent ${coneSpread + 15}%, transparent ${100 - coneSpread - 15}%, black ${100 - coneSpread}%)`,
          WebkitMaskImage: `conic-gradient(from ${angle} at center, black ${coneSpread}%, transparent ${coneSpread + 15}%, transparent ${100 - coneSpread - 15}%, black ${100 - coneSpread}%)`,
          transition: isVisible
            ? "opacity 0.25s ease-out"
            : "opacity 0.75s ease-in-out",
        }}
      />

      <div
        className="absolute inset-0 -z-[1] rounded-[inherit]"
        style={{
          background: gradients.join(", "),
          opacity: borderOpacity * fillOpacity,
          mixBlendMode: "soft-light",
          transition: isVisible
            ? "opacity 0.25s ease-out"
            : "opacity 0.75s ease-in-out",
        }}
      />

      <span
        className="pointer-events-none absolute z-[1] rounded-[inherit]"
        style={{
          inset: `${-glowRadius}px`,
          maskImage: `conic-gradient(from ${angle} at center, black 2.5%, transparent 10%, transparent 90%, black 97.5%)`,
          WebkitMaskImage: `conic-gradient(from ${angle} at center, black 2.5%, transparent 10%, transparent 90%, black 97.5%)`,
          opacity: glowOpacity,
          mixBlendMode: "plus-lighter",
          transition: isVisible
            ? "opacity 0.25s ease-out"
            : "opacity 0.75s ease-in-out",
        }}
      >
        <span
          className="absolute rounded-[inherit]"
          style={{
            inset: `${glowRadius}px`,
            boxShadow: buildBoxShadow(glowColor, glowIntensity),
          }}
        />
      </span>

      <div className="relative z-[1] flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
