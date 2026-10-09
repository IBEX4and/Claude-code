"use client";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { content } from "@/content";
import { images } from "@/content/images";
import { useExperience } from "./Experience";

gsap.registerPlugin(useGSAP);

function Word({ text, className }: { text: string; className: string }) {
  return (
    <span className={`hero__word ${className}`}>
      <span className="hero__word-inner">
        {Array.from(text).map((char, i) => (
          <span key={i} className="hero__mask">
            <span className="hero__char">{char}</span>
          </span>
        ))}
      </span>
    </span>
  );
}

export function Hero() {
  const t = content.hero;
  const { ready } = useExperience();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Estado inicial: escondido até o preloader liberar.
        gsap.set(".hero__char", { yPercent: 115 });
        gsap.set(".hero__portrait-inner", { yPercent: 14, opacity: 0 });
        gsap.set(".hero__fade", { opacity: 0, y: 24 });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  useGSAP(
    () => {
      if (!ready) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Entrada: letras sobem, a foto emerge, textos aparecem.
        gsap
          .timeline({ defaults: { ease: "expo.out" } })
          .to(".hero__portrait-inner", { yPercent: 0, opacity: 1, duration: 2 }, 0)
          .to(".hero__word--top .hero__char", { yPercent: 0, duration: 1.5, stagger: 0.06 }, 0.15)
          .to(".hero__word--bottom .hero__char", { yPercent: 0, duration: 1.5, stagger: 0.06 }, 0.3)
          .to(".hero__fade", { opacity: 1, y: 0, duration: 1.2, stagger: 0.1 }, 0.9);

        // Parallax de rolagem: cada camada anda numa velocidade.
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
          })
          .to(".hero__word--top", { xPercent: -14, yPercent: 40 }, 0)
          .to(".hero__word--bottom", { xPercent: 14, yPercent: 10 }, 0)
          .to(".hero__portrait", { yPercent: 18 }, 0)
          .to(".hero__statement, .hero__aside", { y: -60, opacity: 0 }, 0);
      });

      // Parallax do mouse, só em telas com ponteiro fino.
      mm.add("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)", () => {
        const words = gsap.utils.toArray<HTMLElement>(".hero__word-inner");
        const portrait = root.current!.querySelector(".hero__portrait-inner");
        const moves = [
          ...words.map((w) => ({ x: gsap.quickTo(w, "x", { duration: 1.2, ease: "power3" }), y: gsap.quickTo(w, "y", { duration: 1.2, ease: "power3" }), depth: -18 })),
          { x: gsap.quickTo(portrait, "x", { duration: 1.4, ease: "power3" }), y: gsap.quickTo(portrait, "y", { duration: 1.4, ease: "power3" }), depth: 10 },
        ];
        const onMove = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          for (const m of moves) {
            m.x(nx * m.depth);
            m.y(ny * m.depth);
          }
        };
        window.addEventListener("pointermove", onMove);
        return () => window.removeEventListener("pointermove", onMove);
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [ready] },
  );

  return (
    <section ref={root} id="top" className="hero">
      <h1 className="hero__title" aria-label="Marga Beauty">
        <Word text="Marga" className="hero__word--top" />
        <Word text="Beauty" className="hero__word--bottom" />
      </h1>

      <div className="hero__portrait">
        <picture className="hero__portrait-inner">
          <source srcSet={images.hero.src} type="image/webp" />
          <img
            src={images.hero.fallback}
            alt={t.imageAlt}
            width={images.hero.width}
            height={images.hero.height}
            fetchPriority="high"
          />
        </picture>
      </div>

      <div className="hero__statement">
        <p className="hero__fade">{t.statement}</p>
        <a href="#agendar" className="button hero__fade">
          {t.cta}
        </a>
      </div>

      <div className="hero__aside">
        <p className="hero__fade">{t.aside}</p>
        <a href="#manifesto" className="hero__scroll hero__fade">
          {t.scroll}
        </a>
      </div>
    </section>
  );
}
