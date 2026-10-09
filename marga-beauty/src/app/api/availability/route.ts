import { DateTime } from "luxon";
import { NextResponse } from "next/server";
import { bookingRules } from "@/config/business";
import { bookableMonths, loadAvailability } from "@/lib/availability";
import { calendarMode } from "@/lib/calendar";
import { findService } from "@/lib/services";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/availability?service=<id>&month=AAAA-MM → horários livres de cada dia do mês. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const service = findService(params.get("service") ?? "");
  if (!service) return NextResponse.json({ error: "unknown_service" }, { status: 404 });

  const zone = bookingRules.timezone;
  const months = bookableMonths();
  const month = params.get("month") ?? months.first;
  if (!/^\d{4}-\d{2}$/.test(month) || month < months.first || month > months.last) {
    return NextResponse.json({ error: "invalid_month", months }, { status: 400 });
  }

  const monthStart = DateTime.fromFormat(month, "yyyy-MM", { zone });
  const today = DateTime.now().setZone(zone).startOf("day");
  const lastDay = today.plus({ days: bookingRules.maxDaysAhead });
  const from = DateTime.max(monthStart, today);
  const to = DateTime.min(monthStart.endOf("month").startOf("day"), lastDay);

  try {
    const days = await loadAvailability(service.duration, from.toISODate()!, to.toISODate()!);
    return NextResponse.json(
      { mode: calendarMode, timezone: zone, month, months, duration: service.duration, days },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[availability]", error);
    return NextResponse.json({ error: "calendar_unavailable" }, { status: 502 });
  }
}
