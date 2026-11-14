/**
 * Trattamenti del sito, divisi nelle aree Donna e Uomo (documento
 * "MARGA_02 Estrutura e Textos Site"). Testi in italiano, senza prezzi né durate.
 *
 * Per aggiungere più avanti le tecnologie estetiche avanzate: creare una nuova
 * categoria in ciascuna area (es. id "donna-tecnologie") solo quando i contenuti
 * sono confermati. Le categorie vuote non vengono pubblicate.
 */

import type { VisualKey } from "./images";

export type Treatment = { id: string; name: string; description: string };
export type TreatmentGroup = { title: string; items: Treatment[] };
export type TreatmentCategory = {
  id: string;
  name: string;
  intro: string;
  groups: TreatmentGroup[];
  notes: string[];
  /** Foto della categoria (chiave di `images.ts`). */
  image: VisualKey;
};
export type TreatmentArea = {
  id: "donna" | "uomo";
  name: string;
  categories: TreatmentCategory[];
};

export const areas: TreatmentArea[] = [
  {
    id: "donna",
    name: "Donna",
    categories: [
      {
        id: "donna-cera",
        name: "Epilazione con cera brasiliana",
        intro: "Epilazione mirata delle diverse zone, con attenzione alla pelle e alla precisione del risultato.",
        groups: [
          {
            title: "",
            items: [
              {
                id: "donna-viso-e-nuca",
                name: "Viso e nuca",
                description: "",
              },
              {
                id: "donna-braccia-e-ascelle",
                name: "Braccia e ascelle",
                description: "",
              },
              {
                id: "donna-gambe-e-piedi",
                name: "Gambe e piedi",
                description: "",
              },
              {
                id: "donna-zone-intime-e-glutei",
                name: "Zone intime e glutei",
                description: "",
              },
            ],
          },
        ],
        notes: [],
        image: "margaAbito",
      },
      {
        id: "donna-viso",
        name: "Trattamenti viso",
        intro: "",
        groups: [
          {
            title: "",
            items: [
              {
                id: "donna-pulizia-del-viso-manuale",
                name: "Pulizia del viso manuale",
                description: "",
              },
              {
                id: "donna-pulizia-del-viso-trattamento",
                name: "Pulizia del viso + trattamento",
                description: "",
              },
              {
                id: "donna-miracle-face",
                name: "Miracle Face",
                description: "",
              },
              {
                id: "donna-tintura-sopracciglia-e-ciglia",
                name: "Tintura sopracciglia e ciglia",
                description: "",
              },
              {
                id: "donna-laminazione-ciglia-e-sopracciglia",
                name: "Laminazione ciglia e sopracciglia",
                description: "",
              },
              {
                id: "donna-extension-ciglia",
                name: "Extension ciglia",
                description: "",
              },
              {
                id: "donna-trucco-sposa",
                name: "Trucco sposa",
                description: "",
              },
              {
                id: "donna-trucco-giorno-e-sera",
                name: "Trucco giorno e sera",
                description: "",
              },
            ],
          },
        ],
        notes: [],
        image: "margaCamicia",
      },
      {
        id: "donna-corpo",
        name: "Trattamenti corpo",
        intro: "",
        groups: [
          {
            title: "",
            items: [
              {
                id: "donna-massaggio-linfodrenante",
                name: "Massaggio linfodrenante",
                description:
                  "Una tecnica brasiliana esclusiva, sviluppata da Renata França, caratterizzata da manualità specifiche, pressioni decise e un ritmo sostenuto.",
              },
              {
                id: "donna-massaggio-linfodrenante-dolce-attesa",
                name: "Massaggio linfodrenante Dolce Attesa",
                description: "",
              },
              {
                id: "donna-scrub-carezza-di-seta",
                name: "Scrub Carezza di Seta",
                description: "",
              },
              {
                id: "donna-trattamento-purificante-schiena",
                name: "Trattamento purificante schiena",
                description: "",
              },
            ],
          },
        ],
        notes: [],
        image: "margaDivisa",
      },
      {
        id: "donna-mani-piedi",
        name: "Mani e piedi",
        intro: "",
        groups: [
          {
            title: "",
            items: [
              {
                id: "donna-manicure-base",
                name: "Manicure base",
                description: "",
              },
              {
                id: "donna-manicure-brazilian-spa",
                name: "Manicure Brazilian Spa",
                description: "",
              },
              {
                id: "donna-manicure-con-semipermanente",
                name: "Manicure con semipermanente",
                description: "",
              },
              {
                id: "donna-trattamento-rinforzante-unghie",
                name: "Trattamento rinforzante unghie",
                description: "",
              },
              {
                id: "donna-gel-e-ricostruzione",
                name: "Gel e ricostruzione",
                description: "",
              },
              {
                id: "donna-pedicure-base",
                name: "Pedicure base",
                description: "",
              },
              {
                id: "donna-pedicure-piedi-di-velluto",
                name: "Pedicure Piedi di Velluto",
                description: "",
              },
              {
                id: "donna-pedicure-estetico-completo-deluxe",
                name: "Pedicure estetico completo Deluxe",
                description: "",
              },
              {
                id: "donna-ricostruzione-singola-unghia-del-piede",
                name: "Ricostruzione singola unghia del piede",
                description: "",
              },
            ],
          },
        ],
        notes: [],
        image: "marga",
      },
    ],
  },
  {
    id: "uomo",
    name: "Uomo",
    categories: [
      {
        id: "uomo-cera",
        name: "Epilazione con cera brasiliana",
        intro: "Epilazione mirata delle diverse zone, con attenzione alla pelle e alla precisione del risultato.",
        groups: [
          {
            title: "",
            items: [
              {
                id: "uomo-viso-e-collo",
                name: "Viso e collo",
                description: "",
              },
              {
                id: "uomo-braccia-e-busto",
                name: "Braccia e busto",
                description: "",
              },
              {
                id: "uomo-schiena-e-glutei",
                name: "Schiena e glutei",
                description: "",
              },
              {
                id: "uomo-gambe-e-piedi",
                name: "Gambe e piedi",
                description: "",
              },
              {
                id: "uomo-zone-intime",
                name: "Zone intime",
                description: "",
              },
            ],
          },
        ],
        notes: [],
        image: "margaAbito",
      },
      {
        id: "uomo-viso",
        name: "Trattamenti viso",
        intro: "",
        groups: [
          {
            title: "",
            items: [
              {
                id: "uomo-pulizia-del-viso-manuale",
                name: "Pulizia del viso manuale",
                description: "",
              },
              {
                id: "uomo-pulizia-del-viso-trattamento",
                name: "Pulizia del viso + trattamento",
                description: "",
              },
              {
                id: "uomo-miracle-face",
                name: "Miracle Face",
                description: "",
              },
              {
                id: "uomo-tintura-sopracciglia-e-ciglia",
                name: "Tintura sopracciglia e ciglia",
                description: "",
              },
              {
                id: "uomo-laminazione-ciglia-e-sopracciglia",
                name: "Laminazione ciglia e sopracciglia",
                description: "",
              },
            ],
          },
        ],
        notes: [],
        image: "margaCamicia",
      },
      {
        id: "uomo-corpo",
        name: "Trattamenti corpo",
        intro: "",
        groups: [
          {
            title: "",
            items: [
              {
                id: "uomo-massaggio-linfodrenante-total-body",
                name: "Massaggio linfodrenante total body",
                description:
                  "Una tecnica brasiliana esclusiva, sviluppata da Renata França, caratterizzata da manualità specifiche, pressioni decise e un ritmo sostenuto.",
              },
              {
                id: "uomo-massaggio-linfodrenante-gambe",
                name: "Massaggio linfodrenante gambe",
                description: "",
              },
              {
                id: "uomo-esfoliazione-e-scrub-corpo",
                name: "Esfoliazione e scrub corpo",
                description: "",
              },
              {
                id: "uomo-trattamento-purificante-schiena",
                name: "Trattamento purificante schiena",
                description: "",
              },
            ],
          },
        ],
        notes: [],
        image: "margaDivisa",
      },
      {
        id: "uomo-mani-piedi",
        name: "Mani e piedi",
        intro: "",
        groups: [
          {
            title: "",
            items: [
              {
                id: "uomo-manicure-base",
                name: "Manicure base",
                description: "",
              },
              {
                id: "uomo-manicure-con-semipermanente",
                name: "Manicure con semipermanente",
                description: "",
              },
              {
                id: "uomo-manicure-brazilian-spa",
                name: "Manicure Brazilian Spa",
                description: "",
              },
              {
                id: "uomo-trattamento-rinforzante-unghie",
                name: "Trattamento rinforzante unghie",
                description: "",
              },
              {
                id: "uomo-pedicure-base",
                name: "Pedicure base",
                description: "",
              },
              {
                id: "uomo-pedicure-levigante",
                name: "Pedicure Levigante",
                description: "",
              },
              {
                id: "uomo-pedicure-estetico-completo-deluxe",
                name: "Pedicure estetico completo Deluxe",
                description: "",
              },
            ],
          },
        ],
        notes: [],
        image: "marga",
      },
    ],
  },
];
