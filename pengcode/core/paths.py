"""Geometria base: polilinhas (`Path`) e o desenho inteiro (`Drawing`).

Convenção de coordenadas usada em todo o projeto: **Y para cima**. Os
vetorizadores já devolvem os pontos nessa orientação (invertendo o eixo de
linha da imagem), então nada depois precisa se preocupar com espelhamento.
As unidades são pixels da imagem de origem até `transform.fit_to`, e
milímetros da mesa depois dele.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Iterator, Sequence

import numpy as np


def as_points(points) -> np.ndarray:
    """Normaliza qualquer sequência de pontos para um array (N, 2) float64."""
    arr = np.asarray(points, dtype=np.float64)
    if arr.size == 0:
        return np.zeros((0, 2), dtype=np.float64)
    if arr.ndim != 2 or arr.shape[1] != 2:
        raise ValueError(f"esperava pontos no formato (N, 2), recebi {arr.shape}")
    return arr


def polyline_length(points: np.ndarray) -> float:
    """Comprimento total de uma polilinha aberta."""
    pts = as_points(points)
    if len(pts) < 2:
        return 0.0
    return float(np.hypot(*np.diff(pts, axis=0).T).sum())


@dataclass
class Path:
    """Uma polilinha contínua desenhada sem levantar a caneta.

    `pen_z`, `feed` e `accel` sobrescrevem o perfil só para este traço. Ficam
    em None no uso normal; existem para os padrões de calibração, que precisam
    variar altura, velocidade e aceleração dentro de um mesmo arquivo.
    """

    points: np.ndarray
    closed: bool = False
    pen_z: float | None = None
    feed: float | None = None
    accel: float | None = None

    def __post_init__(self) -> None:
        self.points = as_points(self.points)

    def __len__(self) -> int:
        return len(self.points)

    @property
    def start(self) -> np.ndarray:
        return self.points[0]

    @property
    def end(self) -> np.ndarray:
        return self.points[-1]

    def length(self) -> float:
        """Comprimento do traço, incluindo o fechamento se `closed`."""
        n = polyline_length(self.points)
        if self.closed and len(self.points) > 2:
            n += float(np.hypot(*(self.points[0] - self.points[-1])))
        return n

    def bounds(self) -> tuple[float, float, float, float] | None:
        """(xmin, ymin, xmax, ymax) ou None se vazio."""
        if len(self.points) == 0:
            return None
        lo = self.points.min(axis=0)
        hi = self.points.max(axis=0)
        return (float(lo[0]), float(lo[1]), float(hi[0]), float(hi[1]))

    def _like(self, points) -> "Path":
        """Novo traço com a mesma geometria de origem e os mesmos overrides."""
        return Path(as_points(points), self.closed, self.pen_z, self.feed, self.accel)

    def reversed(self) -> "Path":
        return self._like(self.points[::-1].copy())

    def copy(self) -> "Path":
        return self._like(self.points.copy())

    def transformed(self, fn) -> "Path":
        return self._like(fn(self.points))


@dataclass
class Drawing:
    """Um conjunto ordenado de traços mais o tamanho do espaço de origem."""

    paths: list[Path] = field(default_factory=list)
    size: tuple[float, float] | None = None
    meta: dict = field(default_factory=dict)

    def __len__(self) -> int:
        return len(self.paths)

    def __iter__(self) -> Iterator[Path]:
        return iter(self.paths)

    @classmethod
    def from_arrays(cls, arrays: Sequence, size=None, closed: bool = False) -> "Drawing":
        return cls([Path(a, closed=closed) for a in arrays], size=size)

    def bounds(self) -> tuple[float, float, float, float] | None:
        boxes = [b for b in (p.bounds() for p in self.paths) if b is not None]
        if not boxes:
            return None
        arr = np.array(boxes)
        return (
            float(arr[:, 0].min()),
            float(arr[:, 1].min()),
            float(arr[:, 2].max()),
            float(arr[:, 3].max()),
        )

    def draw_length(self) -> float:
        return float(sum(p.length() for p in self.paths))

    def travel_length(self, start=(0.0, 0.0)) -> float:
        """Distância percorrida com a caneta levantada, na ordem atual."""
        cur = np.asarray(start, dtype=np.float64)
        total = 0.0
        for p in self.paths:
            if len(p) == 0:
                continue
            total += float(np.hypot(*(p.start - cur)))
            cur = p.points[0] if p.closed and len(p) > 2 else p.end
        return total

    def point_count(self) -> int:
        return int(sum(len(p) for p in self.paths))

    def nonempty(self) -> "Drawing":
        """Descarta traços com menos de dois pontos."""
        return Drawing([p for p in self.paths if len(p) >= 2], self.size, dict(self.meta))

    def copy(self) -> "Drawing":
        return Drawing([p.copy() for p in self.paths], self.size, dict(self.meta))

    def stats(self, start=(0.0, 0.0)) -> dict:
        b = self.bounds()
        return {
            "paths": len(self.paths),
            "points": self.point_count(),
            "draw_mm": round(self.draw_length(), 1),
            "travel_mm": round(self.travel_length(start), 1),
            "pen_lifts": len(self.paths),
            "bounds": None if b is None else [round(v, 2) for v in b],
        }
