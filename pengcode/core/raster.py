"""Carregamento e pré-processamento de imagens.

A saída é sempre um array float32 em [0, 1] onde **0 é preto e 1 é branco**,
com a linha 0 no topo (convenção de imagem). A inversão para Y-para-cima
acontece nos vetorizadores, no momento de virar geometria.
"""

from __future__ import annotations

import io
from dataclasses import dataclass
from pathlib import Path as FsPath

import numpy as np
from PIL import Image, ImageOps

MAX_DIM_DEFAULT = 900


@dataclass
class PreprocessParams:
    """Controles de imagem. É aqui que se decide 80% da qualidade do traço."""

    max_dim: int = MAX_DIM_DEFAULT
    invert: bool = False
    brightness: float = 0.0   # -1..1, somado
    contrast: float = 1.0     # multiplicador em torno do cinza médio
    gamma: float = 1.0        # <1 clareia, >1 escurece
    blur: float = 1.0         # sigma gaussiano em pixels
    autolevel: bool = True    # estica o histograma para usar toda a faixa


def load_gray(source) -> np.ndarray:
    """Aceita caminho, bytes ou PIL.Image e devolve cinza float em [0, 1].

    Imagens com transparência são compostas sobre branco — sem isso, um PNG de
    line art com fundo alfa vira uma mancha preta.
    """
    if isinstance(source, Image.Image):
        img = source
    elif isinstance(source, (bytes, bytearray)):
        img = Image.open(io.BytesIO(bytes(source)))
    elif isinstance(source, (str, FsPath)):
        img = Image.open(source)
    else:
        raise TypeError(f"fonte de imagem não suportada: {type(source)!r}")

    img = ImageOps.exif_transpose(img)
    if img.mode in ("RGBA", "LA", "PA") or "transparency" in img.info:
        rgba = img.convert("RGBA")
        bg = Image.new("RGBA", rgba.size, (255, 255, 255, 255))
        img = Image.alpha_composite(bg, rgba)
    img = img.convert("L")
    return np.asarray(img, dtype=np.float32) / 255.0


def resize_max(img: np.ndarray, max_dim: int) -> np.ndarray:
    """Reduz mantendo proporção para que o maior lado seja `max_dim`."""
    h, w = img.shape[:2]
    longest = max(h, w)
    if max_dim <= 0 or longest <= max_dim:
        return img
    scale = max_dim / longest
    new = (max(1, int(round(w * scale))), max(1, int(round(h * scale))))
    pil = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8))
    return np.asarray(pil.resize(new, Image.LANCZOS), dtype=np.float32) / 255.0


def preprocess(img: np.ndarray, p: PreprocessParams) -> np.ndarray:
    """Aplica redimensionamento, níveis, gama e desfoque, nessa ordem."""
    from scipy.ndimage import gaussian_filter

    out = resize_max(np.asarray(img, dtype=np.float32), p.max_dim)

    if p.autolevel:
        lo, hi = float(np.percentile(out, 1)), float(np.percentile(out, 99))
        if hi - lo > 1e-3:
            out = (out - lo) / (hi - lo)

    if p.contrast != 1.0:
        out = (out - 0.5) * p.contrast + 0.5
    if p.brightness:
        out = out + p.brightness
    out = np.clip(out, 0.0, 1.0)

    if p.gamma and p.gamma != 1.0:
        out = np.power(out, 1.0 / max(p.gamma, 1e-3))
    if p.invert:
        out = 1.0 - out
    if p.blur and p.blur > 0:
        out = gaussian_filter(out, sigma=p.blur)

    return np.clip(out, 0.0, 1.0).astype(np.float32)


def darkness(img: np.ndarray) -> np.ndarray:
    """Converte luminância em "quanta tinta" — 0 = papel, 1 = preto cheio."""
    return 1.0 - np.clip(img, 0.0, 1.0)


def to_xy(rows_cols: np.ndarray, height: int) -> np.ndarray:
    """(linha, coluna) da imagem -> (x, y) com Y para cima.

    Este é o único lugar do projeto que faz a inversão do eixo; todos os
    vetorizadores passam por aqui.
    """
    rc = np.asarray(rows_cols, dtype=np.float64).reshape(-1, 2)
    xy = np.empty_like(rc)
    xy[:, 0] = rc[:, 1]
    xy[:, 1] = (height - 1) - rc[:, 0]
    return xy
