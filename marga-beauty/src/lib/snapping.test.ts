import { test } from "node:test";
import assert from "node:assert/strict";
import { gestureTarget, settleTarget, type SnapMap } from "./snapping.ts";

// Tela de 1000px: hero 0–2000 (direcional), tratamentos 3000–5600 em 3 etapas a
// partir de 3360, seções com topo em 6000 e 7000, fim da página em 9000.
const map: SnapMap = {
  zones: [
    { from: 0, to: 2000, points: [0, 2000], mode: "directional" },
    { from: 3000, to: 5600, points: [3360, 4106.67, 4853.33, 5600].map(Math.round), mode: "steps" },
  ],
  points: [0, 2000, 3360, 5600, 6000, 7000, 9000],
};
const vh = 1000;

test("gesto para baixo no topo do hero vai direto ao fim da animação", () => {
  assert.equal(gestureTarget(map, 0, 40), 2000);
  assert.equal(gestureTarget(map, 900, 5), 2000);
});

test("gesto para cima no fim do hero volta ao topo", () => {
  assert.equal(gestureTarget(map, 2000, -40), 0);
  assert.equal(gestureTarget(map, 1200, -3), 0);
});

test("fora do hero, ou saindo dele, o gesto rola normalmente", () => {
  assert.equal(gestureTarget(map, 2000, 40), null); // no fim do hero, descendo
  assert.equal(gestureTarget(map, 0, -40), null); // no topo, subindo
  assert.equal(gestureTarget(map, 2500, -40), null); // depois do hero
  assert.equal(gestureTarget(map, 900, 0), null); // sem movimento
});

test("parado no meio do hero (teclado, barra de rolagem) segue o sentido do movimento", () => {
  assert.equal(settleTarget(map, 700, 1, vh), 2000);
  assert.equal(settleTarget(map, 1700, -1, vh), 0);
});

test("nos tratamentos encaixa na etapa mais próxima", () => {
  assert.equal(settleTarget(map, 3100, 1, vh), 3360);
  assert.equal(settleTarget(map, 4300, 1, vh), 4107);
  assert.equal(settleTarget(map, 4600, -1, vh), 4853);
});

test("perto do topo de uma seção encaixa; longe dele fica onde está", () => {
  assert.equal(settleTarget(map, 6250, 1, vh), 6000);
  assert.equal(settleTarget(map, 6780, 1, vh), 7000);
  assert.equal(settleTarget(map, 6500, 1, vh), null);
  assert.equal(settleTarget(map, 6000, 1, vh), null); // já está no ponto
});
