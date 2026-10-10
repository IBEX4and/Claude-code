"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import { content } from "@/content";
import { gallery, hero as heroImage } from "@/content/images";
import { prefersReducedMotion, useExperience } from "./Experience";
import { TextReveal } from "./TextReveal";
import { Visual } from "./Visual";

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  const t = content.hero;
  const { startScroll } = useExperience();
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const textRow = useRef<HTMLDivElement>(null);
  const portrait = useRef<HTMLDivElement>(null);
  const portraitInner = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const [titleReady, setTitleReady] = useState(false);
  const [asideReady, setAsideReady] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1025px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Entrada: a foto se revela em diagonal (3,5 s), depois título, textos laterais e cabeçalho.
  useEffect(() => {
    const reduced = prefersReducedMotion();
    const header = document.getElementById("header");
    if (reduced) {
      portrait.current?.style.setProperty("--reveal", "125%");
      gsap.set([portrait.current, header], { opacity: 1 });
      setTitleReady(true);
      setAsideReady(true);
      startScroll();
      return;
    }
    const state = { reveal: -40 };
    const tl = gsap.timeline();
    tl.to(
      state,
      {
        reveal: 125,
        duration: 3.5,
        ease: "power2.out",
        onUpdate: () => portrait.current?.style.setProperty("--reveal", `${state.reveal}%`),
      },
      0,
    )
      .fromTo(portrait.current, { opacity: 0 }, { opacity: 1, duration: 1.5, ease: "power2.out" }, 0)
      .call(() => setTitleReady(true), undefined, 1)
      .call(() => setAsideReady(true), undefined, 1.5)
      .call(
        () => {
          gsap.fromTo(
            header,
            { yPercent: -50, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.8, ease: "power3.out", onComplete: startScroll },
          );
        },
        undefined,
        1.8,
      );
    return () => {
      tl.kill();
    };
  }, [startScroll]);

  // Rolagem: o hero encolhe até 50% e o mosaico atrás sai do desfoque.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    tl.to(stage.current, { scale: 0.5, ease: "power2.inOut", duration: 1 }, 0);
    gsap.set(galleryRef.current, { filter: "blur(24px)", opacity: 0.35 });
    tl.to(galleryRef.current, { filter: "blur(0px)", opacity: 1, ease: "power2.out", duration: 0.18 }, 0.32);
    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  // Parallax do mouse: foto ±30 px e texto ±12 px, com interpolação (lerp 0,08).
  useEffect(() => {
    if (window.innerWidth <= 1024 || prefersReducedMotion()) return;
    const s = { tx: 0, cx: 0, ty: 0, cy: 0, ix: 0, icx: 0, iy: 0, icy: 0 };
    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      s.ix = -30 * nx;
      s.tx = -12 * nx;
      s.iy = -30 * ny;
      s.ty = -12 * ny;
    };
    let raf = 0;
    const loop = () => {
      s.icx += (s.ix - s.icx) * 0.08;
      s.cx += (s.tx - s.cx) * 0.08;
      s.icy += (s.iy - s.icy) * 0.08;
      s.cy += (s.ty - s.cy) * 0.08;
      gsap.set(portraitInner.current, { x: s.icx, y: s.icy });
      gsap.set(textRow.current, { x: s.cx, y: s.cy });
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Cada coluna é a mesma sequência duas vezes: o loop sobe exatamente meia coluna.
  // Em telas menores os blocos são mais altos, então a sequência vai dobrada.
  const columns = mobile
    ? [[...gallery.columnA, ...gallery.columnA], [...gallery.columnB, ...gallery.columnB]]
    : [gallery.columnA, gallery.columnB];

  return (
    <section ref={section} id="top" className="hero" data-snap-zone="directional">
      <div ref={stage} className="hero__stage">
        <div ref={textRow} className="hero__row">
          <div className="hero__title">
            <TextReveal stagger={0.015} start={titleReady} animateOnScroll={false}>
              <h1>{t.title}</h1>
            </TextReveal>
          </div>
          <div className="hero__aside">
            <TextReveal splitBy="lines" start={asideReady} animateOnScroll={false}>
              <p>{t.asideTop}</p>
            </TextReveal>
            <TextReveal splitBy="lines" start={asideReady} animateOnScroll={false}>
              <p>
                {t.asideBottom[0]}
                <br />
                {t.asideBottom[1]}
              </p>
            </TextReveal>
          </div>
        </div>

        <div ref={portrait} className="hero__portrait">
          <div ref={portraitInner} className="hero__portrait-inner">
            <picture>
              <source srcSet={heroImage.src} type="image/webp" />
              <img
                src={heroImage.fallback}
                alt={t.imageAlt}
                width={heroImage.width}
                height={heroImage.height}
                fetchPriority="high"
                draggable={false}
              />
            </picture>
          </div>
        </div>
      </div>

      <div ref={galleryRef} className="hero__gallery" aria-label={t.galleryLabel} role="img">
        <div className="hero__gallery-inner">
          {columns.map((column, c) => (
            <div key={c} className={`hero__column marquee-${c + 1}`}>
              {column.map((id, i) => (
                <div key={i} className="hero__tile">
                  <Visual id={id} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
