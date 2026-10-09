"use client";

import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import { content } from "@/content";
import { prefersReducedMotion } from "./Experience";
import { Logo } from "./Logo";
import { RollButton } from "./RollButton";

/** Cabeçalho fixo: some ao rolar para baixo, volta ao rolar para cima. */
export function Header() {
  const ref = useRef<HTMLElement>(null);
  const [blurred, setBlurred] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    let hidden = false;
    const onScroll = () => {
      const y = window.scrollY;
      setBlurred(y > window.innerHeight * 0.4);
      if (!prefersReducedMotion()) {
        const delta = y - last;
        if (delta > 0 && y > 0 && !hidden) {
          hidden = true;
          gsap.to(ref.current, { yPercent: -100, duration: 0.5, ease: "power3.out" });
        } else if (delta < 0 && hidden) {
          hidden = false;
          gsap.to(ref.current, { yPercent: 0, duration: 0.5, ease: "power3.out" });
        }
      }
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header ref={ref} id="header" className={`header${blurred ? " header--blur" : ""}`}>
      <a href="#top" className="header__logo" aria-label={content.header.home}>
        <Logo />
      </a>
      <RollButton label={content.header.book} />
    </header>
  );
}
