"use client";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef, useState } from "react";
import { content } from "@/content";
import { images } from "@/content/images";

export function Services() {
  const t = content.services;
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  // Imagem flutuante que segue o cursor sobre a lista (só desktop).
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)", () => {
        const list = root.current!.querySelector<HTMLElement>(".services__list")!;
        const cursor = root.current!.querySelector<HTMLElement>(".services__cursor")!;
        const xTo = gsap.quickTo(cursor, "x", { duration: 0.7, ease: "power3" });
        const yTo = gsap.quickTo(cursor, "y", { duration: 0.7, ease: "power3" });
        const rTo = gsap.quickTo(cursor, "rotation", { duration: 0.9, ease: "power3" });
        let lastX = 0;
        gsap.set(cursor, { scale: 0.6 });

        let pointer = { x: 0, y: 0 };
        let visible = false;
        const onMove = (e: PointerEvent) => {
          pointer = { x: e.clientX, y: e.clientY };
          xTo(e.clientX);
          yTo(e.clientY);
          rTo(gsap.utils.clamp(-8, 8, (e.clientX - lastX) * 0.4));
          lastX = e.clientX;
        };
        // Com o mouse parado e a página rolando, o navegador nem sempre avisa que o
        // cursor saiu da linha: confere na rolagem o que está embaixo dele.
        const onScroll = () => {
          if (!visible) return;
          const under = document.elementFromPoint(pointer.x, pointer.y);
          if (!under?.closest(".service__row")) onLeave();
        };
        const onEnter = (e: PointerEvent) => {
          if (!visible) gsap.set(cursor, { x: e.clientX, y: e.clientY });
          pointer = { x: e.clientX, y: e.clientY };
          lastX = e.clientX;
          visible = true;
          gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.5, ease: "power3.out", overwrite: "auto" });
        };
        function onLeave() {
          visible = false;
          gsap.to(cursor, { scale: 0.6, opacity: 0, duration: 0.4, ease: "power3.out", overwrite: "auto" });
        }

        const rows = gsap.utils.toArray<HTMLElement>(".service__row", list);
        list.addEventListener("pointermove", onMove);
        window.addEventListener("scroll", onScroll, { passive: true });
        for (const row of rows) {
          row.addEventListener("pointerenter", onEnter);
          row.addEventListener("pointerleave", onLeave);
        }
        return () => {
          list.removeEventListener("pointermove", onMove);
          window.removeEventListener("scroll", onScroll);
          for (const row of rows) {
            row.removeEventListener("pointerenter", onEnter);
            row.removeEventListener("pointerleave", onLeave);
          }
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="servicos" className="services">
      <div className="section-head">
        <h2 className="section-title">{t.title}</h2>
        <p className="section-intro">{t.intro}</p>
      </div>

      <ul className="services__list">
        {t.categories.map((category) => {
          const isOpen = open === category.id;
          const panelId = `servico-${category.id}`;
          return (
            <li
              key={category.id}
              className={`service${isOpen ? " service--open" : ""}`}
            >
              <button
                type="button"
                className="service__row"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : category.id)}
                onPointerEnter={() => setHovered(category.id)}
              >
                <span className="service__name">{category.name}</span>
                <span className="service__summary">{category.summary}</span>
                <span className="service__count">{t.treatmentsCount(category.items.length)}</span>
                <span className="service__icon" aria-hidden="true" />
              </button>

              <div id={panelId} className="service__panel" role="region" aria-label={category.name} inert={!isOpen}>
                <div className="service__panel-inner">
                  <ul className="service__items">
                    {category.items.map((item) => (
                      <li key={item.id} className="treatment">
                        <h3 className="treatment__name">{item.name}</h3>
                        <p className="treatment__description">{item.description}</p>
                        <p className="treatment__meta">
                          <span>{t.minutes(item.duration)}</span>
                          <a
                            href="#agendar"
                            className="text-link"
                            data-book-service={item.id}
                            aria-label={t.bookAria(item.name)}
                          >
                            {t.book}
                          </a>
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="services__cursor" aria-hidden="true">
        {t.categories.map((category) => (
          <img
            key={category.id}
            src={images.categories[category.image]}
            alt=""
            className={hovered === category.id ? "is-visible" : undefined}
          />
        ))}
      </div>
    </section>
  );
}
