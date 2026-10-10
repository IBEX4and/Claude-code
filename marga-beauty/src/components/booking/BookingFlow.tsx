"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { bookingRules, business, fullAddress, whatsappUrl } from "@/config/business";
import { content } from "@/content";
import { weekdayNames } from "@/lib/hours";
import { RollButton } from "../RollButton";
import { googleCalendarUrl, icsDataUrl } from "./calendarLinks";

const t = content.booking;
const locale = content.locale;

type Step = "service" | "datetime" | "details" | "done";
type Availability = {
  mode: "google" | "demo";
  month: string;
  months: { first: string; last: string };
  days: Record<string, string[]>;
};
type Result = { serviceName: string; duration: number; start: string; end: string };
type Form = { name: string; phone: string; email: string; notes: string; consent: boolean; website: string };

const services = content.services.categories.flatMap((c) => c.items);
const findService = (id: string | null) => services.find((s) => s.id === id) ?? null;

/**
 * Divide as áreas em duas colunas com alturas parecidas (cada área conta os seus
 * serviços + o título), mantendo a ordem original dentro de cada coluna. Assim a
 * lista inteira cabe no modal sem rolar.
 */
const serviceColumns = (() => {
  const groups = content.services.categories;
  const weight = groups.map((g) => g.items.length + 1);
  let best = 0;
  let bestHeight = Infinity;
  for (let mask = 0; mask < 1 << groups.length; mask++) {
    let left = 0;
    let right = 0;
    weight.forEach((w, i) => (mask & (1 << i) ? (right += w) : (left += w)));
    // Em empate, prefere a divisão que deixa a primeira área na coluna da esquerda.
    if (Math.max(left, right) < bestHeight && !(mask & 1)) {
      best = mask;
      bestHeight = Math.max(left, right);
    }
  }
  return [groups.filter((_, i) => !(best & (1 << i))), groups.filter((_, i) => best & (1 << i))];
})();

