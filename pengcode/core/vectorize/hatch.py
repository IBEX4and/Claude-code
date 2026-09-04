"""Hachura: linhas paralelas cuja densidade acompanha o tom da imagem.

O algoritmo varre a imagem com famílias de retas em ângulos diferentes, uma
família por faixa de tom. Áreas claras recebem só a primeira família; áreas
escuras recebem todas, e o cruzamento delas vira o sombreado cruzado.
"""

from __future__ import annotations

import numpy as np

from ..paths import Path
from ..raster import darkness


def _runs(flags: np.ndarray) -> list[tuple[int, int]]:
    """Índices [inicio, fim) de cada sequência contígua de True."""
    if not flags.any():
        return []
    padded = np.concatenate(([False], flags, [False]))
    edges = np.flatnonzero(padded[1:] != padded[:-1])
    return list(zip(edges[0::2].tolist(), edges[1::2].tolist()))


def vectorize_hatch(
    img: np.ndarray,
    spacing: float = 2.5,
    levels: int = 3,
    angle: float = 45.0,
    angle_step: float | None = None,
    step: float = 1.0,
    min_length: float = 1.5,
) -> list[Path]:
    """Gera a hachura.

    - `spacing`: distância entre retas vizinhas, em pixels da imagem.
    - `levels`: número de famílias/faixas de tom (3 costuma bastar).
    - `angle_step`: giro entre famílias; None distribui 180°/levels.
    """
    from scipy.ndimage import map_coordinates

    arr = np.asarray(img, dtype=float)
    h, w = arr.shape
    dark = darkness(arr)
    levels = max(1, int(levels))
    spacing = max(0.2, float(spacing))
    step = max(0.25, float(step))
    if angle_step is None:
        angle_step = 180.0 / levels

    # cantos da imagem em espaço XY (Y para cima)
    corners = np.array([[0.0, 0.0], [w - 1.0, 0.0], [0.0, h - 1.0], [w - 1.0, h - 1.0]])

    paths: list[Path] = []
    for i in range(levels):
        # cada família só desenha onde o tom é pelo menos tão escuro quanto sua faixa
        threshold = (i + 1) / (levels + 1)
        theta = np.deg2rad(angle + i * angle_step)
        u = np.array([np.cos(theta), np.sin(theta)])
        n = np.array([-np.sin(theta), np.cos(theta)])

        tu, tn = corners @ u, corners @ n
        u0, u1 = tu.min(), tu.max()
        n0, n1 = tn.min(), tn.max()

        ts = np.arange(u0, u1 + step, step)
        if len(ts) < 2:
            continue
        # meia-célula de deslocamento por família, para as retas não coincidirem
        offset = (i * spacing / max(levels, 1)) % spacing
        for v in np.arange(n0 + offset, n1, spacing):
            xy = ts[:, None] * u[None, :] + v * n[None, :]
            rows = (h - 1) - xy[:, 1]
            cols = xy[:, 0]
            inside = (cols >= 0) & (cols <= w - 1) & (rows >= 0) & (rows <= h - 1)
            if not inside.any():
                continue
            values = np.zeros(len(ts))
            values[inside] = map_coordinates(
                dark, [rows[inside], cols[inside]], order=1, mode="nearest"
            )
            hit = inside & (values >= threshold)
            for a, b in _runs(hit):
                if (b - a) < 2:
                    continue
                seg = np.array([xy[a], xy[b - 1]])
                if np.hypot(*(seg[1] - seg[0])) >= min_length:
                    paths.append(Path(seg))
    return paths
