"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export function FlowSection({
  className,
  innerClassName,
  style = {},
  children,
  ...props
}) {
  return (
    <section
      data-flow-section
      className={cx(
        "relative min-h-[100dvh] w-full overflow-hidden",
        className,
      )}
      {...props}
    >
      <div
        data-flow-inner
        className={cx(
          "flow-art-container relative flex will-change-transform",
          innerClassName || "min-h-[100dvh] w-full",
        )}
        style={{ transformOrigin: "bottom left", ...style }}
      >
        {children}
      </div>
    </section>
  );
}

export default function FlowArt({ children, className, ...props }) {
  const containerRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useGSAP(
    () => {
      if (!containerRef.current || reducedMotion) return undefined;

      const sections = Array.from(
        containerRef.current.querySelectorAll("[data-flow-section]"),
      );
      const triggers = [];

      sections.forEach((section, index) => {
        gsap.set(section, { zIndex: index + 1 });
        const inner = section.querySelector("[data-flow-inner]");
        if (!inner) return;

        if (index > 0) {
          const tween = gsap.fromTo(
            inner,
            { rotation: 30, transformOrigin: "bottom left" },
            {
              rotation: 0,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "top 24%",
                scrub: true,
              },
            },
          );
          if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
        }

        if (index < sections.length - 1) {
          triggers.push(
            ScrollTrigger.create({
              trigger: section,
              start: "top top",
              endTrigger: sections[sections.length - 1],
              end: "top top",
              pin: true,
              pinSpacing: false,
              anticipatePin: 1,
            }),
          );
        }
      });

      ScrollTrigger.refresh();
      return () => triggers.forEach((trigger) => trigger.kill());
    },
    { scope: containerRef, dependencies: [reducedMotion] },
  );

  return (
    <main
      ref={containerRef}
      className={cx("w-full overflow-x-hidden", className)}
      {...props}
    >
      {children}
    </main>
  );
}
