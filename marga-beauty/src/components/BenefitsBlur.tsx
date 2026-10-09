"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { content } from "@/content";
import { prefersReducedMotion } from "./Experience";
import { TextReveal } from "./TextReveal";

gsap.registerPlugin(ScrollTrigger);

/**
 * "Trusted by Founders…" da referência: a frase fica fixa no centro e os
 * benefícios da drenagem vêm do fundo (eixo z), passam nítidos e somem.
 */
export function BenefitsBlur() {
  const t = content.benefits;
  const section = useRef<HTMLElement>(null);
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = grid.current;
    if (!el) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>(".benefits__item"));
    if (prefersReducedMotion()) {
      gsap.set(items, { opacity: 0.5 });
      return;
    }
    const desktop = window.innerWidth > 1024;
    const enter = desktop ? 1.5 : 4;
    const exit = desktop ? 1.5 : 3.5;
    const groupGap = enter + 0.4;
    const inner = desktop ? 0.4 : 0.5;
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: section.current, start: "top 20%", end: "bottom center", scrub: true },
    });
    const groups: number[][] = [];
    for (let i = 0; i < items.length; ) {
      const size = Math.min(items.length - i, gsap.utils.random(2, 3, 1));
      groups.push(Array.from({ length: size }, (_, k) => i + k));
      i += size;
    }
    groups.forEach((group, g) => {
      const at = g * groupGap;
      group.forEach((index, k) => {
        const item = items[index];
        const when = at + k * inner;
        gsap.set(item, {
          transformOrigin: "0% 0%",
          opacity: 0,
          x: desktop ? gsap.utils.random(-180, 180) : 0,
          y: gsap.utils.random(-180, 180),
          filter: "blur(10px)",
          z: desktop ? gsap.utils.random(-2200, -1600) : gsap.utils.random(-550, -400),
        });
        tl.to(item, { z: 0, opacity: 1, filter: "blur(0px)", duration: enter }, when).to(
          item,
          {
            filter: "blur(10px)",
            opacity: 0,
            z: desktop ? gsap.utils.random(1400, 1800) : gsap.utils.random(500, 700),
            duration: exit,
          },
          when + enter,
        );
      });
    });
    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <section ref={section} id="beneficios" className="benefits">
      <div className="benefits__sticky">
        <div className="benefits__title">
          <TextReveal stagger={0.015}>
            <h2>{t.title}</h2>
          </TextReveal>
        </div>
      </div>
      <div className="benefits__layer" aria-hidden="true">
        <div ref={grid} className="benefits__grid">
          {t.words.map((word) => (
            <div key={word} className="benefits__item">
              <span>{word}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
