import { DateTime } from "luxon";
import type { WeeklyHours } from "../config/business.ts";
import { italianHolidays } from "./holidays.ts";

export type BusyInterval = { start: string; end: string };

export type SlotRules = {
  timezone: string;
  weeklyHours: WeeklyHours;
  slotStepMinutes: number;
  bufferMinutes: number;
  minNoticeMinutes: number;
  maxDaysAhead: number;
  closeOnItalianHolidays: boolean;
  closedDates: string[];
};

/** Mapa dia (AAAA-MM-DD) → horários de início livres (HH:mm), no fuso do estúdio. */
export type Availability = Record<string, string[]>;

export function isClosedDate(date: string, rules: SlotRules): boolean {
  if (rules.closedDates.includes(date)) return true;
  if (!rules.closeOnItalianHolidays) return false;
  return italianHolidays(Number(date.slice(0, 4))).includes(date);
}

function atTime(day: DateTime, hhmm: string): DateTime {
  const [hour, minute] = hhmm.split(":").map(Number);
  return day.set({ hour, minute, second: 0, millisecond: 0 });
}

/**
 * Calcula os horários livres para um serviço entre `from` e `to` (inclusive).
 *
 * Um horário é oferecido quando:
 * - cabe inteiro dentro de uma janela de atendimento do dia (respeita pausas);
 * - não encosta em nenhum compromisso ocupado, considerando a folga `bufferMinutes`
 *   antes e depois de cada um;
 * - começa depois de `now + minNoticeMinutes` e até `maxDaysAhead` dias à frente;
 * - o dia não é feriado nem data fechada.
 *
 * Dias fora do período agendável não aparecem no resultado; dias agendáveis sem
 * vaga aparecem com lista vazia.
 */
export function computeAvailability(params: {
  rules: SlotRules;
  durationMinutes: number;
  from: string;
  to: string;
  busy: BusyInterval[];
  now: DateTime;
}): Availability {
  const { rules, durationMinutes, busy } = params;
  const zone = rules.timezone;
  const now = params.now.setZone(zone);
  const today = now.startOf("day");
  const earliestStart = now.plus({ minutes: rules.minNoticeMinutes });
  const lastBookableDay = today.plus({ days: rules.maxDaysAhead });
  const bufferMs = rules.bufferMinutes * 60_000;
  const durationMs = durationMinutes * 60_000;

  const blocked = busy
    .map((b) => [Date.parse(b.start) - bufferMs, Date.parse(b.end) + bufferMs] as const)
    .filter(([s, e]) => Number.isFinite(s) && Number.isFinite(e));

  const result: Availability = {};
  const lastDay = DateTime.fromISO(params.to, { zone }).startOf("day");

  for (
    let day = DateTime.fromISO(params.from, { zone }).startOf("day");
    day <= lastDay;
    day = day.plus({ days: 1 })
  ) {
    if (day < today || day > lastBookableDay) continue;
    const key = day.toISODate()!;
    const slots: string[] = [];
    result[key] = slots;
    if (isClosedDate(key, rules)) continue;

    const windows = rules.weeklyHours[day.weekday as keyof WeeklyHours] ?? [];
    for (const [open, close] of windows) {
      const closeAt = atTime(day, close);
      for (
        let start = atTime(day, open);
        start.plus({ minutes: durationMinutes }) <= closeAt;
        start = start.plus({ minutes: rules.slotStepMinutes })
      ) {
        if (start < earliestStart) continue;
        const s = start.toMillis();
        const e = s + durationMs;
        if (blocked.some(([bs, be]) => s < be && e > bs)) continue;
        slots.push(start.toFormat("HH:mm"));
      }
    }
  }
  return result;
}
