"use client";

import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

gsap.registerPlugin(ScrollTrigger);

type ExperienceContext = {
  /** Vira true quando o preloader termina: é o sinal para a entrada do hero. */
  ready: boolean;
  markReady: () => void;
  scrollTo: (target: string | HTMLElement) => void;
};

const Ctx = createContext<ExperienceContext>({
  ready: true,
  markReady: () => {},
  scrollTo: () => {},
});

export const useExperience = () => useContext(Ctx);

export const BOOK_EVENT = "marga:book";

/** Pede para a seção de agendamento selecionar um serviço. */
export function requestBooking(serviceId: string) {
  window.dispatchEvent(new CustomEvent(BOOK_EVENT, { detail: { serviceId } }));
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Experience({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
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

  // Quando a altura da página muda (acordeão de serviços, etapas do agendamento),
  // recalcula o limite da rolagem suave e as posições das animações.
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

  useEffect(() => {
    if (!ready) return;
    lenisRef.current?.start();
    ScrollTrigger.refresh();
  }, [ready]);

  const scrollTo = useCallback((target: string | HTMLElement) => {
    const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
    if (!el) return;
    if (lenisRef.current) {
      lenisRef.current.resize();
      lenisRef.current.scrollTo(el, { duration: 1.6 });
    }
    else el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, []);

  // Links internos (#secao) passam pela rolagem suave. `data-book-service`
  // também pré-seleciona o tratamento no agendamento.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;
      const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;
      const hash = link.getAttribute("href")!;
      const target = hash === "#" || hash === "#top" ? document.body : document.querySelector<HTMLElement>(hash);
      if (!target) return;
      event.preventDefault();
      const serviceId = link.dataset.bookService;
      if (serviceId) requestBooking(serviceId);
      scrollTo(target);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [scrollTo]);

  const markReady = useCallback(() => setReady(true), []);
  const value = useMemo(() => ({ ready, markReady, scrollTo }), [ready, markReady, scrollTo]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
