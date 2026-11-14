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
        intro:
          "Epilazione mirata delle diverse zone del viso e del corpo, con attenzione alla pelle e alla rifinitura.",
        groups: [
          {
            title: "",
            items: [
              {
                id: "donna-viso-e-nuca",
                name: "Viso e nuca",
                description:
                  "Sopracciglia, labbro superiore, mento, sotto mento, basette, naso e nuca. Per il naso si trattano solo i peli visibili al bordo esterno delle narici.",
              },
              {
                id: "donna-braccia-e-ascelle",
                name: "Braccia e ascelle",
                description: "Braccia, avambraccia, braccia complete, mani e ascelle.",
              },
              {
                id: "donna-gambe-e-piedi",
                name: "Gambe e piedi",
                description: "Mezza gamba superiore, mezza gamba inferiore, gambe complete e piedi.",
              },
              {
                id: "donna-zone-intime-e-glutei",
                name: "Zone intime e glutei",
                description: "Inguine parziale, inguine totale, inguine totale + perianale, zona perianale e glutei.",
              },
            ],
          },
        ],
        notes: ["Mani e piedi, comprese le dita, sono servizi separati dall'epilazione di braccia e gambe."],
        image: "margaAbito",
      },
      {
        id: "donna-viso",
        name: "Trattamenti viso",
        intro: "La detersione iniziale del viso è inclusa in ogni pulizia e trattamento viso.",
        groups: [
          {
            title: "",
            items: [
              {
                id: "donna-pulizia-del-viso-manuale",
                name: "Pulizia del viso manuale",
                description:
                  "Pulizia manuale per rimuovere le impurità superficiali, con attenzione alle esigenze della pelle.",
              },
              {
                id: "donna-pulizia-del-viso-trattamento",
                name: "Pulizia del viso + trattamento",
                description:
                  "Pulizia del viso abbinata a un trattamento cosmetico scelto in base alle esigenze della pelle.",
              },
              {
                id: "donna-miracle-face",
                name: "Miracle Face",
                description: "Massaggio viso del metodo Renata França, con manovre drenanti e di modellamento manuale.",
              },
            ],
          },
          {
            title: "Sguardo e make up",
            items: [
              {
                id: "donna-tintura-sopracciglia-e-ciglia",
                name: "Tintura sopracciglia e ciglia",
                description: "Colorazione per valorizzare le sopracciglia o dare risalto alle ciglia naturali.",
              },
              {
                id: "donna-laminazione-ciglia-e-sopracciglia",
                name: "Laminazione ciglia e sopracciglia",
                description:
                  "Trattamenti per valorizzare la curvatura delle ciglia o orientare e ordinare i peli delle sopracciglia.",
              },
              {
                id: "donna-extension-ciglia",
                name: "Extension ciglia",
                description:
                  "Applicazione per personalizzare lunghezza e intensità dello sguardo. Disponibile anche la rimozione professionale.",
              },
              {
                id: "donna-trucco-sposa",
                name: "Trucco sposa",
                description: "Make-up personalizzato in base ai lineamenti e allo stile della cerimonia.",
              },
              {
                id: "donna-trucco-giorno-e-sera",
                name: "Trucco giorno e sera",
                description: "Make-up studiato in base all'occasione e all'effetto desiderato.",
              },
              {
                id: "donna-applicazione-ciglia-finte-monouso",
                name: "Applicazione ciglia finte monouso",
                description: "Un dettaglio per completare il make-up e dare intensità allo sguardo.",
              },
              {
                id: "donna-rimozione-make-up",
                name: "Rimozione make-up",
                description: "Detersione di viso, occhi e labbra dai residui di trucco.",
              },
            ],
          },
        ],
        notes: [
          "Per i servizi che lo prevedono, la prova di sensibilità al prodotto viene programmata secondo le istruzioni del produttore. Segnalaci eventuali reazioni precedenti prima dell'appuntamento.",
        ],
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
                  "Manualità drenanti per una sensazione di leggerezza. Disponibile total body, gambe o addome.",
              },
              {
                id: "donna-massaggio-linfodrenante-dolce-attesa",
                name: "Massaggio linfodrenante Dolce Attesa",
                description:
                  "Trattamento total body dedicato alla gravidanza, con posizioni e manualità adattate. Prima di prenotare, confrontati con chi segue la tua gravidanza.",
              },
              {
                id: "donna-scrub-carezza-di-seta",
                name: "Scrub Carezza di Seta",
                description:
                  "Esfoliazione cosmetica total body per rimuovere le cellule morte superficiali e lasciare la pelle più liscia e morbida.",
              },
              {
                id: "donna-trattamento-purificante-schiena",
                name: "Trattamento purificante schiena",
                description:
                  "Trattamento estetico dedicato alla detersione della schiena e alle impurità superficiali, adattato alle esigenze della pelle.",
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
                description: "Cura di unghie e cuticole, con finitura naturale o smalto classico.",
              },
              {
                id: "donna-manicure-brazilian-spa",
                name: "Manicure Brazilian Spa",
                description:
                  "Rituale dedicato alla pelle delle mani e alle unghie, senza smalto, con smalto classico o con semipermanente.",
              },
              {
                id: "donna-manicure-con-semipermanente",
                name: "Manicure con semipermanente",
                description:
                  "Preparazione delle unghie e applicazione del colore. Disponibile anche con semipermanente rinforzato.",
              },
              {
                id: "donna-trattamento-rinforzante-unghie",
                name: "Trattamento rinforzante unghie",
                description: "Cura cosmetica per unghie naturali fragili o che tendono a sfaldarsi.",
              },
              {
                id: "donna-gel-e-ricostruzione",
                name: "Gel e ricostruzione",
                description:
                  "Copertura delle unghie naturali, ricostruzione in gel, refill e ricostruzione di una singola unghia della mano.",
              },
              {
                id: "donna-rimozioni",
                name: "Rimozioni",
                description: "Rimozione professionale del semipermanente o del gel dalle unghie delle mani.",
              },
              {
                id: "donna-pedicure-base",
                name: "Pedicure base",
                description:
                  "Cura di unghie e cuticole dei piedi, senza smalto, con smalto classico o con semipermanente.",
              },
              {
                id: "donna-pedicure-piedi-di-velluto",
                name: "Pedicure Piedi di Velluto",
                description:
                  "Pedicure con delicata levigatura della pelle secca superficiale, senza smalto, con smalto classico o con semipermanente.",
              },
              {
                id: "donna-pedicure-estetico-completo-deluxe",
                name: "Pedicure estetico completo Deluxe",
                description:
                  "Cura estetica di unghie, contorno e pelle dei piedi con una rifinitura più accurata. Senza smalto, con smalto classico o con semipermanente.",
              },
              {
                id: "donna-ricostruzione-singola-unghia-del-piede",
                name: "Ricostruzione singola unghia del piede",
                description: "Ricostruzione estetica mirata, da valutare in base alle condizioni dell'unghia.",
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
        intro:
          "Epilazione mirata delle diverse zone del viso e del corpo. I confini della zona scelta vengono concordati prima del trattamento.",
        groups: [
          {
            title: "",
            items: [
              {
                id: "uomo-viso-e-collo",
                name: "Viso e collo",
                description:
                  "Sopracciglia, naso, orecchie, collo e nuca. Per naso e orecchie si tratta solo la peluria visibile esterna.",
              },
              {
                id: "uomo-braccia-e-busto",
                name: "Braccia e busto",
                description:
                  "Avambraccia, braccia, braccia complete, mani, ascelle, spalle, petto, addome e petto + addome.",
              },
              {
                id: "uomo-schiena-e-glutei",
                name: "Schiena e glutei",
                description: "Schiena superiore, zona lombare o fondo schiena, schiena completa e glutei.",
              },
              {
                id: "uomo-gambe-e-piedi",
                name: "Gambe e piedi",
                description: "Mezza gamba superiore, mezza gamba inferiore, gambe complete e piedi.",
              },
              {
                id: "uomo-zone-intime",
                name: "Zone intime",
                description: "Inguine parziale, inguine totale, zona perianale e inguine totale + perianale.",
              },
            ],
          },
        ],
        notes: ["Mani e piedi, comprese le dita, sono servizi separati dall'epilazione di braccia e gambe."],
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
                description:
                  "Pulizia manuale per rimuovere le impurità superficiali, con attenzione alle esigenze della pelle.",
              },
              {
                id: "uomo-pulizia-del-viso-trattamento",
                name: "Pulizia del viso + trattamento",
                description:
                  "Pulizia del viso abbinata a un trattamento cosmetico scelto in base alle esigenze della pelle.",
              },
              {
                id: "uomo-miracle-face",
                name: "Miracle Face",
                description: "Massaggio viso del metodo Renata França, con manovre drenanti e di modellamento manuale.",
              },
            ],
          },
          {
            title: "Sguardo",
            items: [
              {
                id: "uomo-tintura-sopracciglia",
                name: "Tintura sopracciglia",
                description: "Colorazione per valorizzare la forma naturale delle sopracciglia.",
              },
              {
                id: "uomo-tintura-ciglia",
                name: "Tintura ciglia",
                description: "Colorazione per dare risalto alle ciglia naturali, soprattutto quando sono chiare.",
              },
              {
                id: "uomo-laminazione-ciglia",
                name: "Laminazione ciglia",
                description: "Trattamento per valorizzare la curvatura delle ciglia naturali.",
              },
              {
                id: "uomo-laminazione-sopracciglia",
                name: "Laminazione sopracciglia",
                description: "Trattamento per orientare i peli e valorizzare la forma naturale delle sopracciglia.",
              },
            ],
          },
        ],
        notes: [
          "Per i servizi che lo prevedono, la prova di sensibilità al prodotto viene programmata secondo le istruzioni del produttore. Segnalaci eventuali reazioni precedenti prima dell'appuntamento.",
        ],
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
                description: "Manualità drenanti su più zone del corpo, per una sensazione generale di leggerezza.",
              },
              {
                id: "uomo-massaggio-linfodrenante-gambe",
                name: "Massaggio linfodrenante gambe",
                description:
                  "Manualità drenanti dedicate alle gambe, per una sensazione di leggerezza nella zona trattata.",
              },
              {
                id: "uomo-esfoliazione-e-scrub-corpo",
                name: "Esfoliazione e scrub corpo",
                description:
                  "Esfoliazione cosmetica total body per rimuovere le cellule morte superficiali e lasciare la pelle più liscia e morbida.",
              },
              {
                id: "uomo-trattamento-purificante-schiena",
                name: "Trattamento purificante schiena",
                description:
                  "Trattamento estetico dedicato alla detersione della schiena e alle impurità superficiali, adattato alle esigenze della pelle.",
              },
            ],
          },
        ],
        notes: [
          "Prima del massaggio, consigliamo di accorciare i peli lunghi nelle zone da trattare per facilitare le manualità. Se preferisci la ceretta brasiliana, chiedici come programmare le due sedute.",
        ],
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
                description: "Cura di unghie e cuticole, con finitura naturale o smalto classico.",
              },
              {
                id: "uomo-manicure-con-semipermanente",
                name: "Manicure con semipermanente",
                description: "Preparazione delle unghie e applicazione dello smalto semipermanente.",
              },
              {
                id: "uomo-manicure-brazilian-spa",
                name: "Manicure Brazilian Spa",
                description:
                  "Rituale dedicato alla pelle delle mani e alle unghie, senza smalto, con smalto classico o con semipermanente.",
              },
              {
                id: "uomo-trattamento-rinforzante-unghie",
                name: "Trattamento rinforzante unghie",
                description: "Cura cosmetica per unghie naturali fragili o che tendono a sfaldarsi.",
              },
              {
                id: "uomo-rimozione-semipermanente-mani",
                name: "Rimozione semipermanente mani",
                description: "Rimozione professionale dello smalto semipermanente dalle unghie delle mani.",
              },
              {
                id: "uomo-pedicure-base",
                name: "Pedicure base",
                description:
                  "Cura di unghie e cuticole dei piedi, senza smalto, con smalto classico o con semipermanente.",
              },
              {
                id: "uomo-pedicure-levigante",
                name: "Pedicure Levigante",
                description:
                  "Pedicure con delicata levigatura della pelle secca superficiale, senza smalto, con smalto classico o con semipermanente.",
              },
              {
                id: "uomo-pedicure-estetico-completo-deluxe",
                name: "Pedicure estetico completo Deluxe",
                description:
                  "Cura estetica di unghie, contorno e pelle dei piedi con una rifinitura più accurata. Senza smalto, con smalto classico o con semipermanente.",
              },
              {
                id: "uomo-ricostruzione-singola-unghia-del-piede",
                name: "Ricostruzione singola unghia del piede",
                description: "Ricostruzione estetica mirata, da valutare in base alle condizioni dell'unghia.",
              },
              {
                id: "uomo-rimozione-semipermanente-piedi",
                name: "Rimozione semipermanente piedi",
                description: "Rimozione professionale dello smalto semipermanente dalle unghie dei piedi.",
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
