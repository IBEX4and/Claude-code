"""Curvas de nível de luminância — o visual "mapa topográfico"."""

from __future__ import annotations

import numpy as np

from ..paths import Path
from ..raster import to_xy


def vectorize_contours(
    img: np.ndarray,
    levels: int = 6,
    low: float = 0.15,
    high: float = 0.9,
    min_points: int = 6,
) -> list[Path]:
    """Traça `levels` isolinhas igualmente espaçadas entre `low` e `high`.

    Poucos níveis dão um pôster gráfico; muitos níveis (15+) dão um retrato
    com aparência de curva de nível.
    """
    from skimage.measure import find_contours

    arr = np.asarray(img, dtype=float)
    levels = max(1, int(levels))
    if levels == 1:
        values = [(low + high) / 2.0]
    else:
        values = np.linspace(low, high, levels).tolist()

    paths: list[Path] = []
    for value in values:
        for rc in find_contours(arr, value):
            if len(rc) < min_points:
                continue
            closed = bool(np.allclose(rc[0], rc[-1]))
            pts = to_xy(rc[:-1] if closed else rc, arr.shape[0])
            if len(pts) >= min_points:
                paths.append(Path(pts, closed=closed))
    return paths
