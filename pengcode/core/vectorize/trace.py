"""Converte uma imagem binária esqueletizada em polilinhas.

O esqueleto é um grafo de pixels: vértices são pontas (grau 1) e bifurcações
(grau >= 3), e cada aresta do grafo vira um traço. É o núcleo dos modos
`edges` e `centerline`.
"""

from __future__ import annotations

import numpy as np

_NEIGHBORS = ((-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1))


def _adjacency(mask: np.ndarray) -> dict[tuple[int, int], list[tuple[int, int]]]:
    on = {(int(r), int(c)) for r, c in np.argwhere(mask)}
    return {p: [q for q in ((p[0] + dr, p[1] + dc) for dr, dc in _NEIGHBORS) if q in on] for p in on}


def _straightest(prev, cur, options):
    """Entre os vizinhos disponíveis, o que menos desvia da direção atual.

    Sem isso, um esqueleto com bifurcação produz traços que "viram a esquina"
    de forma arbitrária e o desenho ganha cantos que não existem na imagem.
    """
    dr, dc = cur[0] - prev[0], cur[1] - prev[1]
    norm = (dr * dr + dc * dc) ** 0.5 or 1.0
    dr, dc = dr / norm, dc / norm
    best, best_score = options[0], -2.0
    for q in options:
        er, ec = q[0] - cur[0], q[1] - cur[1]
        n2 = (er * er + ec * ec) ** 0.5 or 1.0
        score = (er / n2) * dr + (ec / n2) * dc
        if score > best_score:
            best, best_score = q, score
    return best


def trace_skeleton(mask: np.ndarray, min_points: int = 2) -> list[np.ndarray]:
    """Devolve polilinhas em coordenadas (linha, coluna) de imagem."""
    mask = np.asarray(mask, dtype=bool)
    if not mask.any():
        return []

    adj = _adjacency(mask)
    used: set[tuple] = set()
    paths: list[np.ndarray] = []

    def walk(start, first):
        pts = [start, first]
        used.add((start, first))
        used.add((first, start))
        prev, cur = start, first
        while True:
            nbs = adj[cur]
            if len(nbs) != 2:  # ponta ou bifurcação: o traço termina aqui
                break
            free = [q for q in nbs if (cur, q) not in used]
            if not free:
                break
            nxt = _straightest(prev, cur, free)
            used.add((cur, nxt))
            used.add((nxt, cur))
            pts.append(nxt)
            prev, cur = cur, nxt
        return pts

    def emit(pts):
        if len(pts) >= min_points:
            paths.append(np.asarray(pts, dtype=np.float64))

    # 1) a partir de pontas e bifurcações, que definem os extremos naturais
    nodes = [p for p, nbs in adj.items() if len(nbs) != 2]
    for node in sorted(nodes):
        for nb in adj[node]:
            if (node, nb) not in used:
                emit(walk(node, nb))

    # 2) o que sobrou só pode ser um laço fechado sem nenhum vértice
    for node in sorted(adj):
        for nb in adj[node]:
            if (node, nb) not in used:
                emit(walk(node, nb))

    return paths
