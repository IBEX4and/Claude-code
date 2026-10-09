import { DateTime } from "luxon";
import { NextResponse } from "next/server";
import { bookingRules, fullAddress } from "@/config/business";
import { content } from "@/content";
import { loadAvailability } from "@/lib/availability";
import { calendarMode, createEvent } from "@/lib/calendar";
import { findService } from "@/lib/services";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[\d\s().-]{8,22}$/;

type Body = {
  serviceId?: unknown;
  date?: unknown;
  time?: unknown;
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  notes?: unknown;
  consent?: unknown;
  /** Campo invisível: se vier preenchido, é robô. */
  website?: unknown;
};

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** POST /api/book → confere se o horário ainda está livre e cria o evento na agenda. */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid", fields: ["body"] }, { status: 400 });
  }

  const input = {
    serviceId: str(body.serviceId, 64),
    date: str(body.date, 10),
    time: str(body.time, 5),
    name: str(body.name, 80),
    phone: str(body.phone, 30),
    email: str(body.email, 120),
    notes: str(body.notes, 600),
  };

  // Robôs costumam preencher todos os campos; respondemos "ok" sem agendar nada.
  if (str(body.website, 200)) return NextResponse.json({ ok: true }, { status: 201 });

  const service = findService(input.serviceId);
  const invalid: string[] = [];
  if (!service) invalid.push("serviceId");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) invalid.push("date");
  if (!/^\d{2}:\d{2}$/.test(input.time)) invalid.push("time");
  if (input.name.length < 2) invalid.push("name");
  if (!PHONE.test(input.phone) || input.phone.replace(/\D/g, "").length < 8) invalid.push("phone");
  if (!EMAIL.test(input.email)) invalid.push("email");
  if (body.consent !== true) invalid.push("consent");
  if (invalid.length || !service) return NextResponse.json({ error: "invalid", fields: invalid }, { status: 400 });

  try {
    // Consulta a agenda de novo no momento da confirmação: alguém pode ter reservado
    // o mesmo horário enquanto a pessoa preenchia o formulário.
    const days = await loadAvailability(service.duration, input.date, input.date);
    if (!days[input.date]?.includes(input.time)) {
      return NextResponse.json({ error: "slot_taken" }, { status: 409 });
    }

    const start = DateTime.fromISO(`${input.date}T${input.time}`, { zone: bookingRules.timezone });
    const end = start.plus({ minutes: service.duration });
    const labels = content.booking.eventDetails;

    await createEvent({
      summary: content.booking.eventTitle(service.name, input.name),
      description: [
        `${labels.phone}: ${input.phone}`,
        `${labels.email}: ${input.email}`,
        input.notes ? `${labels.notes}: ${input.notes}` : null,
        "",
        labels.source,
      ]
        .filter((line) => line !== null)
        .join("\n"),
      location: fullAddress(),
      start,
      end,
    });

    return NextResponse.json(
      {
        ok: true,
        mode: calendarMode,
        booking: {
          serviceId: service.id,
          serviceName: service.name,
          duration: service.duration,
          start: start.toISO(),
          end: end.toISO(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[book]", error);
    return NextResponse.json({ error: "calendar_unavailable" }, { status: 502 });
  }
}
