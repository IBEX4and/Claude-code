"use client";

import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { content } from "@/content";
import { prefersReducedMotion } from "./Experience";
import { Logo } from "./Logo";
import { RollButton } from "./RollButton";

/** A partir de quanto da altura da tela rolada o cabeçalho some. */
const HIDE_AFTER = 0.1;

/**
 * Cabeçalho fixo que aparece só no topo da página, sobre o hero. Ao descer ele
 * sobe e some; rolar para cima no meio do site não o traz de volta.
 */
export function Header() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let hidden = false;
    const apply = (hide: boolean) => {
      if (hide === hidden) return;
      hidden = hide;
      const duration = prefersReducedMotion() ? 0 : 0.5;
      gsap.killTweensOf(el, "yPercent");
      if (hide) {
        gsap.to(el, {
          yPercent: -100,
          duration,
          ease: "power3.out",
          // Escondido, também sai da navegação por teclado.
          onComplete: () => void (el.style.visibility = "hidden"),
        });
      } else {
        el.style.visibility = "visible";
        gsap.to(el, { yPercent: 0, duration, ease: "power3.out" });
      }
    };
    const onScroll = () => apply(window.scrollY > window.innerHeight * HIDE_AFTER);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <header ref={ref} id="header" className="header">
      <a href="#top" className="header__logo" aria-label={content.header.home}>
        <Logo />
      </a>
      <RollButton label={content.header.book} />
    </header>
  );
}
