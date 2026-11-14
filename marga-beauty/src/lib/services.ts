import { areas, type Treatment } from "@/content/treatments";

export type ServiceItem = Treatment & {
  areaId: string;
  areaName: string;
  categoryName: string;
  /** Nome usato in agenda e nel riepilogo: include l'area (Donna/Uomo). */
  label: string;
  /** Minuti occupati in agenda (interno, non mostrato sul sito). */
  duration: number;
};

/**
 * Durata interna di ogni servizio, usata solo per calcolare gli orari liberi.
 * TODO: far confermare a Marga le durate reali prima di collegare Google Calendar.
 */
const DEFAULT_DURATION = 60;
const durations: Record<string, number> = {
  "viso-e-nuca": 30,
  "viso-e-collo": 30,
  "braccia-e-ascelle": 45,
  "manicure-base": 45,
  "trattamento-rinforzante-unghie": 45,
  rimozioni: 30,
  "rimozione-semipermanente-mani": 30,
  "rimozione-semipermanente-piedi": 30,
  "ricostruzione-singola-unghia-del-piede": 30,
  "tintura-sopracciglia-e-ciglia": 30,
  "tintura-sopracciglia": 30,
  "tintura-ciglia": 30,
  "applicazione-ciglia-finte-monouso": 30,
  "rimozione-make-up": 30,
  "laminazione-ciglia": 45,
  "laminazione-sopracciglia": 45,
  "massaggio-linfodrenante-gambe": 45,
  "esfoliazione-e-scrub-corpo": 45,
  "scrub-carezza-di-seta": 45,
  "extension-ciglia": 90,
  "gel-e-ricostruzione": 90,
};

export const services: ServiceItem[] = areas.flatMap((area) =>
  area.categories.flatMap((category) =>
    category.groups.flatMap((group) =>
      group.items.map((item) => {
        const key = item.id.slice(area.id.length + 1);
        const name = category.id.endsWith("-cera") ? `Cera brasiliana: ${item.name}` : item.name;
        return {
          ...item,
          areaId: area.id,
          areaName: area.name,
          categoryName: category.name,
          label: `${name} (${area.name})`,
          duration: durations[key] ?? DEFAULT_DURATION,
        };
      }),
    ),
  ),
);

export function findService(id: string): ServiceItem | undefined {
  return services.find((s) => s.id === id);
}
