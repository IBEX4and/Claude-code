"use client";

import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { gestureTarget, readSnapMap, settleTarget } from "@/lib/snapping";

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

/** Mesmo critério do CSS: tablet em pé e celular usam o layout empilhado. */
export const COMPACT_LAYOUT = "(max-width: 767px), (max-width: 1025px) and (max-aspect-ratio: 1/1)";

export function isCompactLayout() {
  return typeof window !== "undefined" && window.matchMedia(COMPACT_LAYOUT).matches;
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

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

    // Encaixe da rolagem (ver src/lib/snapping.ts).
    let jumping = false; // indo de uma ponta à outra do hero
    let holdGesture = false; // ignora o resto do gesto que disparou o salto
    let heldAt = 0;
    let lastInput = 0;
    let touching = false;
    let touchTravel = 0; // distância do dedo no gesto atual (toques curtos não rolam)
    let settleTimer: number | undefined;

    const jump = (target: number) => {
      jumping = true;
      window.clearTimeout(settleTimer);
      lenis.scrollTo(target, {
        duration: 1.4,
        easing: easeInOutCubic,
        lock: true,
        force: true,
        onComplete: () => {
          jumping = false;
          holdGesture = true;
          heldAt = performance.now();
        },
      });
    };

    const lenis = new Lenis({
      lerp: 0.1,
      // Roda do mouse e toque passam por aqui antes de rolar: no hero, um gesto
      // leva direto ao fim da animação (ou de volta ao topo).
      virtualScroll: ({ deltaY, event }) => {
        if (lenis.isStopped) return true;
        const isTouch = event.type.startsWith("touch");
        const now = performance.now();
        const gap = now - lastInput;
        lastInput = now;
        if (isTouch && event.type === "touchstart") {
          holdGesture = false;
          touchTravel = 0;
          return true;
        }
        if (isTouch) touchTravel += deltaY;
        const block = () => {
          if (event.cancelable) event.preventDefault();
          return false;
        };
        if (jumping) return block();
        if (holdGesture) {
          // A inércia do trackpad continua mandando eventos; espera o gesto acabar.
          const gestureOver = isTouch ? false : gap > 180 || now - heldAt > 1200;
          if (!gestureOver) return block();
          holdGesture = false;
        }
        if ((event.target as Element | null)?.closest?.("[data-lenis-prevent]")) return true;
        if (isTouch && Math.abs(touchTravel) < 12) return true;
        const target = gestureTarget(readSnapMap(), lenis.targetScroll, deltaY);
        if (target === null) return true;
        jump(target);
        return block();
      },
    });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    lenis.stop();

    // Quando a rolagem para (roda, toque com inércia, teclado, barra), encaixa no
    // ponto mais próximo se estiver perto dele.
    const settle = () => {
      if (jumping || touching || lenis.isStopped || lenis.isScrolling) return;
      const target = settleTarget(readSnapMap(), window.scrollY, lenis.direction || 1, window.innerHeight);
      if (target === null) return;
      lenis.scrollTo(target, { duration: 0.9, easing: easeInOutCubic });
    };
    const scheduleSettle = () => {
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(settle, 160);
    };
    const onTouchStart = () => {
      touching = true;
      window.clearTimeout(settleTimer);
    };
    const onTouchEnd = () => {
      touching = false;
      scheduleSettle();
    };
    lenis.on("scroll", scheduleSettle);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      window.clearTimeout(settleTimer);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
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
