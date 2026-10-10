/**
 * Encaixe da rolagem ("snap").
 *
 * As seções marcam no HTML onde a rolagem deve parar:
 * - data-snap-zone="directional": a zona inteira é uma animação de duas pontas
 *   (o hero). Um gesto para baixo vai direto ao fim; para cima, volta ao começo.
 * - data-snap-zone="steps" + data-snap-steps + data-snap-offset: zona fixa com
 *   etapas iguais (os cartões de tratamentos). Ao parar, encaixa na etapa mais próxima.
 * - data-snap: o topo da seção atrai a rolagem quando ela para perto dele;
 *   data-snap="both" também atrai no fim da parte fixa da seção.
 */

export type SnapZone = { from: number; to: number; points: number[]; mode: "directional" | "steps" };
export type SnapMap = { zones: SnapZone[]; points: number[] };

/** Distância (fração da altura da tela) em que um ponto comum atrai a rolagem. */
export const SNAP_THRESHOLD = 0.3;

/** Lê os pontos de encaixe do documento, em pixels de rolagem. */
export function readSnapMap(): SnapMap {
  const vh = window.innerHeight;
  const max = Math.max(0, document.documentElement.scrollHeight - vh);
  const clamp = (v: number) => Math.round(Math.min(Math.max(v, 0), max));
  const topOf = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY;

  const zones: SnapZone[] = [];
  document.querySelectorAll<HTMLElement>("[data-snap-zone]").forEach((el) => {
    const from = clamp(topOf(el));
    const to = clamp(topOf(el) + el.offsetHeight - vh);
    if (to <= from) return;
    if (el.dataset.snapZone === "directional") {
      zones.push({ from, to, points: [from, to], mode: "directional" });
      return;
    }
    const steps = Math.max(1, Number(el.dataset.snapSteps) || 1);
    const start = clamp(topOf(el) + el.offsetHeight * (Number(el.dataset.snapOffset) || 0));
    const points = Array.from({ length: steps + 1 }, (_, k) => clamp(start + ((to - start) * k) / steps));
    zones.push({ from, to, points, mode: "steps" });
  });

  const points = [0, max];
  document.querySelectorAll<HTMLElement>("[data-snap]").forEach((el) => {
    points.push(clamp(topOf(el)));
    if (el.dataset.snap === "both") points.push(clamp(topOf(el) + el.offsetHeight - vh));
  });
  for (const zone of zones) points.push(zone.points[0], zone.points[zone.points.length - 1]);
  return { zones, points: [...new Set(points)].sort((a, b) => a - b) };
}

const nearest = (points: number[], y: number) =>
  points.reduce((best, p) => (Math.abs(p - y) < Math.abs(best - y) ? p : best), points[0]);

/**
 * Para onde a rolagem vai quando para em `y`. Devolve null para ficar onde está.
 * `direction` é o sentido do último movimento (1 = descendo, -1 = subindo).
 */
export function settleTarget(map: SnapMap, y: number, direction: number, viewport: number): number | null {
  const zone = map.zones.find((z) => y > z.from + 1 && y < z.to - 1);
  let target: number | null = null;
  if (zone?.mode === "directional") target = direction < 0 ? zone.from : zone.to;
  else if (zone) target = nearest(zone.points, y);
  else if (map.points.length) {
    const p = nearest(map.points, y);
    if (Math.abs(p - y) <= viewport * SNAP_THRESHOLD) target = p;
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
