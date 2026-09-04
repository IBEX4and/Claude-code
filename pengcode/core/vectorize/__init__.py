"""Modos de vetorização: imagem (ou SVG) -> lista de traços.

Todos os vetorizadores devolvem `list[Path]` em pixels da imagem de origem,
já com **Y para cima**.
"""

from .trace import trace_skeleton
from .edges import vectorize_edges, vectorize_centerline
from .contours import vectorize_contours
from .hatch import vectorize_hatch
from .spiral import vectorize_spiral
from .stipple import vectorize_stipple
from .svgin import parse_svg

__all__ = [
    "trace_skeleton",
    "vectorize_edges",
    "vectorize_centerline",
    "vectorize_contours",
    "vectorize_hatch",
    "vectorize_spiral",
    "vectorize_stipple",
    "parse_svg",
]
