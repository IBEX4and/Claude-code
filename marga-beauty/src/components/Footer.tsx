"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { bookingRules, business, fullAddress, mapsUrl, whatsappUrl } from "@/config/business";
import { content } from "@/content";
import { groupWeeklyHours } from "@/lib/hours";
import { prefersReducedMotion } from "./Experience";
import { InstagramIcon, WhatsAppIcon } from "./Icons";
import { Logo } from "./Logo";
import { RollButton } from "./RollButton";

gsap.registerPlugin(ScrollTrigger);

export function Footer() {
  const t = content.footer;
  const footer = useRef<HTMLElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const hours = groupWeeklyHours(bookingRules.weeklyHours, content.locale, t.closed);

  // O cartão sobe um pouco conforme o rodapé entra na tela.
  useEffect(() => {
    if (prefersReducedMotion() || window.innerWidth <= 1025) return;
    const tween = gsap.fromTo(
      card.current,
      { yPercent: 20 },
      { yPercent: 0, ease: "power1.out", scrollTrigger: { trigger: footer.current, start: "top 60%", end: "bottom bottom", scrub: true } },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  const socials = [
    { label: t.instagram, href: business.instagram, icon: <InstagramIcon /> },
    ...(business.whatsapp ? [{ label: t.whatsapp, href: whatsappUrl(t.whatsappMessage), icon: <WhatsAppIcon /> }] : []),
  ];

  return (
    <footer ref={footer} id="contato" className="footer">
      <img src="/images/footer-glow.svg" alt="" aria-hidden="true" className="footer__glow" loading="lazy" />
      <div className="footer__inner">
        <div ref={card} className="footer__card">
          <div className="footer__top">
            <Logo className="footer__logo" />
            <div className="footer__cta">
              <p>{t.cta}</p>
              <RollButton label={t.book} />
            </div>
          </div>
          <div className="footer__bottom">
            <div className="footer__reach">
              <h2>{t.reachOut}</h2>
              <ul>
                {business.whatsapp && (
                  <li>
                    <a
                      className="footer__whatsapp under-multi-parent"
                      href={whatsappUrl(t.whatsappMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t.whatsappAria(business.phoneDisplay)}
                    >
                      <WhatsAppIcon size={20} />
                      <span className="under-multi">{business.phoneDisplay}</span>
                    </a>
                  </li>
                )}
                {business.email && (
                  <li className="under-multi-parent">
                    <a className="under-multi" href={`mailto:${business.email}`}>
                      {business.email}
                    </a>
                  </li>
                )}
                <li className="under-multi-parent">
                  <a
                    className="under-multi"
                    href={mapsUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t.mapsAria(fullAddress())}
                  >
                    {fullAddress()}
                  </a>
                </li>
                {hours.map((row) => (
                  <li key={row.days} className="footer__hours">
                    {row.days}: {row.hours}
                  </li>
                ))}
              </ul>
            </div>
            <ul className="footer__socials">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                    {s.icon}
                    <span className="footer__social-fill" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="footer__legal">
          <p>
            {t.rights(new Date().getFullYear())}
            {business.vatNumber && ` · ${t.vat} ${business.vatNumber}`}
          </p>
          <a href="/privacidade" className="under-multi-parent">
            <span className="under-multi">{t.privacy}</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
