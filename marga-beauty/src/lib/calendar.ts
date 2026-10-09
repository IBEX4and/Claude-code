import "server-only";
import { JWT } from "google-auth-library";
import { DateTime } from "luxon";
import { bookingRules } from "@/config/business";
import type { BusyInterval } from "./slots";

/**
 * Acesso ao Google Agenda da Marga via conta de serviço.
 * Sem as variáveis de ambiente, o site roda em modo demonstração
 * (ocupações simuladas e agendamentos guardados só na memória do servidor).
 */

const API = "https://www.googleapis.com/calendar/v3";

const env = {
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  calendarId: process.env.GOOGLE_CALENDAR_ID,
  /** Outras agendas (ex.: pessoal) que também bloqueiam horários. Separadas por vírgula. */
  extraBusy: (process.env.GOOGLE_EXTRA_BUSY_CALENDAR_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
};

export type CalendarMode = "google" | "demo";
export const calendarMode: CalendarMode = env.email && env.key && env.calendarId ? "google" : "demo";

let client: JWT | null = null;
function google(): JWT {
  client ??= new JWT({
    email: env.email,
    key: env.key,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
  return client;
}

type FreeBusyResponse = {
  calendars: Record<string, { busy?: BusyInterval[]; errors?: { reason: string }[] }>;
};

export async function getBusy(from: DateTime, to: DateTime): Promise<BusyInterval[]> {
  if (calendarMode === "demo") return demoBusy(from, to);

  const ids = [env.calendarId!, ...env.extraBusy];
  const res = await google().request<FreeBusyResponse>({
    url: `${API}/freeBusy`,
    method: "POST",
    data: {
      timeMin: from.toISO(),
      timeMax: to.toISO(),
      timeZone: bookingRules.timezone,
      items: ids.map((id) => ({ id })),
    },
  });

  const busy: BusyInterval[] = [];
  for (const id of ids) {
    const cal = res.data.calendars[id];
    if (cal?.errors?.length) {
      throw new Error(`Google Agenda recusou a leitura de "${id}": ${cal.errors.map((e) => e.reason).join(", ")}`);
    }
    busy.push(...(cal?.busy ?? []));
  }
  return busy;
}

export async function createEvent(event: {
  summary: string;
  description: string;
  location?: string;
  start: DateTime;
  end: DateTime;
}): Promise<void> {
  if (calendarMode === "demo") {
    demoBookings.push({ start: event.start.toISO()!, end: event.end.toISO()! });
    return;
  }
  await google().request({
    url: `${API}/calendars/${encodeURIComponent(env.calendarId!)}/events`,
    method: "POST",
    data: {
      summary: event.summary,
      description: event.description,
      location: event.location || undefined,
      start: { dateTime: event.start.toISO(), timeZone: bookingRules.timezone },
      end: { dateTime: event.end.toISO(), timeZone: bookingRules.timezone },
      extendedProperties: { private: { source: "marga-beauty-site" } },
    },
  });
}

/* ---------- Modo demonstração ---------- */

// Guardado no globalThis para ser compartilhado entre as rotas da API no mesmo processo.
const store = globalThis as typeof globalThis & { __margaDemoBookings?: BusyInterval[] };
const demoBookings = (store.__margaDemoBookings ??= []);

/** Gera de 1 a 3 compromissos fictícios por dia, sempre iguais para a mesma data. */
function demoBusy(from: DateTime, to: DateTime): BusyInterval[] {
  const busy: BusyInterval[] = [...demoBookings];
  for (let day = from.startOf("day"); day <= to; day = day.plus({ days: 1 })) {
    let seed = Number(day.toFormat("yyyyMMdd"));
    const rand = () => {
      seed = (seed * 1_103_515_245 + 12_345) % 2_147_483_648;
      return seed / 2_147_483_648;
    };
    const count = 1 + Math.floor(rand() * 3);
    for (let i = 0; i < count; i++) {
      const startHour = 9 + Math.floor(rand() * 9);
      const startMin = rand() > 0.5 ? 30 : 0;
      const start = day.set({ hour: startHour, minute: startMin });
      const end = start.plus({ minutes: 60 + Math.floor(rand() * 2) * 30 });
      busy.push({ start: start.toISO()!, end: end.toISO()! });
    }
  }
  return busy;
}
