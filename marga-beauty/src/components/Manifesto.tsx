"use client";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { content } from "@/content";

/** Parágrafo grande que vai "acendendo" palavra por palavra conforme a rolagem. */
export function Manifesto() {
  const root = useRef<HTMLElement>(null);
  const words = content.manifesto.text.split(" ");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".manifesto__word",
          { opacity: 0.16 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.1,
            scrollTrigger: { trigger: ".manifesto__text", start: "top 78%", end: "bottom 42%", scrub: true },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="manifesto" className="manifesto">
      <p className="manifesto__text">
        {words.map((word, i) => (
          <span key={i} className="manifesto__word">
            {word}{" "}
          </span>
        ))}
      </p>
    </section>
  );
}
