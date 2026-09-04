"""Modos baseados em linha fina: bordas (Canny) e eixo médio (centerline)."""

from __future__ import annotations

import numpy as np

from ..paths import Path
from ..raster import to_xy
from .trace import trace_skeleton


def _to_paths(traced: list[np.ndarray], height: int, min_points: int) -> list[Path]:
    out = []
    for rc in traced:
        if len(rc) < min_points:
            continue
        out.append(Path(to_xy(rc, height)))
    return out


def vectorize_edges(
    img: np.ndarray,
    sigma: float = 1.6,
    low: float = 0.82,
    high: float = 0.92,
    min_points: int = 4,
) -> list[Path]:
    """Detector de bordas Canny -> esqueleto -> traços.

    Os limiares são **quantis** do gradiente, não valores absolutos: `low=0.82`
    quer dizer "descarte os 82% de gradientes mais fracos". Com limiar
    absoluto, a mesma configuração que funciona num desenho de traço forte
    devolve zero traços numa foto de tons suaves — o gradiente ali é pequeno em
    valor absoluto, mas os contornos existem do mesmo jeito.
    """
    from skimage.feature import canny
    from skimage.morphology import skeletonize

    low = float(min(max(low, 0.0), 0.999))
    high = float(min(max(high, low + 0.001), 1.0))
    edges = canny(
        np.asarray(img, dtype=float),
        sigma=sigma,
        low_threshold=low,
        high_threshold=high,
        use_quantiles=True,
    )
    return _to_paths(trace_skeleton(skeletonize(edges)), img.shape[0], min_points)


def vectorize_centerline(
    img: np.ndarray,
    threshold: float | None = None,
    min_points: int = 3,
) -> list[Path]:
    """Binariza e reduz cada região escura ao seu eixo médio.

    Ideal para reproduzir algo que já foi desenhado à mão: assinaturas, tinta,
    caligrafia. `threshold` em None usa Otsu.

    O eixo médio de uma mancha convexa (um quadrado, um disco) degenera para
    pouquíssimos pixels — isso é próprio da esqueletização, não uma falha. O
    modo é feito para traços alongados; o descarte por tamanho físico fica com
    `min_length`, em milímetros, no otimizador.
    """
    from skimage.filters import threshold_otsu
    from skimage.morphology import skeletonize

    arr = np.asarray(img, dtype=float)
    if threshold is None:
        try:
            threshold = float(threshold_otsu(arr))
        except ValueError:  # imagem de tom único
            threshold = 0.5
    dark = arr < threshold
    if not dark.any():
        return []
    return _to_paths(trace_skeleton(skeletonize(dark)), img.shape[0], min_points)
