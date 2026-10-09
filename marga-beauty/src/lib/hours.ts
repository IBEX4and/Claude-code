import type { WeeklyHours } from "@/config/business";

const capitalize = (s: string) => s.charAt(0).toLocaleUpperCase() + s.slice(1);

/** Nomes dos dias, de segunda (1) a domingo (7), no idioma do site. */
export function weekdayNames(locale: string, style: "long" | "short" | "narrow" = "long"): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: style, timeZone: "UTC" });
  // 1º de janeiro de 2024 foi uma segunda-feira.
  return Array.from({ length: 7 }, (_, i) => capitalize(fmt.format(new Date(Date.UTC(2024, 0, 1 + i)))));
}

/** Agrupa dias seguidos com o mesmo horário: "Segunda-feira – sexta-feira: 09:00–13:00, 14:00–19:00". */
export function groupWeeklyHours(hours: WeeklyHours, locale: string, closedLabel: string) {
  const names = weekdayNames(locale);
  const rows: { days: string; hours: string }[] = [];
  let i = 1;
  while (i <= 7) {
    const key = JSON.stringify(hours[i as keyof WeeklyHours]);
    let j = i;
    while (j < 7 && JSON.stringify(hours[(j + 1) as keyof WeeklyHours]) === key) j++;
    const ranges = hours[i as keyof WeeklyHours];
    rows.push({
      days: i === j ? names[i - 1] : `${names[i - 1]} – ${names[j - 1].toLocaleLowerCase()}`,
      hours: ranges.length ? ranges.map(([a, b]) => `${a}–${b}`).join(", ") : closedLabel,
    });
    i = j + 1;
  }
  return rows;
}
