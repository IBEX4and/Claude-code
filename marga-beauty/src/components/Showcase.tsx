"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { content } from "@/content";
import { prefersReducedMotion } from "./Experience";
import { RollButton } from "./RollButton";
import { TextReveal } from "./TextReveal";
import { Visual } from "./Visual";

gsap.registerPlugin(ScrollTrigger);

/** "Award Winning Work" da referência: cada área de tratamento sobe sobre a anterior. */
export function Showcase() {
  const t = content.showcase;
  const categories = content.services.categories;
  const dots = useRef<(HTMLSpanElement | null)[]>([]);
  const progress = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const arch = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const steps = categories.length - 1;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#tratamentos",
        start: "10% top",
        end: "bottom bottom",
        scrub: true,
        ...(reduced ? {} : { snap: { snapTo: 1 / steps, duration: { min: 0.2, max: 0.6 }, ease: "power1.inOut" } }),
      },
    });
    gsap.set(progress.current, { scaleY: 0 });
    gsap.set(dots.current[0], { backgroundColor: "#ffffff", borderColor: "#ffffff" });
    dots.current.slice(1).forEach((d) => gsap.set(d, { backgroundColor: "var(--accent-a)", borderColor: "rgba(255,255,255,0.5)" }));
    gsap.set(cards.current, { filter: "brightness(1)" });
    cards.current.slice(1).forEach((c) => gsap.set(c, reduced ? { opacity: 0 } : { yPercent: 100 }));
    tl.to(progress.current, { scaleY: 1, ease: "none", duration: steps }, 0);
    for (let i = 0; i < steps; i++) {
      tl.to(cards.current[i + 1], reduced ? { opacity: 1, ease: "none", duration: 1 } : { yPercent: 0, ease: "power2.inOut", duration: 1 }, i);
      tl.to(cards.current[i], { filter: "brightness(0.3)", ease: "power2.inOut", duration: 1 }, i);
      tl.set(dots.current[i + 1], { backgroundColor: "#ffffff", borderColor: "#ffffff" }, i + 1);
    }

    const extra: gsap.core.Tween[] = [];
    if (!reduced) {
      const trigger = { trigger: "#tratamentos", start: "top bottom", end: "30% bottom", scrub: true };
      extra.push(gsap.to(arch.current, { yPercent: window.innerWidth > 1024 ? -70 : -50, ease: "none", scrollTrigger: trigger }));
      gsap.set(arch.current, { clipPath: "ellipse(150% 100% at 50% 100%)" });
      extra.push(gsap.to(arch.current, { clipPath: "ellipse(60% 100% at 50% 100%)", ease: "power2.out", scrollTrigger: { ...trigger } }));
    }
    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      extra.forEach((e) => {
        e.scrollTrigger?.kill();
        e.kill();
      });
    };
  }, [categories.length]);

  return (
    <section id="tratamentos" className="showcase">
      <div ref={arch} className="showcase__arch" />
      <div className="showcase__stage">
        <TextReveal stagger={0.015}>
          <h2 className="showcase__title">{t.title}</h2>
        </TextReveal>
        <div className="showcase__body">
          <div className="showcase__list">
            <div className="showcase__track" />
            <div ref={progress} className="showcase__progress" />
            <ol>
              {categories.map((c, i) => (
                <li key={c.id}>
                  <span ref={(el) => void (dots.current[i] = el)} className="showcase__dot" />
                  <div>
                    <h3>{c.name}</h3>
                    <p>{c.tags.join("  •  ")}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="showcase__cards">
            {categories.map((c, i) => (
              <div key={c.id} ref={(el) => void (cards.current[i] = el)} className="showcase__card" style={{ zIndex: i + 1 }}>
                <div className="showcase__card-text">
                  <div>
                    <h3>{c.name}</h3>
                    <p>{c.summary}</p>
                  </div>
                  <ul>
                    {c.items.map((item) => (
                      <li key={item.id}>
                        <a href="#agendar" data-book-service={item.id} aria-label={t.bookAria(item.name)}>
                          <span>{item.name}</span>
                          <span>{t.minutes(item.duration)}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                  <RollButton label={t.book} bookService={c.items[0].id} className="roll-btn--dark" />
                </div>
                <Visual id={c.image as "rosto"} className="showcase__card-visual" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="showcase__glow" aria-hidden="true">
        <div />
      </div>
    </section>
  );
}
