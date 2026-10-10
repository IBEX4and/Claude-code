"use client";

import { gsap } from "gsap";
import { Fragment, useCallback, useEffect, useRef } from "react";
import { content } from "@/content";
import type { VisualKey } from "@/content/images";
import { prefersReducedMotion } from "./Experience";
import { TextReveal } from "./TextReveal";
import { Visual } from "./Visual";

/** "Awards and Industry Recognition" da referência: lista com imagem que acompanha a linha. */
export function Specialties() {
  const t = content.specialties;
  const items = t.items;
  const frame = useRef<HTMLDivElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const images = useRef<(HTMLDivElement | null)[]>([]);
  const rows = useRef<(HTMLDivElement | null)[]>([]);
  const zTop = useRef(items.length);
  const current = useRef<number | null>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    gsap.set(frame.current, { y: 0 });
    images.current.forEach((img, i) => gsap.set(img, { zIndex: i + 1, scale: i === 0 ? 1.05 : 0 }));
  }, []);

  const show = useCallback((i: number) => {
    const row = rows.current[i];
    const box = frame.current;
    const reduced = prefersReducedMotion();
    if (row && box) {
      const y = gsap.getProperty(box, "y") as number;
      const r = box.getBoundingClientRect();
      const base = r.top + r.height / 2 - y;
      const rr = row.getBoundingClientRect();
      const target = rr.top + rr.height / 2 - base;
      if (reduced) gsap.set(box, { y: target });
      else gsap.to(box, { y: target, duration: 0.65, ease: "back.out(1.6)" });
    }
    const img = images.current[i];
    if (img) {
      zTop.current += 1;
      gsap.set(img, { zIndex: zTop.current });
      gsap.killTweensOf(img);
      if (reduced) gsap.set(img, { scale: 1.05 });
      else {
        gsap.set(img, { scale: 0 });
        gsap.to(img, { scale: 1.05, duration: 0.45, ease: "power2.out" });
      }
    }
  }, []);

  const hitTest = useCallback(
    (x: number, y: number) => {
      let found: number | null = null;
      rows.current.forEach((row, i) => {
        const r = row?.getBoundingClientRect();
        if (found === null && r && y >= r.top && y < r.bottom && x >= r.left && x < r.right) found = i;
      });
      if (found !== null && found !== current.current) {
        current.current = found;
        show(found);
      }
    },
    [show],
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY };
      hitTest(e.clientX, e.clientY);
    };
    const onScroll = () => pointer.current && hitTest(pointer.current.x, pointer.current.y);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [hitTest]);

  const fade = (on: boolean) => {
    if (!on) current.current = null;
    gsap.to(container.current, { opacity: on ? 1 : 0, duration: prefersReducedMotion() ? 0 : 0.4, ease: "power2.out" });
  };

  return (
    <section id="especialidades" className="specialties" data-snap>
      <div className="specialties__inner">
        <div className="specialties__list">
          <TextReveal stagger={0.015}>
            <h2 className="section-title">
              {t.title[0]}
              <br />
              {t.title[1]}
            </h2>
          </TextReveal>
          <div onMouseEnter={() => fade(true)} onMouseLeave={() => fade(false)}>
            {items.map((item, i) => (
              <Fragment key={item.title}>
                {i !== 0 && <div className="specialties__divider" aria-hidden="true" />}
                <div ref={(el) => void (rows.current[i] = el)} className="specialties__row">
                  <TextReveal splitBy="lines">
                    <h3>{item.title}</h3>
                  </TextReveal>
                  <TextReveal splitBy="lines">
                    <p>{item.meta}</p>
                  </TextReveal>
                </div>
              </Fragment>
            ))}
            <div className="specialties__divider" aria-hidden="true" />
          </div>
        </div>
        <div ref={container} className="specialties__image" aria-hidden="true">
          <div ref={frame} className="specialties__frame">
            {items.map((item, i) => (
              <div key={item.title} ref={(el) => void (images.current[i] = el)} className="specialties__img">
                <Visual id={item.image as VisualKey} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
