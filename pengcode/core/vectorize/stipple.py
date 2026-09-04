"""Pontilhismo por Voronoi ponderado, opcionalmente ligado num traço só.

Distribui pontos com densidade proporcional ao tom (relaxação de Lloyd) e,
no modo `tsp`, liga todos eles num único percurso curto. É o clássico
"retrato feito de uma linha contínua".
"""

from __future__ import annotations

import numpy as np
from scipy.spatial import cKDTree

from ..optimize import tsp_points
from ..paths import Path
from ..raster import darkness

_MAX_GRID = 200_000


def _sample_by_density(dens: np.ndarray, n: int, rng) -> np.ndarray:
    """Amostragem por rejeição: mais pontos onde a imagem é mais escura."""
    h, w = dens.shape
    out = []
    got = 0
    guard = 0
    while got < n and guard < 200:
        guard += 1
        batch = max(n * 4, 4096)
        xs = rng.uniform(0, w - 1, batch)
        ys = rng.uniform(0, h - 1, batch)
        p = dens[np.rint(ys).astype(int), np.rint(xs).astype(int)]
        keep = rng.random(batch) < p
        if keep.any():
            out.append(np.stack([xs[keep], ys[keep]], axis=1))
            got += int(keep.sum())
    if not out:
        return np.zeros((0, 2))
    return np.vstack(out)[:n]


def vectorize_stipple(
    img: np.ndarray,
    n_points: int = 1800,
    iterations: int = 18,
    mode: str = "tsp",
    dot_size: float = 1.2,
    gamma: float = 1.0,
    time_budget: float = 4.0,
    seed: int = 0,
) -> list[Path]:
    """`mode='tsp'` devolve um traço contínuo; `mode='dots'` devolve pontinhos."""
    arr = np.asarray(img, dtype=float)
    h, w = arr.shape
    dens = darkness(arr)
    if gamma != 1.0:
        dens = np.power(np.clip(dens, 0, 1), max(gamma, 1e-3))
    if dens.max() <= 1e-6:
        return []

    rng = np.random.default_rng(seed)
    pts = _sample_by_density(dens / dens.max(), int(n_points), rng)
    if len(pts) < 3:
        return []

    # grade de amostragem para os centroides (subamostrada em imagens grandes)
    stride = max(1, int(np.sqrt(h * w / _MAX_GRID)) + 1) if h * w > _MAX_GRID else 1
    gy, gx = np.mgrid[0 : h : stride, 0 : w : stride]
    gx = gx.ravel().astype(float)
    gy = gy.ravel().astype(float)
    gw = dens[gy.astype(int), gx.astype(int)].astype(float)
    keep = gw > 1e-4
    gx, gy, gw = gx[keep], gy[keep], gw[keep]
    grid = np.stack([gx, gy], axis=1)

    for _ in range(max(0, int(iterations))):
        assign = cKDTree(pts).query(grid)[1]
        n = len(pts)
        wsum = np.bincount(assign, weights=gw, minlength=n)
        cx = np.bincount(assign, weights=gw * gx, minlength=n)
        cy = np.bincount(assign, weights=gw * gy, minlength=n)
        moved = wsum > 1e-9
        pts[moved, 0] = cx[moved] / wsum[moved]
        pts[moved, 1] = cy[moved] / wsum[moved]

    xy = np.stack([pts[:, 0], (h - 1) - pts[:, 1]], axis=1)  # para Y-para-cima

    if mode == "dots":
        r = max(dot_size, 0.1) / 2.0
        ring = np.stack([np.cos(np.linspace(0, 2 * np.pi, 7)), np.sin(np.linspace(0, 2 * np.pi, 7))], axis=1)
        return [Path(p + ring * r, closed=True) for p in xy]

    return [Path(tsp_points(xy, time_budget=time_budget))]
