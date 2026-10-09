import "server-only";
import { DateTime } from "luxon";
import { bookingRules } from "@/config/business";
import { getBusy } from "./calendar";
import { computeAvailability, type Availability } from "./slots";

/** Lê as ocupações da agenda e calcula os horários livres entre duas datas (AAAA-MM-DD). */
export async function loadAvailability(durationMinutes: number, from: string, to: string): Promise<Availability> {
  const zone = bookingRules.timezone;
  const start = DateTime.fromISO(from, { zone }).startOf("day");
  const end = DateTime.fromISO(to, { zone }).endOf("day");
  const busy = await getBusy(start, end);
  return computeAvailability({ rules: bookingRules, durationMinutes, from, to, busy, now: DateTime.now() });
}

/** Primeiro e último mês (AAAA-MM) que podem ser agendados hoje. */
export function bookableMonths(): { first: string; last: string } {
  const today = DateTime.now().setZone(bookingRules.timezone).startOf("day");
  return {
    first: today.toFormat("yyyy-MM"),
    last: today.plus({ days: bookingRules.maxDaysAhead }).toFormat("yyyy-MM"),
  };
}
