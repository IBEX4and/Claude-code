"use client";

import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import { content } from "@/content";
import { prefersReducedMotion, useExperience } from "../Experience";
import { BookingFlow } from "./BookingFlow";

/** Modal de agendamento no estilo do "Get in Touch" da referência (cartão de vidro). */
export function BookingModal() {
  const { booking, closeBooking, stopScroll, startScroll } = useExperience();
  const overlay = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = overlay.current;
    if (!el) return;
    const reduced = prefersReducedMotion();
    if (booking.open) {
      lastFocus.current = document.activeElement as HTMLElement;
      setMounted(true);
      stopScroll();
      document.documentElement.classList.add("modal-open");
      gsap.set(el, { display: "flex" });
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: reduced ? 0 : 0.4, ease: "power2.out" });
      gsap.fromTo(card.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: reduced ? 0 : 0.7, ease: "expo.out", delay: reduced ? 0 : 0.1 });
      requestAnimationFrame(() => card.current?.querySelector<HTMLElement>("button, a, input")?.focus({ preventScroll: true }));
    } else if (mounted) {
      gsap.to(el, {
        opacity: 0,
        duration: reduced ? 0 : 0.35,
        ease: "power2.in",
        onComplete: () => {
          gsap.set(el, { display: "none" });
          document.documentElement.classList.remove("modal-open");
          startScroll();
          lastFocus.current?.focus({ preventScroll: true });
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking.open, booking.nonce]);

  useEffect(() => {
    if (!booking.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeBooking();
      // Mantém o foco dentro do modal.
      if (e.key === "Tab" && card.current) {
        const focusables = card.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex='-1'])");
        const list = Array.from(focusables).filter((el) => el.offsetParent !== null);
        if (!list.length) return;
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [booking.open, closeBooking]);

  return (
    <div
      ref={overlay}
      className="modal"
      style={{ display: "none" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeBooking();
      }}
    >
      <div ref={card} className="modal__card" role="dialog" aria-modal="true" aria-labelledby="booking-title" data-lenis-prevent>
        <button type="button" className="modal__close" onClick={closeBooking} aria-label={content.booking.close}>
          <span />
          <span />
        </button>
        <div className="modal__grid">
          {mounted && <BookingFlow requestedService={booking.serviceId} requestNonce={booking.nonce} scrollArea={card} />}
        </div>
      </div>
    </div>
  );
}
