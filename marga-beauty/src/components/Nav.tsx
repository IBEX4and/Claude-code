"use client";

import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import { content } from "@/content";
import { prefersReducedMotion } from "./Experience";

export function Nav() {
  const t = content.nav;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Menu em tela cheia (celular): links entram em sequência ao abrir.
  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    document.documentElement.classList.toggle("menu-open", open);
    if (!open) return;
    if (!prefersReducedMotion()) {
      gsap.fromTo(
        menu.querySelectorAll(".menu__link"),
        { yPercent: 100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.8, ease: "expo.out", stagger: 0.06, delay: 0.15 },
      );
    }
    menu.querySelector<HTMLAnchorElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={`nav${scrolled ? " nav--scrolled" : ""}${open ? " nav--open" : ""}`}>
      <a href="#top" className="nav__brand" aria-label={t.home}>
        Marga Beauty
      </a>
      <nav className="nav__links" aria-label="Principal">
        {t.links.map((link) => (
          <a key={link.href} href={link.href} className="nav__link">
            {link.label}
          </a>
        ))}
      </nav>
      <a href="#agendar" className="button button--small nav__cta">
        {t.book}
      </a>
      <button
        ref={toggleRef}
        type="button"
        className="nav__toggle"
        aria-expanded={open}
        aria-controls="menu"
        aria-label={open ? t.closeMenu : t.openMenu}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
      </button>

      <div id="menu" ref={menuRef} className="menu" hidden={!open}>
        <nav aria-label="Menu">
          {[...t.links, { href: "#agendar", label: t.book }].map((link) => (
            <span key={link.href} className="menu__mask">
              <a href={link.href} className="menu__link" onClick={() => setOpen(false)}>
                {link.label}
              </a>
            </span>
          ))}
        </nav>
      </div>
    </header>
  );
}
