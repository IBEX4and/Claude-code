/**
 * Dados do negócio e regras da agenda.
 * Tudo que estiver marcado com TODO precisa ser confirmado com a cliente.
 */

export type TimeRange = [start: string, end: string];

/** 1 = segunda ... 7 = domingo (padrão ISO, igual ao Luxon). */
export type WeeklyHours = Record<1 | 2 | 3 | 4 | 5 | 6 | 7, TimeRange[]>;

export const business = {
  name: "Marga Beauty",
  address: "Via L. Carcano, 11",
  postalCode: "22070",
  city: "Rovello Porro",
  /** Sigla da província (Como). */
  province: "CO",
  country: "Itália",
  /** Número com DDI, só dígitos: usado no link direto do WhatsApp. */
  whatsapp: "393758620602",
  phoneDisplay: "+39 375 862 0602",
  // TODO: e-mail de contato (vazio esconde a linha no rodapé)
  email: "",
  instagram: "https://www.instagram.com/marga_beauty_official/",
  instagramHandle: "@marga_beauty_official",
  // TODO: na Itália a Partita IVA precisa aparecer no site.
  vatNumber: "",
};

/** Endereço completo no formato italiano: "Via L. Carcano, 11, 22070 Rovello Porro (CO), Itália". */
export function fullAddress() {
  const { address, postalCode, city, province, country } = business;
  const locality = [postalCode, city].filter(Boolean).join(" ") + (province ? ` (${province})` : "");
  return [address, locality.trim(), country].filter(Boolean).join(", ");
}

/** Link do WhatsApp que já abre a conversa, opcionalmente com uma mensagem pronta. */
export function whatsappUrl(message?: string) {
  if (!business.whatsapp) return "";
  return `https://wa.me/${business.whatsapp}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

/** Link para abrir o endereço no Google Maps. */
export function mapsUrl() {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.name}, ${fullAddress()}`)}`;
}

export const bookingRules = {
  timezone: "Europe/Rome",
  // TODO: confirmar horários reais. Cada intervalo é uma janela de atendimento;
  // o espaço entre as janelas é a pausa (ex.: almoço).
  weeklyHours: {
    1: [["09:00", "13:00"], ["14:00", "19:00"]],
    2: [["09:00", "13:00"], ["14:00", "19:00"]],
    3: [["09:00", "13:00"], ["14:00", "19:00"]],
    4: [["09:00", "13:00"], ["14:00", "19:00"]],
    5: [["09:00", "13:00"], ["14:00", "19:00"]],
    6: [["09:00", "14:00"]],
    7: [],
  } satisfies WeeklyHours as WeeklyHours,
  /** De quanto em quanto tempo um horário pode começar. */
  slotStepMinutes: 30,
  /** Intervalo livre antes e depois de cada compromisso (preparar a sala). */
  bufferMinutes: 15,
  /** Antecedência mínima para agendar online. */
  minNoticeMinutes: 180,
  /** Até quantos dias à frente a agenda fica aberta. */
  maxDaysAhead: 60,
  /** Feriados nacionais italianos fecham a agenda automaticamente. */
  closeOnItalianHolidays: true,
  /** Datas extras fechadas (férias, eventos), formato AAAA-MM-DD. */
  closedDates: [] as string[],
};
