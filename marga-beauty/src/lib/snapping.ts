/**
 * Encaixe da rolagem ("snap").
 *
 * As seções marcam no HTML onde a rolagem deve parar:
 * - data-snap-zone="directional": a zona inteira é uma animação de duas pontas
 *   (o hero). Um gesto para baixo vai direto ao fim; para cima, volta ao começo.
 * - data-snap-zone="steps" + data-snap-steps + data-snap-offset: zona fixa com
 *   etapas iguais (os cartões de tratamentos).
 * - data-snap: o topo da seção atrai a rolagem quando ela para perto dele;
 *   data-snap="both" também atrai no fim da parte fixa da seção.
 *
 * O encaixe respeita o sentido do movimento: um empurrão pequeno a partir de um
 * ponto leva ao próximo ponto naquele sentido (ou deixa a rolagem livre), nunca de
 * volta ao ponto de onde a pessoa saiu.
 */

export type SnapZone = { from: number; to: number; points: number[]; mode: "directional" | "steps" };
export type SnapMap = {
  zones: SnapZone[];
  /** Pontos que atraem a rolagem por proximidade (inclui as pontas das zonas). */
  points: number[];
  /** Cada ponto com um nome estável, para reencontrá-lo depois de redimensionar. */
  keys: Record<string, number>;
};

/** Distância (fração da altura da tela) em que um ponto comum atrai a rolagem. */
export const SNAP_THRESHOLD = 0.3;
/** Perto assim (px) de uma ponta do hero, a rolagem volta para ela. */
const EDGE_DEAD_BAND = 12;

/** Lê os pontos de encaixe do documento, em pixels de rolagem. */
export function readSnapMap(): SnapMap {
  const vh = window.innerHeight;
  const max = Math.max(0, document.documentElement.scrollHeight - vh);
  const clamp = (v: number) => Math.min(Math.max(v, 0), max);
  const topOf = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY;
  const keys: Record<string, number> = { top: 0, end: Math.round(max) };

  const zones: SnapZone[] = [];
  document.querySelectorAll<HTMLElement>("[data-snap-zone]").forEach((el, z) => {
    const from = Math.round(clamp(topOf(el)));
    const to = Math.round(clamp(topOf(el) + el.offsetHeight - vh));
    if (to <= from) return;
    let points: number[];
    if (el.dataset.snapZone === "directional") points = [from, to];
    else {
      const steps = Math.max(1, Number(el.dataset.snapSteps) || 1);
      const start = clamp(topOf(el) + el.offsetHeight * (Number(el.dataset.snapOffset) || 0));
      // Arredonda para cima: cada ponto fica no limite da etapa ou logo depois dele.
      points = Array.from({ length: steps + 1 }, (_, k) => Math.min(Math.ceil(start + ((to - start) * k) / steps), to));
    }
    points.forEach((p, k) => (keys[`zone${z}:${k}`] = p));
    zones.push({ from, to, points, mode: el.dataset.snapZone === "directional" ? "directional" : "steps" });
  });

  document.querySelectorAll<HTMLElement>("[data-snap]").forEach((el, i) => {
    keys[`snap${i}:top`] = Math.round(clamp(topOf(el)));
    if (el.dataset.snap === "both") keys[`snap${i}:end`] = Math.round(clamp(topOf(el) + el.offsetHeight - vh));
  });

  const points = [0, Math.round(max), ...Object.entries(keys).filter(([k]) => k.startsWith("snap")).map(([, v]) => v)];
  for (const zone of zones) points.push(zone.points[0], zone.points[zone.points.length - 1]);
  return { zones, points: [...new Set(points)].sort((a, b) => a - b), keys };
}

const nearest = (points: number[], y: number) =>
  points.reduce((best, p) => (Math.abs(p - y) < Math.abs(best - y) ? p : best), points[0]);

/** Próximo ponto depois de `from` no sentido `direction`, ou null. */
const nextFrom = (points: number[], from: number, direction: number) =>
  direction > 0 ? (points.find((p) => p > from + 1) ?? null) : ([...points].reverse().find((p) => p < from - 1) ?? null);

/** Nome do ponto em que a rolagem está parada (até 2 px), ou null. */
export function restingKey(map: SnapMap, y: number): string | null {
  for (const [key, value] of Object.entries(map.keys)) if (Math.abs(value - y) <= 2) return key;
  return null;
}

/**
 * Para onde a rolagem vai quando para em `y`; null = fica onde está.
 * `direction`: sentido do último movimento (1 = descendo, -1 = subindo).
 * `lastRest`: ponto em que a rolagem estava parada antes deste movimento.
 */
export function settleTarget(
  map: SnapMap,
  y: number,
  direction: number,
  viewport: number,
  lastRest: number | null = null,
): number | null {
  const leaving = (p: number) => lastRest !== null && Math.abs(p - lastRest) <= 2 && Math.sign(y - p) === Math.sign(direction);
  const zone = map.zones.find((z) => y > z.from + 1 && y < z.to - 1);
  let target: number | null = null;

  if (zone?.mode === "directional") {
    if (y - zone.from < EDGE_DEAD_BAND) target = zone.from;
    else if (zone.to - y < EDGE_DEAD_BAND) target = zone.to;
    else target = direction < 0 ? zone.from : zone.to;
  } else if (zone) {
    const p = nearest(zone.points, y);
    // Saindo de um cartão: vai ao próximo; antes do primeiro (ou depois do último), fica livre.
    target = leaving(p) ? nextFrom(zone.points, p, direction) : p;
  } else if (map.points.length) {
    const reach = viewport * SNAP_THRESHOLD;
    const p = nearest(map.points, y);
    if (Math.abs(p - y) <= reach) {
      if (!leaving(p)) target = p;
      else {
        const next = nextFrom(map.points, p, direction);
        target = next !== null && Math.abs(next - y) <= reach ? next : null;
      }
    }
  }
  return target !== null && Math.abs(target - y) > 2 ? target : null;
}

/**
 * Para onde leva um gesto (roda do mouse, toque) feito em `y` dentro de uma zona
 * direcional. Devolve null quando o gesto deve rolar normalmente.
 */
export function gestureTarget(map: SnapMap, y: number, delta: number): number | null {
  if (!delta) return null;
  const zone = map.zones.find((z) => z.mode === "directional" && y >= z.from - 1 && y <= z.to + 1);
  if (!zone) return null;
  if (delta > 0) return y < zone.to - 1 ? zone.to : null;
  return y > zone.from + 1 ? zone.from : null;
}
