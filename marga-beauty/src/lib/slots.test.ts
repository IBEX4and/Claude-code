import { test } from "node:test";
import assert from "node:assert/strict";
import { DateTime } from "luxon";
import { computeAvailability, type SlotRules } from "./slots.ts";
import { italianHolidays } from "./holidays.ts";

const rules: SlotRules = {
  timezone: "Europe/Rome",
  weeklyHours: {
    1: [["09:00", "13:00"], ["14:00", "19:00"]],
    2: [["09:00", "13:00"], ["14:00", "19:00"]],
    3: [["09:00", "13:00"], ["14:00", "19:00"]],
    4: [["09:00", "13:00"], ["14:00", "19:00"]],
    5: [["09:00", "13:00"], ["14:00", "19:00"]],
    6: [["09:00", "14:00"]],
    7: [],
  },
  slotStepMinutes: 30,
  bufferMinutes: 15,
  minNoticeMinutes: 180,
  maxDaysAhead: 60,
  closeOnItalianHolidays: true,
  closedDates: [],
};

// Sexta-feira, 9 de outubro de 2026, 08:00 em Roma.
const now = DateTime.fromISO("2026-10-09T08:00", { zone: "Europe/Rome" });

test("respeita janelas e pausa de almoço", () => {
  const days = computeAvailability({ rules, durationMinutes: 60, from: "2026-10-12", to: "2026-10-12", busy: [], now });
  const monday = days["2026-10-12"];
  assert.equal(monday[0], "09:00");
  assert.ok(monday.includes("12:00"), "12:00 + 60 min termina às 13:00");
  assert.ok(!monday.includes("12:30"), "12:30 + 60 min invadiria o almoço");
  assert.ok(!monday.includes("13:00"));
  assert.ok(monday.includes("14:00"));
  assert.equal(monday.at(-1), "18:00");
});

test("bloqueia horários ocupados com folga antes e depois", () => {
  const busy = [{ start: "2026-10-12T10:00:00+02:00", end: "2026-10-12T11:00:00+02:00" }];
  const monday = computeAvailability({ rules, durationMinutes: 60, from: "2026-10-12", to: "2026-10-12", busy, now })["2026-10-12"];
  assert.ok(!monday.includes("09:00"), "09:00–10:00 não deixa os 15 min de folga");
  assert.ok(!monday.includes("10:00"));
  assert.ok(!monday.includes("10:30"));
  assert.ok(!monday.includes("11:00"), "11:00 começa antes do fim da folga (11:15)");
  assert.ok(monday.includes("11:30"));
});

test("aplica antecedência mínima no dia de hoje", () => {
  const today = computeAvailability({ rules, durationMinutes: 45, from: "2026-10-09", to: "2026-10-09", busy: [], now })["2026-10-09"];
  assert.equal(today[0], "11:00", "agora 08:00 + 3h de antecedência");
});

test("domingo, feriados e datas fechadas ficam sem horários", () => {
  const custom = { ...rules, closedDates: ["2026-10-14"] };
  const days = computeAvailability({ rules: custom, durationMinutes: 60, from: "2026-10-11", to: "2026-11-02", busy: [], now });
  assert.deepEqual(days["2026-10-11"], [], "domingo");
  assert.deepEqual(days["2026-10-14"], [], "data fechada manualmente");
  assert.ok(days["2026-11-02"].length > 0);
  assert.deepEqual(days["2026-11-01"], [], "Ognissanti (e domingo)");
  assert.deepEqual(days["2026-10-04"], undefined, "antes de hoje");
  assert.deepEqual(computeAvailability({ rules, durationMinutes: 60, from: "2027-10-04", to: "2027-10-04", busy: [], now: DateTime.fromISO("2027-10-01T08:00", { zone: "Europe/Rome" }) })["2027-10-04"], [], "San Francesco (segunda-feira)");
});

test("não oferece dias passados nem além do limite", () => {
  const days = computeAvailability({ rules, durationMinutes: 60, from: "2026-10-01", to: "2026-12-31", busy: [], now });
  assert.equal(days["2026-10-08"], undefined, "ontem");
  assert.ok(days["2026-12-07"].length > 0, "07/12 dentro dos 60 dias");
  assert.deepEqual(days["2026-12-08"], [], "08/12 é o último dia, mas é feriado");
  assert.equal(days["2026-12-09"], undefined, "além de 60 dias");
});

test("serviço que não cabe no sábado curto", () => {
  const saturday = computeAvailability({ rules, durationMinutes: 75, from: "2026-10-17", to: "2026-10-17", busy: [], now })["2026-10-17"];
  assert.equal(saturday.at(-1), "12:30", "12:30 + 75 min termina 13:45, antes das 14:00");
});

test("horário de verão: dia da troca continua correto", () => {
  const days = computeAvailability({ rules, durationMinutes: 60, from: "2026-10-26", to: "2026-10-26", busy: [], now });
  assert.equal(days["2026-10-26"][0], "09:00");
});

test("Páscoa e Pasquetta", () => {
  assert.ok(italianHolidays(2027).includes("2027-03-28"));
  assert.ok(italianHolidays(2027).includes("2027-03-29"));
  assert.ok(italianHolidays(2026).includes("2026-04-06"));
});
