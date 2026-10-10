"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { content } from "@/content";
import { prefersReducedMotion } from "./Experience";
import { TextReveal } from "./TextReveal";

gsap.registerPlugin(ScrollTrigger);

function FaqItem({ question, answer, open, onToggle, id }: { question: string; answer: string; open: boolean; onToggle: () => void; id: string }) {
  const outer = useRef<HTMLDivElement>(null);
  const lastHeight = useRef(0);
  const first = useRef(true);

  useLayoutEffect(() => {
    const el = outer.current;
    if (!el) return;
    const duration = prefersReducedMotion() || first.current ? 0 : 0.5;
    first.current = false;
    gsap.killTweensOf(el);
    if (open) {
      gsap.set(el, { overflow: "hidden", height: "auto" });
      const h = el.scrollHeight;
      lastHeight.current = h;
      gsap.fromTo(el, { height: 0 }, { height: h, duration, ease: "power3.out", onComplete: () => void gsap.set(el, { height: "auto", overflow: "visible" }) });
    } else {
      gsap.set(el, { overflow: "hidden" });
      gsap.fromTo(el, { height: lastHeight.current || el.scrollHeight }, { height: 0, duration, ease: "power3.out" });
    }
  }, [open]);

  return (
    <div className={`faq__item${open ? " is-open" : ""}`}>
      <h3>
        <button type="button" className="faq__question" aria-expanded={open} aria-controls={`${id}-answer`} id={`${id}-q`} onClick={onToggle}>
          <span>{question}</span>
          <span className="faq__icon" aria-hidden="true">
            <span className="faq__bar" />
            <span className="faq__bar faq__bar--v" />
            <span className="faq__icon-fill" />
          </span>
        </button>
      </h3>
      <div ref={outer} id={`${id}-answer`} role="region" aria-labelledby={`${id}-q`} className="faq__answer" style={{ height: open ? "auto" : 0, overflow: open ? "visible" : "hidden" }}>
        <p>{answer}</p>
      </div>
    </div>
  );
}

export function Faq() {
  const t = content.faq;
  const [open, setOpen] = useState(0);
  const rows = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const els = rows.current.filter(Boolean);
    if (prefersReducedMotion()) {
      gsap.set(els, { opacity: 1, y: 0 });
      return;
    }
    const tweens = els.map((el) =>
      gsap.fromTo(
        el,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" } },
      ),
    );
    return () =>
      tweens.forEach((tw) => {
        tw.scrollTrigger?.kill();
        tw.kill();
      });
  }, []);

  return (
    <section id="perguntas" className="faq" data-snap>
      <TextReveal stagger={0.015}>
        <h2 className="section-title faq__title">{t.title}</h2>
      </TextReveal>
      <div>
        {t.items.map((item, i) => (
          <div key={item.question} ref={(el) => void (rows.current[i] = el)} className="faq__row">
            <FaqItem id={`faq-${i}`} question={item.question} answer={item.answer} open={open === i} onToggle={() => setOpen((o) => (o === i ? -1 : i))} />
          </div>
        ))}
      </div>
    </section>
  );
}
