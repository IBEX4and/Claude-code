"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import { content } from "@/content";
import { prefersReducedMotion } from "./Experience";
import { ArrowUpRightIcon } from "./Icons";
import { TextReveal } from "./TextReveal";

gsap.registerPlugin(ScrollTrigger);

/** "Design That Speaks…" da referência: cartões em rolagem horizontal com preenchimento radial. */
export function TechScroller() {
  const t = content.technologies;
  const row = useRef<HTMLDivElement>(null);
  const fills = useRef<(HTMLDivElement | null)[]>([]);
  const values = useRef(t.cards.map((_, i) => ({ value: i === 0 ? 100 : -40 })));
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => setReduced(prefersReducedMotion()), []);

  useEffect(() => {
    if (reduced || !row.current) return;
    const el = row.current;
    const w = window.innerWidth;
    const from = w > 1025 ? 70 : 50;
    // Termina com o último cartão encostado na margem direita.
    const end = () => -((el.scrollWidth - window.innerWidth) / el.scrollWidth) * 100;
    const tween = gsap.fromTo(
      el,
      { xPercent: from },
      {
        xPercent: end,
        ease: "none",
        scrollTrigger: { trigger: "#tecnologias", start: "top 20%", end: "bottom bottom", scrub: true, invalidateOnRefresh: true },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [reduced]);

  const activate = (i: number) => {
    if (i === active) return;
    const duration = reduced ? 0 : 0.45;
    const animate = (index: number, to: number) =>
      gsap.to(values.current[index], {
        value: to,
        duration,
        ease: "power2.out",
        onUpdate: () => fills.current[index]?.style.setProperty("--reveal", `${values.current[index].value}%`),
      });
    animate(active, -40);
    animate(i, 100);
    setActive(i);
  };

  return (
    <section id="tecnologias" className={`tech${reduced ? " tech--static" : ""}`}>
      <div className="tech__head">
        <TextReveal stagger={0.015}>
          <h2 className="section-title">
            {t.title[0]}
            <br />
            {t.title[1]}
          </h2>
        </TextReveal>
        <div className="tech__text">
          <TextReveal splitBy="lines">
            <p>{t.text}</p>
          </TextReveal>
        </div>
      </div>
      <div className="tech__sticky">
        <div className="tech__viewport">
          <div ref={row} className="tech__row">
            {t.cards.map((card, i) => (
              <a
                key={card.title}
                href="#agendar"
                className={`tech__card${active === i ? " is-active" : ""}`}
                onMouseEnter={() => activate(i)}
                onFocus={() => activate(i)}
                aria-label={t.cardAction(card.title)}
              >
                <div
                  ref={(el) => {
                    fills.current[i] = el;
                    el?.style.setProperty("--reveal", `${values.current[i].value}%`);
                  }}
                  className="tech__fill"
                />
                <div className="tech__arrow">
                  <span className="tech__arrow-icon">
                    <ArrowUpRightIcon />
                  </span>
                  <span className="tech__arrow-icon tech__arrow-icon--in">
                    <ArrowUpRightIcon />
                  </span>
                </div>
                <div className="tech__content">
                  <h3>{card.title}</h3>
                  <ul>
                    {card.items.map((item) => (
                      <li key={item}>
                        <span className="tech__bullet" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
