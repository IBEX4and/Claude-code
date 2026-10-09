/** Domingo de Páscoa (calendário gregoriano, algoritmo de Meeus/Jones/Butcher). */
function easterSunday(year: number): { month: number; day: number } {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Feriados nacionais italianos no formato AAAA-MM-DD.
 * O padroeiro da cidade varia: adicione em `bookingRules.closedDates`.
 */
export function italianHolidays(year: number): string[] {
  const fixed = [
    "01-01", // Capodanno
    "01-06", // Epifania
    "04-25", // Festa della Liberazione
    "05-01", // Festa del Lavoro
    "06-02", // Festa della Repubblica
    "08-15", // Ferragosto
    "11-01", // Ognissanti
    "12-08", // Immacolata Concezione
    "12-25", // Natale
    "12-26", // Santo Stefano
  ];
  // San Francesco d'Assisi voltou a ser feriado nacional a partir de 2026.
  if (year >= 2026) fixed.push("10-04");

  const easter = easterSunday(year);
  const easterDate = new Date(Date.UTC(year, easter.month - 1, easter.day));
  const pasquetta = new Date(easterDate.getTime() + 86_400_000);

  return [
    ...fixed.map((md) => `${year}-${md}`),
    `${year}-${pad(easter.month)}-${pad(easter.day)}`,
    `${pasquetta.getUTCFullYear()}-${pad(pasquetta.getUTCMonth() + 1)}-${pad(pasquetta.getUTCDate())}`,
  ];
}
