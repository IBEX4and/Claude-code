"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { content } from "@/content";
import { prefersReducedMotion } from "./Experience";
import { ArrowIcon } from "./Icons";
import { TextReveal } from "./TextReveal";

gsap.registerPlugin(ScrollTrigger);

/**
 * Carrossel no formato dos depoimentos da referência (bolinhas que se
 * reorganizam, cartão que troca e arrasta), com as etapas do atendimento.
 */
export function Steps() {
  const t = content.steps;
  const items = t.items;
  const total = items.length;
  const [index, setIndex] = useState(0);
  const section = useRef<HTMLElement>(null);
  const avatars = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const positions = useRef<Map<string, number> | null>(null);
  const drag = useRef<{ x: number; id: number } | null>(null);

  useEffect(() => {
    const els = gsap.utils.toArray<HTMLElement>(".steps__fade", section.current);
    if (prefersReducedMotion()) {
      gsap.set(els, { opacity: 1, y: 0 });
      return;
    }
    const tween = gsap.fromTo(
      els,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: { trigger: section.current, start: "top 70%", once: true },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  const go = useCallback((next: number) => {
    // FLIP manual: guarda a posição de cada bolinha antes de reordenar.
    const map = new Map<string, number>();
    avatars.current?.querySelectorAll<HTMLElement>(".steps__avatar").forEach((b) => map.set(b.dataset.key!, b.offsetLeft));
    positions.current = map;
    setIndex(((next % total) + total) % total);
  }, [total]);

  // Bolinhas: reordena com animação (equivale ao "layout" do Framer Motion da referência).
  useLayoutEffect(() => {
    const reduced = prefersReducedMotion();
    const before = positions.current;
    positions.current = null;
    if (before && !reduced) {
      avatars.current?.querySelectorAll<HTMLElement>(".steps__avatar").forEach((b) => {
        const old = before.get(b.dataset.key!);
        if (old === undefined) return;
        gsap.fromTo(b, { x: old - b.offsetLeft }, { x: 0, duration: 0.6, ease: "expo.out" });
      });
    }
    if (card.current && !reduced) {
      gsap.fromTo(card.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.25, ease: "power1.out" });
    }
  }, [index]);

  const half = Math.floor(total / 2);
  const item = items[index];

  return (
    <section ref={section} id="etapas" className="steps" data-snap>
      <div className="steps__head">
        <TextReveal stagger={0.015}>
          <h2 className="section-title">{t.title}</h2>
        </TextReveal>
      </div>
      <div className="steps__stage">
        <div className="steps__card steps__fade">
          <div
            ref={card}
            className="steps__content"
            onPointerDown={(e) => {
              drag.current = { x: e.clientX, id: e.pointerId };
            }}
            onPointerUp={(e) => {
              if (!drag.current || drag.current.id !== e.pointerId) return;
              const dx = e.clientX - drag.current.x;
              drag.current = null;
              if (dx > 100) go(index - 1);
              else if (dx < -100) go(index + 1);
            }}
            aria-live="polite"
          >
            <div className="steps__who">
              <p className="steps__name">{item.title}</p>
              <p className="steps__role">{t.stepLabel(index + 1, total)}</p>
            </div>
            <p className="steps__quote">{item.text}</p>
          </div>
        </div>
        <div ref={avatars} className="steps__avatars steps__fade">
          {items.map((it, i) => {
            const rel = (i - index + total) % total;
            const offset = rel <= half ? rel : rel - total;
            const active = offset === 0;
            return (
              <button
                key={it.title}
                type="button"
                data-key={i}
                onClick={() => go(i)}
                aria-label={t.showStep(it.title)}
                aria-current={active}
                className={`steps__avatar${active ? " is-active" : offset < 0 ? " is-before" : " is-after"}`}
                style={{ order: offset, zIndex: active ? 10 : total - Math.abs(offset) }}
              >
                <span>{i + 1}</span>
              </button>
            );
          })}
        </div>
        <div className="steps__nav steps__fade">
          <button type="button" className="circle-btn" onClick={() => go(index - 1)} aria-label={t.prev}>
            <ArrowIcon dir="left" />
            <span className="circle-btn__fill" />
          </button>
          <button type="button" className="circle-btn" onClick={() => go(index + 1)} aria-label={t.next}>
            <ArrowIcon dir="right" />
            <span className="circle-btn__fill" />
          </button>
        </div>
      </div>
    </section>
  );
}
