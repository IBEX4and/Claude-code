/**
 * Fotos do site. Itens sem `src` aparecem como cartaz provisório no degradê da
 * marca: coloque a foto em /public/images/ e preencha o `src` aqui.
 */

export type VisualSpec = {
  src?: string;
  /** Foto recortada (fundo transparente) sobre o degradê da marca. */
  cutout?: boolean;
  label: string;
  tone: "rose" | "wine" | "nude" | "plum";
};

export const visuals = {
  rosto: { label: "Rosto", tone: "nude" },
  corpo: { label: "Corpo", tone: "rose" },
  drenagem: { label: "Drenagem Linfática", tone: "wine" },
  podologia: { label: "Podologia", tone: "plum" },
  marga: { src: "/images/marga-hero.webp", cutout: true, label: "Marga", tone: "wine" },
} satisfies Record<string, VisualSpec>;

export type VisualKey = keyof typeof visuals;

export const hero = { src: "/images/marga-hero.webp", fallback: "/images/marga-hero.png", width: 645, height: 859 };

/** Mosaico que aparece atrás do hero quando ele encolhe (duas colunas em loop). */
export const gallery: { columnA: VisualKey[]; columnB: VisualKey[] } = {
  columnA: ["rosto", "corpo", "rosto", "corpo"],
  columnB: ["drenagem", "marga", "drenagem", "marga"],
};
