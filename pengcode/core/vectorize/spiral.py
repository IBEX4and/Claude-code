"""Espiral modulada: uma única linha contínua que atravessa a imagem inteira.

A espiral de Arquimedes percorre a folha do centro para fora; a amplitude da
ondulação em cada ponto vem do tom da imagem naquele ponto. Como o traço é
contínuo, quase não há levantada de caneta — é o modo mais rápido de plotar
um retrato.
"""

from __future__ import annotations

import numpy as np

from ..paths import Path
from ..raster import darkness


def vectorize_spiral(
    img: np.ndarray,
    pitch: float = 6.0,
    wavelength: float = 6.0,
    amplitude: float = 2.6,
    step: float = 0.9,
    skip_white: float = 0.0,
    coverage: float = 1.0,
) -> list[Path]:
    """Gera a espiral.

    - `pitch`: distância radial entre voltas, em pixels.
    - `wavelength`: comprimento de onda da ondulação ao longo do traço.
    - `amplitude`: desvio radial máximo nas áreas totalmente pretas.
    - `skip_white`: acima de 0, levanta a caneta onde o tom for mais claro
      que esse valor (0..1), deixando o papel limpo em vez de traçar a
      espiral inteira.
    """
    from scipy.ndimage import map_coordinates

    arr = np.asarray(img, dtype=float)
    h, w = arr.shape
    dark = darkness(arr)
    cx, cy = (w - 1) / 2.0, (h - 1) / 2.0
    r_max = float(np.hypot(w, h) / 2.0 * max(0.05, coverage))
    b = max(pitch, 0.2) / (2 * np.pi)

    # passo angular variável: perto do centro é preciso girar muito para andar
    # o mesmo tanto, então dtheta = step / r
    thetas = [0.0]
    theta = 0.0
    while b * theta < r_max:
        theta += step / max(b * theta, step)
        thetas.append(theta)
    theta_arr = np.array(thetas)
    radii = b * theta_arr

    base = np.stack([cx + radii * np.cos(theta_arr), cy + radii * np.sin(theta_arr)], axis=1)
    rows = np.clip(base[:, 1], 0, h - 1)
    cols = np.clip(base[:, 0], 0, w - 1)
    tone = map_coordinates(dark, [rows, cols], order=1, mode="nearest")

    # frequência constante no comprimento de arco, senão a onda "estica" nas
    # voltas externas e o sombreado fica irregular
    seg = np.concatenate(([0.0], np.hypot(*np.diff(base, axis=0).T)))
    arc = np.cumsum(seg)
    wave = np.sin(2 * np.pi * arc / max(wavelength, 0.5))
    offset = tone * amplitude * wave

    x = cx + (radii + offset) * np.cos(theta_arr)
    y_img = cy + (radii + offset) * np.sin(theta_arr)
    inside = (x >= 0) & (x <= w - 1) & (y_img >= 0) & (y_img <= h - 1)
    if skip_white > 0:
        inside &= tone >= skip_white

    pts = np.stack([x, (h - 1) - y_img], axis=1)  # para Y-para-cima
    paths: list[Path] = []
    start = None
    for i, ok in enumerate(inside):
        if ok and start is None:
            start = i
        elif not ok and start is not None:
            if i - start >= 2:
                paths.append(Path(pts[start:i]))
            start = None
    if start is not None and len(pts) - start >= 2:
        paths.append(Path(pts[start:]))
    return paths
