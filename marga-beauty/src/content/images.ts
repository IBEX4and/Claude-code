/**
 * Fotos do site. Itens sem `src` aparecem como cartaz provisório nas cores da
 * marca (com o nome da área, em `content.visuals.labels`): coloque a foto em
 * /public/images/ e preencha o `src` aqui.
 */

export type VisualSpec = {
  src?: string;
  /** Foto recortada (fundo transparente) sobre o degradê da marca. */
  cutout?: boolean;
  tone: "nude" | "bronze" | "petrol" | "tortora";
};

export const visuals = {
  rosto: { tone: "nude" },
  corpo: { tone: "bronze" },
  drenagem: { tone: "petrol" },
  podologia: { tone: "tortora" },
  marga: { src: "/images/marga-blazer.webp", cutout: true, tone: "bronze" },
  margaDivisa: { src: "/images/marga-divisa.webp", cutout: true, tone: "tortora" },
  margaCamicia: { src: "/images/marga-camicia.webp", cutout: true, tone: "petrol" },
  margaAbito: { src: "/images/marga-abito.webp", cutout: true, tone: "nude" },
} satisfies Record<string, VisualSpec>;

export type VisualKey = keyof typeof visuals;

export const hero = { src: "/images/marga-hero.webp", fallback: "/images/marga-hero.png", width: 700, height: 1254 };

/** Mosaico que aparece atrás do hero quando ele encolhe (duas colunas em loop). */
export const gallery: { columnA: VisualKey[]; columnB: VisualKey[] } = {
  columnA: ["rosto", "margaAbito", "corpo", "margaCamicia"],
  columnB: ["margaDivisa", "drenagem", "marga", "podologia"],
};
