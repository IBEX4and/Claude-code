"use client";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

/** Foto dentro de uma moldura fixa; a imagem desliza mais devagar que a página. */
export function ParallaxImage({
  src,
  alt,
  width,
  height,
  className = "",
  strength = 12,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  strength?: number;
}) {
  const frame = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "img",
          { yPercent: -strength },
          {
            yPercent: strength,
            ease: "none",
            scrollTrigger: { trigger: frame.current, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: frame },
  );

  return (
    <div ref={frame} className={`parallax ${className}`} style={{ "--s": strength } as React.CSSProperties}>
      <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
    </div>
  );
}
