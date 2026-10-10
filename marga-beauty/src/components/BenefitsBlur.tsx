"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { content } from "@/content";
import { isCompactLayout, prefersReducedMotion } from "./Experience";
import { TextReveal } from "./TextReveal";

gsap.registerPlugin(ScrollTrigger);

/**
 * "Trusted by Founders…" da referência: a frase no centro e os benefícios da
 * drenagem vindo do fundo (eixo z), passando nítidos e sumindo, em loop.
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
    const desktop = !isCompactLayout();
    // Loop contínuo, no tempo (não depende da rolagem): cada palavra vem do fundo,
    // passa nítida e some, em turnos escalonados, sempre com algumas na tela.
    const enter = desktop ? 2.2 : 2.6;
    const exit = desktop ? 2.2 : 2.4;
    const spacing = desktop ? 0.9 : 1.1;
    const period = items.length * spacing;
    const order = gsap.utils.shuffle(items.map((_, i) => i));
    const place = (item: HTMLElement) =>
      gsap.set(item, {
        transformOrigin: "0% 0%",
        opacity: 0,
        x: desktop ? gsap.utils.random(-180, 180) : 0,
        y: gsap.utils.random(-180, 180),
        filter: "blur(10px)",
        z: desktop ? gsap.utils.random(-2200, -1600) : gsap.utils.random(-550, -400),
      });
    const loops = order.map((index, slot) => {
      const item = items[index];
      place(item);
      return gsap
        .timeline({
          paused: true,
          repeat: -1,
          repeatDelay: Math.max(0, period - enter - exit),
          delay: slot * spacing,
          defaults: { ease: "none" },
          // A cada volta a palavra surge de outro ponto.
          onRepeat: () => place(item),
        })
        .to(item, { z: 0, opacity: 1, filter: "blur(0px)", duration: enter })
        .to(item, {
          filter: "blur(10px)",
          opacity: 0,
          z: desktop ? gsap.utils.random(1400, 1800) : gsap.utils.random(500, 700),
          duration: exit,
        });
    });
    // Só anima enquanto a seção está na tela.
    const trigger = ScrollTrigger.create({
      trigger: section.current,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => loops.forEach((tl) => (self.isActive ? tl.play() : tl.pause())),
    });
    return () => {
      trigger.kill();
      loops.forEach((tl) => tl.kill());
    };
  }, []);

  return (
    <section ref={section} id="beneficios" className="benefits" data-snap>
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
