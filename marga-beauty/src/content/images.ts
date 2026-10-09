/**
 * Fotos do site. As que apontam para /images/placeholder/ são provisórias:
 * coloque a foto real em /public/images/ e troque o caminho aqui.
 */
export const images = {
  hero: { src: "/images/marga-hero.webp", fallback: "/images/marga-hero.png", width: 645, height: 859 },
  about: { src: "/images/placeholder/sobre.svg", width: 900, height: 1200 },
  drainage: { src: "/images/placeholder/drenagem.svg", width: 1200, height: 1500 },
  categories: {
    rosto: "/images/placeholder/rosto.svg",
    corpo: "/images/placeholder/corpo.svg",
    drenagem: "/images/placeholder/drenagem.svg",
    podologia: "/images/placeholder/podologia.svg",
  } as Record<string, string>,
};
