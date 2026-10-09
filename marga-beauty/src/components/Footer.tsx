import { bookingRules, business } from "@/config/business";
import { content } from "@/content";
import { groupWeeklyHours } from "@/lib/hours";

export function Footer() {
  const t = content.footer;
  const hours = groupWeeklyHours(bookingRules.weeklyHours, content.locale, t.closed);
  const year = new Date().getFullYear();
  const place = [business.address, business.city, business.country].filter(Boolean).join(", ");

  return (
    <footer className="footer">
      <div className="footer__grid">
        <div>
          <h2 className="footer__title">{t.contactTitle}</h2>
          <address className="footer__text">
            {business.address ? place : t.addressPending}
            {business.phoneDisplay && (
              <>
                <br />
                <a href={`tel:${business.phoneDisplay.replace(/\s/g, "")}`}>{business.phoneDisplay}</a>
              </>
            )}
            {business.email && (
              <>
                <br />
                <a href={`mailto:${business.email}`}>{business.email}</a>
              </>
            )}
          </address>
        </div>
        <div>
          <h2 className="footer__title">{t.hoursTitle}</h2>
          <dl className="footer__hours">
            {hours.map((row) => (
              <div key={row.days}>
                <dt>{row.days}</dt>
                <dd>{row.hours}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h2 className="footer__title">{t.followTitle}</h2>
          <p className="footer__text">
            <a href={business.instagram} target="_blank" rel="noopener noreferrer">
              {business.instagramHandle}
            </a>
          </p>
        </div>
      </div>

      <p className="footer__wordmark" aria-hidden="true">
        Marga Beauty
      </p>

      <div className="footer__bar">
        <span>{t.rights(year)}</span>
        {business.vatNumber && (
          <span>
            {t.vat} {business.vatNumber}
          </span>
        )}
        <a href="/privacidade">{t.privacy}</a>
        <a href="#top">{t.backToTop}</a>
      </div>
    </footer>
  );
}
