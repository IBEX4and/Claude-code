"""Otimização dos traços.

O maior ganho de tempo de plotagem não está na geração do G-code, está aqui:
simplificar pontos, emendar traços que quase se tocam e reordenar tudo para
encurtar os deslocamentos com a caneta levantada.
"""

from __future__ import annotations

import time

import numpy as np
from scipy.spatial import cKDTree

from .paths import Drawing, Path


def _dist(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    d = np.asarray(a, dtype=float) - np.asarray(b, dtype=float)
    return np.hypot(d[..., 0], d[..., 1])


def simplify_points(points: np.ndarray, tolerance: float) -> np.ndarray:
    """Douglas-Peucker iterativo (sem recursão, para não estourar a pilha)."""
    pts = np.asarray(points, dtype=np.float64)
    n = len(pts)
    if n < 3 or tolerance <= 0:
        return pts

    keep = np.zeros(n, dtype=bool)
    keep[0] = keep[-1] = True
    stack = [(0, n - 1)]
    while stack:
        i, j = stack.pop()
        if j <= i + 1:
            continue
        seg = pts[j] - pts[i]
        rel = pts[i + 1 : j] - pts[i]
        seg_len = float(np.hypot(seg[0], seg[1]))
        if seg_len < 1e-12:
            dev = np.hypot(rel[:, 0], rel[:, 1])
        else:
            dev = np.abs(seg[0] * rel[:, 1] - seg[1] * rel[:, 0]) / seg_len
        k = int(dev.argmax())
        if dev[k] > tolerance:
            split = i + 1 + k
            keep[split] = True
            stack.append((i, split))
            stack.append((split, j))
    return pts[keep]


def simplify(paths: list[Path], tolerance: float) -> list[Path]:
    """Reduz a contagem de pontos sem mudança visível no traço."""
    if tolerance <= 0:
        return paths
    out = []
    for p in paths:
        pts = simplify_points(p.points, tolerance)
        if len(pts) >= 2:
            out.append(p._like(pts))
    return out


def drop_short(paths: list[Path], min_length: float = 0.0, min_points: int = 2) -> list[Path]:
    """Remove cacos: traços curtos demais para valerem uma levantada de caneta."""
    return [p for p in paths if len(p) >= max(2, min_points) and p.length() >= min_length]


def join_paths(paths: list[Path], epsilon: float) -> list[Path]:
    """Emenda traços cujas pontas quase se tocam.

    Cada emenda economiza uma subida e uma descida de caneta, que é onde mais
    se perde tempo em desenhos feitos de muitos segmentos (hachura, bordas).
    """
    if epsilon <= 0 or len(paths) < 2:
        return list(paths)

    openp = [p for p in paths if not p.closed and len(p) >= 2]
    result = [p for p in paths if p.closed or len(p) < 2]
    if not openp:
        return result

    ends = np.array([[p.start, p.end] for p in openp]).reshape(-1, 2)
    tree = cKDTree(ends)
    used = np.zeros(len(openp), dtype=bool)

    for seed in range(len(openp)):
        if used[seed]:
            continue
        used[seed] = True
        chain = [openp[seed].points]
        head, tail = openp[seed].start, openp[seed].end

        extended = True
        while extended:
            extended = False
            for at_tail in (True, False):
                anchor = tail if at_tail else head
                best, best_d = None, epsilon
                for idx in tree.query_ball_point(anchor, epsilon):
                    k, which = divmod(idx, 2)
                    if used[k]:
                        continue
                    d = float(np.hypot(*(ends[idx] - anchor)))
                    if d <= best_d:
                        best, best_d = (k, which), d
                if best is None:
                    continue
                k, which = best
                used[k] = True
                seg = openp[k].points
                if which == 1:  # encostou pela ponta final: inverte
                    seg = seg[::-1]
                if at_tail:
                    chain.append(seg)
                    tail = seg[-1]
                else:
                    chain.insert(0, seg[::-1])
                    head = seg[0]
                extended = True

        merged = np.vstack(chain)
        # tira duplicatas exatas na costura
        keep = np.concatenate(([True], np.abs(np.diff(merged, axis=0)).sum(axis=1) > 1e-9))
        result.append(Path(merged[keep]))

    return result


def _endpoints(paths: list[Path]) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Pontas de cada traço. Um traço fechado volta ao próprio início."""
    starts = np.array([p.start for p in paths], dtype=float)
    ends = np.array([p.points[0] if p.closed else p.end for p in paths], dtype=float)
    flippable = np.array([not p.closed for p in paths], dtype=bool)
    return starts, ends, flippable


def order_paths(
    paths: list[Path],
    start=(0.0, 0.0),
    refine: bool = True,
    time_budget: float = 3.0,
) -> list[Path]:
    """Ordena os traços para minimizar o percurso com a caneta levantada.

    Vizinho-mais-próximo (podendo desenhar cada traço em qualquer sentido)
    seguido de refino 2-opt limitado por tempo. Em desenhos com milhares de
    segmentos isso costuma cortar o tempo total pela metade ou mais.
    """
    n = len(paths)
    if n < 2:
        return list(paths)

    S, E, flippable = _endpoints(paths)
    origin = np.asarray(start, dtype=float)

    # --- construção: vizinho mais próximo sobre as duas pontas de cada traço
    tree = cKDTree(np.concatenate([S, E], axis=0))
    used = np.zeros(n, dtype=bool)
    order: list[int] = []
    flipped: list[bool] = []
    cur = origin
    remaining = n
    while remaining:
        k = min(2 * n, 8)
        pick = None
        while pick is None:
            _, idx = tree.query(cur, k=k)
            for i in np.atleast_1d(idx):
                i = int(i)
                if i >= 2 * n:
                    continue
                p, which = i % n, i // n
                if not used[p]:
                    pick = (p, bool(which) and bool(flippable[p]))
                    break
            if pick is None:
                if k >= 2 * n:
                    pick = (int(np.flatnonzero(~used)[0]), False)
                    break
                k = min(2 * n, k * 4)
        p, flip = pick
        used[p] = True
        order.append(p)
        flipped.append(flip)
        cur = S[p] if flip else E[p]
        remaining -= 1

    if refine and n >= 4:
        order, flipped = _two_opt(order, flipped, S, E, flippable, origin, time_budget)

    return [paths[i].reversed() if f else paths[i] for i, f in zip(order, flipped)]


def _two_opt(order, flipped, S, E, flippable, origin, time_budget):
    """2-opt sobre a sequência de traços; inverter um trecho inverte os traços."""
    order = list(order)
    flipped = list(flipped)
    n = len(order)
    deadline = time.monotonic() + max(0.0, time_budget)

    def orient():
        idx = np.array(order)
        fl = np.array(flipped, dtype=bool)
        s = np.where(fl[:, None], E[idx], S[idx])
        e = np.where(fl[:, None], S[idx], E[idx])
        # soma acumulada para testar em O(1) se um trecho inteiro é invertível
        ok = np.concatenate(([0], np.cumsum(flippable[idx].astype(np.int64))))
        return s, e, ok

    improved = True
    while improved and time.monotonic() < deadline:
        improved = False
        s, e, flip_ok = orient()
        prev = np.vstack([origin[None, :], e[:-1]])       # ponto anterior a cada traço
        cur_cost = _dist(prev, s)                          # custo de cada aresta de viagem
        for i in range(n - 1):
            if time.monotonic() > deadline:
                break
            js = np.arange(i, n)
            # trecho [i..j] invertido: a entrada passa a ser pela ponta final de j
            gain_in = _dist(prev[i], e[js]) - cur_cost[i]
            gain_out = np.zeros(len(js))
            has_next = js < n - 1
            if has_next.any():
                jn = js[has_next]
                gain_out[has_next] = _dist(s[i], s[jn + 1]) - cur_cost[jn + 1]
            # um trecho que contenha traço fechado não pode ser invertido
            delta = gain_in + gain_out
            block_ok = (flip_ok[js + 1] - flip_ok[i]) == (js - i + 1)
            delta[~block_ok] = 0.0
            k = int(delta.argmin())
            if delta[k] < -1e-9:
                j = int(js[k])
                order[i : j + 1] = order[i : j + 1][::-1]
                seg = [not f for f in flipped[i : j + 1]][::-1]
                flipped[i : j + 1] = seg
                improved = True
                s, e, flip_ok = orient()
                prev = np.vstack([origin[None, :], e[:-1]])
                cur_cost = _dist(prev, s)
    return order, flipped


def tsp_points(points: np.ndarray, time_budget: float = 3.0) -> np.ndarray:
    """Ordena uma nuvem de pontos num percurso curto (usado pelo modo stipple)."""
    pts = np.asarray(points, dtype=float)
    n = len(pts)
    if n < 3:
        return pts

    tree = cKDTree(pts)
    used = np.zeros(n, dtype=bool)
    order = [0]
    used[0] = True
    for _ in range(n - 1):
        cur = pts[order[-1]]
        k = 8
        nxt = None
        while nxt is None:
            _, idx = tree.query(cur, k=min(k, n))
            for i in np.atleast_1d(idx):
                if not used[int(i)]:
                    nxt = int(i)
                    break
            if nxt is None:
                if k >= n:
                    nxt = int(np.flatnonzero(~used)[0])
                    break
                k = min(n, k * 4)
        used[nxt] = True
        order.append(nxt)

    idx = np.array(order)
    deadline = time.monotonic() + max(0.0, time_budget)
    improved = True
    while improved and time.monotonic() < deadline:
        improved = False
        tour = pts[idx]
        for i in range(1, len(idx) - 1):
            if time.monotonic() > deadline:
                break
            a, b = tour[i - 1], tour[i]
            c = tour[i:-1]
            d = tour[i + 1 :]
            delta = _dist(a, c) + _dist(b, d) - _dist(a, b) - _dist(c, d)
            k = int(delta.argmin())
            if delta[k] < -1e-9:
                j = i + k
                idx[i : j + 1] = idx[i : j + 1][::-1]
                tour = pts[idx]
                improved = True
    return pts[idx]


def optimize_drawing(
    drawing: Drawing,
    tolerance: float = 0.08,
    join_epsilon: float = 0.25,
    min_length: float = 0.4,
    reorder: bool = True,
    start=(0.0, 0.0),
    time_budget: float = 3.0,
) -> Drawing:
    """Pipeline completo de otimização, na ordem que dá melhor resultado."""
    paths = [p for p in drawing.paths if len(p) >= 2]
    paths = simplify(paths, tolerance)
    paths = join_paths(paths, join_epsilon)
    paths = simplify(paths, tolerance)
    paths = drop_short(paths, min_length)
    if reorder:
        paths = order_paths(paths, start=start, time_budget=time_budget)
    return Drawing(paths, drawing.size, dict(drawing.meta))
