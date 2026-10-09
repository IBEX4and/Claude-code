"use client";

import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { content } from "@/content";
import { prefersReducedMotion, useExperience } from "./Experience";

const SEEN_KEY = "marga:intro-seen";

/** Lido uma vez por carregamento (o StrictMode do React roda os efeitos duas vezes em dev). */
let seenThisSession: boolean | null = null;
function introAlreadySeen() {
  if (seenThisSession === null) {
    try {
      seenThisSession = sessionStorage.getItem(SEEN_KEY) === "1";
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      seenThisSession = false;
    }
  }
  return seenThisSession;
}

export function Preloader() {
  const { markReady } = useExperience();
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current!;
    const seen = introAlreadySeen();

    if (prefersReducedMotion()) {
      el.style.display = "none";
      markReady();
      return;
    }

    const assets = Promise.all([
      document.fonts?.ready,
      new Promise<void>((resolve) => {
        const img = document.querySelector<HTMLImageElement>(".hero__portrait img");
        if (!img || img.complete) return resolve();
        img.addEventListener("load", () => resolve(), { once: true });
        img.addEventListener("error", () => resolve(), { once: true });
      }),
    ]);

    // Se fontes e foto ainda não carregaram quando a animação chega ao fim, ela espera aqui.
    let assetsDone = false;
    let waiting = false;
    let cancelled = false;
    const gate = () => {
      if (!assetsDone) {
        waiting = true;
        tl.pause();
      }
    };

    const counter = { value: 0 };
    const tl = gsap.timeline({ paused: true });

    if (seen) {
      tl.call(gate).to(el, { autoAlpha: 0, duration: 0.5, ease: "power2.out" });
    } else {
      tl.set(el.querySelector(".preloader__name"), { opacity: 1 }).fromTo(
        el.querySelectorAll(".preloader__char"),
        { yPercent: 110 },
        { yPercent: 0, duration: 1, ease: "expo.out", stagger: 0.045 },
      )
        .to(
          counter,
          {
            value: 100,
            duration: 1.5,
            ease: "power2.inOut",
            onUpdate: () => {
              if (count.current) count.current.textContent = String(Math.round(counter.value));
            },
          },
          0,
        )
        .fromTo(el.querySelector(".preloader__bar"), { scaleX: 0 }, { scaleX: 1, duration: 1.5, ease: "power2.inOut" }, 0)
        .call(gate)
        .to(el.querySelectorAll(".preloader__char"), { yPercent: -110, duration: 0.6, ease: "power3.in", stagger: 0.02 })
        .to(el, { yPercent: -100, duration: 1, ease: "expo.inOut" }, "-=0.2");
    }

    // A entrada do hero começa enquanto a cortina sobe.
    tl.call(markReady, [], "-=0.45");
    tl.eventCallback("onComplete", () => {
      el.style.display = "none";
    });

    assets.then(() => {
      assetsDone = true;
      if (waiting && !cancelled) tl.play();
    });
    tl.play();

    return () => {
      cancelled = true;
      tl.kill();
    };
  }, [markReady]);

  const name = "Marga Beauty";
  return (
    <div ref={root} className="preloader" role="status" aria-label={content.preloader.label}>
      <div className="preloader__name" aria-hidden="true">
        {Array.from(name).map((char, i) => (
          <span key={i} className="preloader__mask">
            <span className="preloader__char">{char === " " ? " " : char}</span>
          </span>
        ))}
      </div>
      <div className="preloader__meta" aria-hidden="true">
        <span className="preloader__track">
          <span className="preloader__bar" />
        </span>
        <span ref={count} className="preloader__count">
          0
        </span>
      </div>
    </div>
  );
}
