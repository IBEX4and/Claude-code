import { test } from "node:test";
import assert from "node:assert/strict";
import { gestureTarget, restingKey, settleTarget, type SnapMap } from "./snapping.ts";

// Tela de 1000px: hero 0–2000 (direcional), tratamentos 3000–5600 com cartões a
// partir de 3360, seções com topo em 6000 e 7000, fim da página em 9000.
const cards = [3360, 4107, 4854, 5600];
const map: SnapMap = {
  zones: [
    { from: 0, to: 2000, points: [0, 2000], mode: "directional" },
    { from: 3000, to: 5600, points: cards, mode: "steps" },
  ],
  points: [0, 2000, 3360, 5600, 6000, 7000, 9000],
  keys: {
    top: 0,
    end: 9000,
    "zone0:0": 0,
    "zone0:1": 2000,
    ...Object.fromEntries(cards.map((c, k) => [`zone1:${k}`, c])),
    "snap0:top": 6000,
    "snap1:top": 7000,
  },
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

test("do fim do hero, o gesto segue para o primeiro cartão (e volta)", () => {
  assert.equal(gestureTarget(map, 2000, 40), 3360);
  assert.equal(gestureTarget(map, 2500, -40), 2000);
  assert.equal(gestureTarget(map, 3360, -40), 2000);
});

test("no topo subindo, ou sem movimento, o gesto rola normalmente", () => {
  assert.equal(gestureTarget(map, 0, -40), null);
  assert.equal(gestureTarget(map, 900, 0), null);
});

test("parado no meio do hero (teclado, barra de rolagem) segue o sentido do movimento", () => {
  assert.equal(settleTarget(map, 700, 1, vh), 2000);
  assert.equal(settleTarget(map, 1700, -1, vh), 0);
});

test("a poucos pixels de uma ponta do hero, volta para ela", () => {
  assert.equal(settleTarget(map, 7, 1, vh), 0);
  assert.equal(settleTarget(map, 1993, -1, vh), 2000);
});

test("nos tratamentos, chegando, encaixa no cartão mais próximo", () => {
  assert.equal(settleTarget(map, 3100, 1, vh), 3360);
  assert.equal(settleTarget(map, 4300, 1, vh, 3360), 4107);
  assert.equal(settleTarget(map, 4600, -1, vh, 5600), 4854);
});

test("nos tratamentos, um empurrão a partir de um cartão vai ao próximo", () => {
  assert.equal(settleTarget(map, 4147, 1, vh, 4107), 4854); // seta para baixo no cartão 2
  assert.equal(settleTarget(map, 4067, -1, vh, 4107), 3360); // seta para cima
});

test("subindo a partir do primeiro cartão, a rolagem fica livre para sair", () => {
  assert.equal(settleTarget(map, 3260, -1, vh, 3360), null);
  assert.equal(settleTarget(map, 3060, -1, vh, 3360), null);
});

test("perto do topo de uma seção encaixa; longe dele fica onde está", () => {
  assert.equal(settleTarget(map, 6250, 1, vh), 6000);
  assert.equal(settleTarget(map, 6780, 1, vh), 7000);
  assert.equal(settleTarget(map, 6500, 1, vh), null);
  assert.equal(settleTarget(map, 6000, 1, vh), null); // já está no ponto
});

test("empurrão pequeno saindo de um ponto não é desfeito", () => {
  assert.equal(settleTarget(map, 2100, 1, vh, 2000), null); // uma volta da roda depois do fim do hero
  assert.equal(settleTarget(map, 2200, 1, vh, 2000), null);
  assert.equal(settleTarget(map, 6040, 1, vh, 6000), null); // seta para baixo no topo de uma seção
  assert.equal(settleTarget(map, 6800, 1, vh, 6000), 7000); // perto do próximo ponto, encaixa nele
  assert.equal(settleTarget(map, 2100, -1, vh, null), 2000); // voltando em direção ao ponto, encaixa
});

test("deslize interrompido: seguindo no mesmo sentido continua; invertendo, volta", () => {
  // Deslizando do cartão 1 (3360) para o 2 (4107), a pessoa aperta uma seta em 3700.
  assert.equal(settleTarget(map, 3740, 1, vh, 4107), 4107);
  assert.equal(settleTarget(map, 3660, -1, vh, 4107), 3360);
  // Rodinha a cada 0,7 s: cada volta avança, nunca puxa para trás.
  assert.equal(settleTarget(map, 4007, 1, vh, 4107), 4107);
  assert.equal(settleTarget(map, 4207, 1, vh, 4107), 4854);
});

test("voltando em direção ao ponto de onde saiu, encaixa nele", () => {
  assert.equal(settleTarget(map, 2050, -1, vh, 2000), 2000);
  assert.equal(settleTarget(map, 6100, -1, vh, 6000), 6000);
});

test("reconhece o ponto em que a rolagem está parada", () => {
  assert.equal(restingKey(map, 2001), "zone0:1");
  assert.equal(restingKey(map, 6000), "snap0:top");
  assert.equal(restingKey(map, 6500), null);
});

test("nos tratamentos, cada gesto leva ao cartão seguinte ou anterior", () => {
  assert.equal(gestureTarget(map, 3360, 40), 4107);
  assert.equal(gestureTarget(map, 4107, 40), 4854);
  assert.equal(gestureTarget(map, 4107, -40), 3360);
  assert.equal(gestureTarget(map, 3700, 10), 4107); // no meio do caminho
  assert.equal(gestureTarget(map, 3100, 40), 3360); // chegando, entra no primeiro cartão
});

test("depois do último cartão a rolagem segue livre", () => {
  assert.equal(gestureTarget(map, 3100, -40), 2000); // subindo antes do primeiro cartão: volta ao hero
  assert.equal(gestureTarget(map, 5600, 40), null); // descendo a partir do último
  assert.equal(gestureTarget(map, 6200, 40), null); // fora da seção
});
