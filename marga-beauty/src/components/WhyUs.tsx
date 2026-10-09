"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { content } from "@/content";
import { prefersReducedMotion } from "./Experience";
import { HeartIcon, SparklesIcon, ZapIcon } from "./Icons";
import { TextReveal } from "./TextReveal";

gsap.registerPlugin(ScrollTrigger);

const icons = { sparkles: SparklesIcon, zap: ZapIcon, heart: HeartIcon };

/** "Why Work With Me?" da referência: três colunas com linha que preenche no hover. */
export function WhyUs() {
  const t = content.why;
  const lines = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    gsap.set(lines.current, { scaleX: 0, transformOrigin: "left center" });
    if (prefersReducedMotion()) {
      gsap.set(".why__card", { opacity: 1, yPercent: 0 });
      return;
    }
    const tween = gsap.fromTo(
      ".why__card",
      { opacity: 0, yPercent: 10 },
      { opacity: 1, yPercent: 0, stagger: 0.05, ease: "power2.out", scrollTrigger: { trigger: "#porque", start: "top top" } },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  const fill = (i: number, on: boolean) => {
    const el = lines.current[i];
    if (!el) return;
    gsap.killTweensOf(el);
    gsap.set(el, { transformOrigin: on ? "left center" : "right center" });
    gsap.to(el, { scaleX: on ? 1 : 0, duration: 0.55, ease: "power2.out" });
  };

  return (
    <section id="porque" className="why">
      <div className="why__head">
        <TextReveal stagger={0.015}>
          <h2 className="section-title">{t.title}</h2>
        </TextReveal>
        <TextReveal splitBy="lines">
          <p className="why__subtitle">{t.subtitle}</p>
        </TextReveal>
      </div>
      <div className="why__grid">
        {t.items.map((item, i) => {
          const Icon = icons[item.icon as keyof typeof icons];
          return (
            <div key={item.title} className="why__card" onMouseEnter={() => fill(i, true)} onMouseLeave={() => fill(i, false)}>
              <div>
                <Icon size={50} className="why__icon" />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
              <div className="why__line">
                <span ref={(el) => void (lines.current[i] = el)} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
