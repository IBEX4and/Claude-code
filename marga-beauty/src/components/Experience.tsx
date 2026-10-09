"use client";

import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

gsap.registerPlugin(ScrollTrigger);

type ExperienceContext = {
  /** Libera a rolagem (a entrada do hero começa com ela travada, como na referência). */
  startScroll: () => void;
  stopScroll: () => void;
  scrollTo: (target: string | HTMLElement) => void;
  /** Abre o modal de agendamento, opcionalmente com um tratamento já escolhido. */
  openBooking: (serviceId?: string) => void;
  closeBooking: () => void;
  booking: { open: boolean; serviceId?: string; nonce: number };
};

const Ctx = createContext<ExperienceContext | null>(null);

export function useExperience() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useExperience precisa estar dentro de <Experience>");
  return ctx;
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Experience({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [booking, setBooking] = useState<ExperienceContext["booking"]>({ open: false, nonce: 0 });

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({ lerp: 0.1 });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Quando a altura da página muda (FAQ, fontes), recalcula a rolagem e as animações.
  useEffect(() => {
    let timer: number | undefined;
    const observer = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        lenisRef.current?.resize();
        ScrollTrigger.refresh();
      }, 200);
    });
    observer.observe(document.body);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  const startScroll = useCallback(() => lenisRef.current?.start(), []);
  const stopScroll = useCallback(() => lenisRef.current?.stop(), []);

  const scrollTo = useCallback((target: string | HTMLElement) => {
    const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
    if (!el) return;
    if (lenisRef.current) {
      lenisRef.current.resize();
      lenisRef.current.scrollTo(el, { duration: 1.6 });
    } else el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, []);

  const openBooking = useCallback((serviceId?: string) => {
    setBooking((b) => ({ open: true, serviceId, nonce: b.nonce + 1 }));
  }, []);
  const closeBooking = useCallback(() => setBooking((b) => ({ ...b, open: false })), []);

  // Links "#agendar" abrem o modal; "#secao" usam a rolagem suave.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;
      const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;
      const hash = link.getAttribute("href")!;
      if (hash === "#agendar") {
        event.preventDefault();
        openBooking(link.dataset.bookService);
        return;
      }
      const target = hash === "#" || hash === "#top" ? document.body : document.querySelector<HTMLElement>(hash);
      if (!target) return;
      event.preventDefault();
      scrollTo(target);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [scrollTo, openBooking]);

  const value = useMemo(
    () => ({ startScroll, stopScroll, scrollTo, openBooking, closeBooking, booking }),
    [startScroll, stopScroll, scrollTo, openBooking, closeBooking, booking],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
