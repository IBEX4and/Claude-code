"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Letras (ou linhas) sobem de dentro de uma máscara, como na referência:
 * yPercent 100 → 0, power3.out, 0,5 s, disparando quando o topo chega a 85% da tela.
 */
export function TextReveal({
  children,
  splitBy = "chars",
  stagger,
  duration = 0.5,
  delay = 0,
  start = true,
  animateOnScroll = true,
}: {
  children: React.ReactElement;
  splitBy?: "chars" | "lines";
  stagger?: number;
  duration?: number;
  delay?: number;
  /** Só anima quando vira true (usado na entrada do hero). */
  start?: boolean;
  animateOnScroll?: boolean;
}) {
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapper.current;
    const target = el?.firstElementChild as HTMLElement | null;
    if (!el || !target || !start) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      const tween = gsap.fromTo(
        el,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          delay,
          scrollTrigger: animateOnScroll ? { trigger: el, start: "top 85%", once: true } : undefined,
        },
      );
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    }

    let split: SplitText | undefined;
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      gsap.set(el, { opacity: 1 });
      split = SplitText.create(target, {
        type: splitBy === "lines" ? "lines" : "lines,chars",
        mask: splitBy === "lines" ? "lines" : "chars",
        linesClass: "reveal-line",
        charsClass: "reveal-char",
        autoSplit: true,
        onSplit(self) {
          if (splitBy === "chars") {
            for (const mask of self.masks as HTMLElement[]) {
              mask.style.paddingInline = "0.04em";
              mask.style.marginInline = "-0.04em";
              mask.style.boxSizing = "content-box";
            }
          }
          const items = splitBy === "lines" ? self.lines : self.chars;
          return gsap.fromTo(
            items,
            { yPercent: 100, willChange: "transform" },
            {
              yPercent: 0,
              duration,
              stagger: stagger ?? (splitBy === "lines" ? 0.1 : 0.03),
              ease: "power3.out",
              delay,
              scrollTrigger: animateOnScroll ? { trigger: el, start: "top 85%", end: "bottom 68%" } : undefined,
            },
          );
        },
      });
    };

    const fonts = document.fonts;
    if (fonts?.ready) fonts.ready.then(run, run);
    else run();

    return () => {
      cancelled = true;
      split?.revert();
    };
  }, [start, splitBy, stagger, duration, delay, animateOnScroll]);

  return (
    <div ref={wrapper} className="text-reveal">
      {children}
    </div>
  );
}
