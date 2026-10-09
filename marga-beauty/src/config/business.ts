/**
 * Dados do negócio e regras da agenda.
 * Tudo que estiver marcado com TODO precisa ser confirmado com a cliente.
 */

export type TimeRange = [start: string, end: string];

/** 1 = segunda ... 7 = domingo (padrão ISO, igual ao Luxon). */
export type WeeklyHours = Record<1 | 2 | 3 | 4 | 5 | 6 | 7, TimeRange[]>;

export const business: Record<
  "name" | "city" | "country" | "address" | "whatsapp" | "phoneDisplay" | "email" | "instagram" | "instagramHandle" | "vatNumber",
  string
> = {
  name: "Marga Beauty",
  // TODO: cidade e endereço completos do estúdio
  city: "",
  country: "Itália",
  address: "",
  // TODO: número com DDI, só dígitos (ex.: 393331234567). Vazio esconde os botões de WhatsApp.
  whatsapp: "",
  phoneDisplay: "",
  email: "",
  instagram: "https://www.instagram.com/marga_beauty_official/",
  instagramHandle: "@marga_beauty_official",
  // Na Itália a Partita IVA precisa aparecer no site.
  vatNumber: "",
};

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