const capitalize = (s: string) => s.charAt(0).toLocaleUpperCase() + s.slice(1);
const ymd = (y: number, m: number, d: number) =>
  `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const shiftMonth = (month: string, delta: number) => {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
};
const formatDate = (date: string, opts: Intl.DateTimeFormatOptions) => {
  const [y, m, d] = date.split("-").map(Number);
  return capitalize(new Intl.DateTimeFormat(locale, { ...opts, timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d))));
};
const longDate = (date: string) => formatDate(date, { weekday: "long", day: "numeric", month: "long" });
const monthLabel = (month: string) => formatDate(`${month}-01`, { month: "long", year: "numeric" });

/** Mês atual (AAAA-MM) no fuso do estúdio. */
const currentMonth = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: bookingRules.timezone, year: "numeric", month: "2-digit" })
    .format(new Date())
    .slice(0, 7);

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[\d\s().-]{8,22}$/;

function validate(form: Form): Record<string, string> {
  const errors: Record<string, string> = {};
  if (form.name.trim().length < 2) errors.name = t.errors.required;
  if (!form.phone.trim()) errors.phone = t.errors.required;
  else if (!PHONE.test(form.phone.trim()) || form.phone.replace(/\D/g, "").length < 8) errors.phone = t.errors.phone;
  if (!form.email.trim()) errors.email = t.errors.required;
  else if (!EMAIL.test(form.email.trim())) errors.email = t.errors.email;
  if (!form.consent) errors.consent = t.errors.consent;
  return errors;
}

const emptyForm: Form = { name: "", phone: "", email: "", notes: "", consent: false, website: "" };

/**
 * Fluxo de agendamento (tratamento → data e horário → dados → confirmado).
 * Renderiza as duas colunas do modal: a lateral com título e resumo, e o painel.
 */
export function BookingFlow({
  requestedService,
  requestNonce,
  scrollArea,
}: {
  /** Tratamento escolhido no botão que abriu o modal. */
  requestedService?: string;
  /** Muda a cada abertura, para reaplicar o tratamento pedido. */
  requestNonce: number;
  /** Área com rolagem própria (o cartão do modal), para voltar ao topo ao trocar de etapa. */
  scrollArea: React.RefObject<HTMLElement | null>;
}) {
  const [step, setStep] = useState<Step>("service");
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [month, setMonth] = useState<string>(currentMonth);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "error">("idle");
  const [reloadKey, setReloadKey] = useState(0);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const service = findService(serviceId);

  const chooseService = useCallback((id: string) => {
    setServiceId(id);
    setDate(null);
    setTime(null);
    setNotice(null);
    setAvailability(null);
    setStep("datetime");
  }, []);

  // A cada abertura: se o último agendamento já terminou, começa de novo; botões
  // "Agendar" de um tratamento específico já abrem na etapa de data e horário.
  useEffect(() => {
    if (step === "done") restart();
    if (requestedService && findService(requestedService)) chooseService(requestedService);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestNonce]);

  // Busca os horários livres do mês para o tratamento escolhido.
  useEffect(() => {
    if (!serviceId) return;
    const controller = new AbortController();
    setLoadState("loading");
    const query = new URLSearchParams({ service: serviceId, month });
    fetch(`/api/availability?${query}`, { signal: controller.signal, cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: Availability) => {
        setAvailability(data);
        setLoadState("idle");
        // Seleciona sozinho o primeiro dia com vaga, para os horários já aparecerem.
        setDate((current) => {
          if (current && data.days[current]?.length) return current;
          return Object.keys(data.days).find((d) => data.days[d].length) ?? null;
        });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error(err);
        setLoadState("error");
      });
    return () => controller.abort();
  }, [serviceId, month, reloadKey]);

  // Leva o foco ao título da etapa quando ela muda (teclado e leitores de tela).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    scrollArea.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, scrollArea]);

  const weeks = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    const first = new Date(Date.UTC(y, m - 1, 1));
    const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const lead = (first.getUTCDay() + 6) % 7; // segunda-feira primeiro
    const cells: (string | null)[] = [
      ...Array.from({ length: lead }, () => null),
      ...Array.from({ length: daysInMonth }, (_, i) => ymd(y, m, i + 1)),
    ];
    while (cells.length % 7) cells.push(null);
    return Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
  }, [month]);

  const slots = (date && availability?.days[date]) || [];
  const morning = slots.filter((s) => s < "13:00");
  const afternoon = slots.filter((s) => s >= "13:00");
  const monthHasSlots = availability ? Object.values(availability.days).some((d) => d.length) : true;
  const canPrev = !!availability && month > availability.months.first;
  const canNext = !!availability && month < availability.months.last;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    setSubmitError(null);
    if (Object.keys(found).length) {
      document.getElementById(`booking-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, date, time, ...form }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409) {
        setTime(null);
        setNotice(t.errors.slotTaken);
        setStep("datetime");
        setReloadKey((k) => k + 1);
        return;
      }
      if (!res.ok || !data.ok) throw new Error(data.error ?? res.status);
      setResult(data.booking);
      setStep("done");
    } catch (err) {
      console.error(err);
      setSubmitError(t.errors.generic);
    } finally {
      setSubmitting(false);
    }
  }

  function restart() {
    setStep("service");
    setServiceId(null);
    setMonth(currentMonth());
    setAvailability(null);
    setDate(null);
    setTime(null);
    setForm(emptyForm);
    setErrors({});
    setResult(null);
  }

  const stepIndex = { service: 0, datetime: 1, details: 2, done: 3 }[step];
  const location = fullAddress();

  const field = (name: "name" | "phone" | "email", type: string, autoComplete: string, hint?: string, half = false) => (
    <div className={`field${half ? " field--half" : ""}${errors[name] ? " field--error" : ""}`}>
      <label htmlFor={`booking-${name}`}>{t.fields[name]}</label>
      <input
        id={`booking-${name}`}
        type={type}
        autoComplete={autoComplete}
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        aria-invalid={!!errors[name]}
        aria-describedby={[hint && `booking-${name}-hint`, errors[name] && `booking-${name}-error`].filter(Boolean).join(" ") || undefined}
      />
      {hint && (
        <p id={`booking-${name}-hint`} className="field__hint">
          {hint}
        </p>
      )}
      {errors[name] && (
        <p id={`booking-${name}-error`} className="field__error">
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <>
      <div className="booking__aside">
        <h2 id="booking-title" className="booking__title">{t.title}</h2>
        <p className="booking__intro">{t.intro}</p>

        <ol className="booking__steps" aria-label={t.stepsLabel}>
          {t.steps.map((label, i) => (
            <li
              key={label}
              className={i < stepIndex ? "is-done" : i === stepIndex ? "is-current" : undefined}
              aria-current={i === stepIndex ? "step" : undefined}
            >
              {label}
            </li>
          ))}
        </ol>

        {service && step !== "done" && (
          <dl className="booking__summary">
            <div>
              <dt>{t.summary.service}</dt>
              <dd>
                {service.name}, {content.showcase.minutes(service.duration)}
              </dd>
              <button type="button" className="text-link" onClick={() => setStep("service")}>
                {t.change}
              </button>
            </div>
            {date && time && step === "details" && (
              <div>
                <dt>
                  {t.summary.date} / {t.summary.time}
                </dt>
                <dd>
                  {longDate(date)}, {time}
                </dd>
                <button type="button" className="text-link" onClick={() => setStep("datetime")}>
                  {t.change}
                </button>
              </div>
            )}
          </dl>
        )}
      </div>

      <div className="booking__panel" key={step}>
        {step === "service" && (
          <>
            <h3 ref={headingRef} tabIndex={-1} className="booking__heading">
              {t.chooseService}
            </h3>
            <div className="booking__services">
              {serviceColumns.map((column, c) => (
                <div key={c} className="booking__column">
                  {column.map((category) => (
                    <div key={category.id} className="booking__group">
                      <h4 className="booking__group-title">{category.name}</h4>
                      <ul>
                        {category.items.map((item) => (
                          <li key={item.id}>
                            <button
                              type="button"
                              className="option"
                              aria-pressed={serviceId === item.id}
                              onClick={() => chooseService(item.id)}
                            >
                              <span>{item.name}</span>
                              <span className="option__meta">{content.showcase.minutes(item.duration)}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}

        {step === "datetime" && (
          <>
            <h3 ref={headingRef} tabIndex={-1} className="booking__heading">
              {t.chooseDate}
            </h3>
            {notice && (
              <p className="booking__notice" role="alert">
                {notice}
              </p>
            )}

            {loadState === "error" ? (
              <div className="booking__error" role="alert">
                <p>{t.errors.loadFailed}</p>
                <button type="button" className="button button--small" onClick={() => setReloadKey((k) => k + 1)}>
                  {t.errors.retry}
                </button>
              </div>
            ) : (
              <div className="booking__datetime" aria-busy={loadState === "loading"}>
                <div className="calendar" role="group" aria-label={t.calendarLabel}>
                  <div className="calendar__head">
                    <button
                      type="button"
                      className="calendar__nav"
                      aria-label={t.prevMonth}
                      disabled={!canPrev || loadState === "loading"}
                      onClick={() => setMonth(shiftMonth(month, -1))}
                    >
                      ‹
                    </button>
                    <p className="calendar__month" aria-live="polite">
                      {monthLabel(month)}
                    </p>
                    <button
                      type="button"
                      className="calendar__nav"
                      aria-label={t.nextMonth}
                      disabled={!canNext || loadState === "loading"}
                      onClick={() => setMonth(shiftMonth(month, 1))}
                    >
                      ›
                    </button>
                  </div>
                  <table className="calendar__grid">
                    <thead>
                      <tr>
                        {weekdayNames(locale, "short").map((d) => (
                          <th key={d} scope="col" abbr={d}>
                            {d.slice(0, 3)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {weeks.map((week, wi) => (
                        <tr key={wi}>
                          {week.map((day, di) => {
                            if (!day) return <td key={di} />;
                            const count = availability?.month === month ? availability.days[day]?.length ?? 0 : 0;
                            const selected = day === date;
                            return (
                              <td key={day}>
                                <button
                                  type="button"
                                  className="calendar__day"
                                  disabled={!count || loadState === "loading"}
                                  aria-pressed={selected}
                                  aria-label={`${longDate(day)}, ${count ? t.slotsCount(count) : t.noSlots}`}
                                  onClick={() => {
                                    setDate(day);
                                    setTime(null);
                                    setNotice(null);
                                  }}
                                >
                                  {Number(day.slice(8))}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="booking__tz">{t.timezoneNote}</p>
                </div>

                <div className="slots">
                  {loadState === "loading" ? (
                    <p className="slots__status">{t.loading}</p>
                  ) : !monthHasSlots ? (
                    <div className="slots__status">
                      <p>{t.noSlotsMonth}</p>
                      {canNext && (
                        <button type="button" className="button button--small" onClick={() => setMonth(shiftMonth(month, 1))}>
                          {t.nextMonth}
                        </button>
                      )}
                    </div>
                  ) : !date ? (
                    <p className="slots__status">{t.pickDateFirst}</p>
                  ) : !slots.length ? (
                    <p className="slots__status">{t.noSlotsDay}</p>
                  ) : (
                    <>
                      <p className="slots__date">{longDate(date)}</p>
                      {[
                        [t.morning, morning],
                        [t.afternoon, afternoon],
                      ].map(([label, list]) =>
                        (list as string[]).length ? (
                          <div key={label as string} className="slots__group">
                            <p className="slots__label">{label as string}</p>
                            <ul className="slots__list" aria-label={`${label}, ${t.timesFor(longDate(date))}`}>
                              {(list as string[]).map((slot) => (
                                <li key={slot}>
                                  <button
                                    type="button"
                                    className="slot"
                                    aria-pressed={slot === time}
                                    onClick={() => {
                                      setTime(slot);
                                      setStep("details");
                                    }}
                                  >
                                    {slot}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null,
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {availability?.mode === "demo" && <p className="booking__demo">{t.demoNotice}</p>}
          </>
        )}

        {step === "details" && service && date && time && (
          <form className="booking__form" onSubmit={submit} noValidate>
            <h3 ref={headingRef} tabIndex={-1} className="booking__heading">
              {t.yourDetails}
            </h3>
            {field("name", "text", "name")}
            {field("phone", "tel", "tel", t.fields.phoneHint, true)}
            {field("email", "email", "email", undefined, true)}
            <div className="field">
              <label htmlFor="booking-notes">{t.fields.notes}</label>
              <textarea
                id="booking-notes"
                rows={3}
                maxLength={600}
                placeholder={t.fields.notesPlaceholder}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            {/* Armadilha para robôs: invisível para pessoas. */}
            <div className="field--trap" aria-hidden="true">
              <label htmlFor="booking-website">Website</label>
              <input
                id="booking-website"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </div>
            <div className={`field field--check${errors.consent ? " field--error" : ""}`}>
              <input
                id="booking-consent"
                type="checkbox"
                checked={form.consent}
                onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                aria-invalid={!!errors.consent}
                aria-describedby={errors.consent ? "booking-consent-error" : undefined}
              />
              <label htmlFor="booking-consent">
                {t.fields.consent}{" "}
                <a href="/privacidade" target="_blank" rel="noopener">
                  {t.fields.privacyLink}
                </a>
              </label>
              {errors.consent && (
                <p id="booking-consent-error" className="field__error">
                  {errors.consent}
                </p>
              )}
            </div>
            {submitError && (
              <p className="booking__notice" role="alert">
                {submitError}
              </p>
            )}
            <RollButton type="submit" className="booking__submit" label={submitting ? t.submitting : t.submit} disabled={submitting} />
          </form>
        )}

        {step === "done" && result && date && time && (
          <div className="booking__done">
            <h3 ref={headingRef} tabIndex={-1} className="booking__heading">
              {t.success.title}
            </h3>
            <dl className="booking__receipt">
              <div>
                <dt>{t.summary.service}</dt>
                <dd>{result.serviceName}</dd>
              </div>
              <div>
                <dt>{t.summary.date}</dt>
                <dd>{longDate(date)}</dd>
              </div>
              <div>
                <dt>{t.summary.time}</dt>
                <dd>{time}</dd>
              </div>
              <div>
                <dt>{t.summary.duration}</dt>
                <dd>{content.showcase.minutes(result.duration)}</dd>
              </div>
            </dl>
            <p className="booking__done-text">{t.success.text}</p>
            <div className="booking__actions">
              <a
                className="button"
                href={googleCalendarUrl({
                  title: t.clientEventTitle(result.serviceName),
                  start: result.start,
                  end: result.end,
                  location,
                })}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.success.addToGoogle}
              </a>
              <a
                className="text-link"
                href={icsDataUrl({ title: t.clientEventTitle(result.serviceName), start: result.start, end: result.end, location })}
                download="marga-beauty.ics"
              >
                {t.success.downloadIcs}
              </a>
              {business.whatsapp && (
                <a
                  className="text-link"
                  href={whatsappUrl(t.success.whatsappMessage(result.serviceName, longDate(date), time, form.name.trim()))}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.success.whatsapp}
                </a>
              )}
              <button type="button" className="text-link" onClick={restart}>
                {t.success.again}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
