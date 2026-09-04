"""Orquestração: fonte (imagem ou SVG) -> traços -> mm de mesa -> G-code.

A ordem dos estágios importa. Vetoriza-se em pixels, encaixa-se na folha (a
partir daí tudo é milímetro, e as tolerâncias de simplificação passam a ter
significado físico), recorta-se o que não cabe e só então se otimiza — assim a
reordenação já trabalha sobre a geometria final.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, fields
from pathlib import Path as FsPath

import numpy as np

from .core import vectorize as V
from .core.optimize import optimize_drawing
from .core.paths import Drawing
from .core.raster import PreprocessParams, load_gray, preprocess
from .core.transform import clip_rect, fit_to_box
from .gcode.emitter import EmitResult, emit_gcode
from .machine.profile import Profile, load_profile

MODES = ("edges", "centerline", "contours", "hatch", "spiral", "stipple", "svg")

#: Quais controles cada modo usa — a interface web monta os painéis a partir daqui.
MODE_INFO: dict[str, dict] = {
    "edges": {
        "label": "Bordas (Canny)",
        "hint": "Mais fiel para line art, logos e desenhos com contorno. Os limiares são quantis: maior = menos detalhe.",
        "params": ["edge_sigma", "edge_low", "edge_high"],
    },
    "centerline": {
        "label": "Eixo médio",
        "hint": "Reduz cada mancha escura a uma linha. Bom para tinta e caligrafia.",
        "params": ["threshold"],
    },
    "contours": {
        "label": "Curvas de nível",
        "hint": "Isolinhas de tom. Poucos níveis = pôster; muitos = retrato topográfico.",
        "params": ["levels", "contour_low", "contour_high"],
    },
    "hatch": {
        "label": "Hachura",
        "hint": "Linhas paralelas que cruzam nas áreas escuras. O melhor para tons contínuos.",
        "params": ["hatch_spacing", "hatch_levels", "hatch_angle", "hatch_angle_step"],
        "fills_frame": True,
    },
    "spiral": {
        "label": "Espiral modulada",
        "hint": "Uma única linha do centro para fora. Quase sem levantar a caneta.",
        "params": ["spiral_pitch", "spiral_wavelength", "spiral_amplitude", "spiral_skip_white"],
        "fills_frame": True,
    },
    "stipple": {
        "label": "Pontilhismo / linha única",
        "hint": "Voronoi ponderado. Em 'tsp' vira um traço contínuo só.",
        "params": ["stipple_points", "stipple_iterations", "stipple_style", "stipple_dot"],
        "fills_frame": True,
    },
    "svg": {
        "label": "SVG (vetor pronto)",
        "hint": "Usa a geometria do arquivo direto, sem passar por imagem.",
        "params": [],
    },
}


@dataclass
class Params:
    """Todos os controles do pipeline, num objeto só (serializa direto em JSON)."""

    mode: str = "edges"

    # --- pré-processamento da imagem
    max_dim: int = 900
    invert: bool = False
    brightness: float = 0.0
    contrast: float = 1.0
    gamma: float = 1.0
    blur: float = 1.0
    autolevel: bool = True

    # --- por modo
    edge_sigma: float = 1.6
    edge_low: float = 0.82    # quantis do gradiente, não valores absolutos
    edge_high: float = 0.92
    threshold: float | None = None
    levels: int = 6
    contour_low: float = 0.15
    contour_high: float = 0.9
    # Os parâmetros abaixo estão em MILÍMETROS DE PAPEL, não em pixels: quem
    # ajusta pensa na largura da caneta ("0,8 mm entre linhas"), e o resultado
    # não muda quando se troca a resolução da imagem ou o tamanho da folha.
    hatch_spacing: float = 0.8
    hatch_levels: int = 3
    hatch_angle: float = 45.0
    hatch_angle_step: float | None = None
    spiral_pitch: float = 2.0
    spiral_wavelength: float = 2.0
    spiral_amplitude: float = 0.85
    spiral_skip_white: float = 0.0
    stipple_points: int = 1800
    stipple_iterations: int = 18
    stipple_style: str = "tsp"       # "tsp" ou "dots"
    stipple_dot: float = 0.8

    # --- posicionamento na folha (mm)
    fit: str = "fit"                 # fit | fill | stretch
    rotate: float = 0.0
    align: str = "center"
    use_content_bounds: bool = True

    # --- otimização (mm)
    simplify: float = 0.08
    join: float = 0.3
    min_length: float = 0.5
    reorder: bool = True
    time_budget: float = 3.0

    @classmethod
    def from_dict(cls, data: dict | None) -> "Params":
        """Aceita dicionários parciais e com tipos frouxos (querystring, JSON)."""
        known = {f.name: f for f in fields(cls)}
        kwargs = {}
        for key, value in (data or {}).items():
            f = known.get(key)
            if f is None or value is None or value == "":
                continue
            kwargs[key] = _coerce(f.type, value)
        return cls(**kwargs)

    def to_dict(self) -> dict:
        return asdict(self)


def _coerce(type_hint, value):
    hint = type_hint if isinstance(type_hint, str) else getattr(type_hint, "__name__", "")
    if "bool" in hint:
        if isinstance(value, str):
            return value.strip().lower() in ("1", "true", "yes", "on", "sim")
        return bool(value)
    if "int" in hint:
        return int(round(float(value)))
    if "float" in hint:
        return float(value)
    return value


def fills_frame(mode: str) -> bool:
    """Modos de preenchimento tomam a imagem inteira como conteúdo.

    Para eles não faz sentido reenquadrar pelo retângulo ocupado pelos traços:
    o quadro da imagem É o desenho, e é ele que define a escala em mm.
    """
    return bool(MODE_INFO.get(mode, {}).get("fills_frame"))


def px_per_mm(shape: tuple[int, int], box: tuple[float, float, float, float], params: "Params") -> float:
    """Quantos pixels da imagem cabem em 1 mm de papel, depois do encaixe.

    Precisa ser calculado ANTES de vetorizar, porque é o que converte os
    parâmetros físicos (espaçamento da hachura, passo da espiral) para o
    espaço de pixels onde os vetorizadores trabalham.
    """
    h, w = float(shape[0]), float(shape[1])
    bw, bh = box[2], box[3]
    if bw <= 0 or bh <= 0 or w <= 0 or h <= 0:
        return 1.0
    if params.rotate:
        t = np.deg2rad(params.rotate)
        w, h = abs(w * np.cos(t)) + abs(h * np.sin(t)), abs(w * np.sin(t)) + abs(h * np.cos(t))
    if params.fit == "fill":
        scale = max(bw / w, bh / h)
    elif params.fit == "stretch":
        scale = (bw / w + bh / h) / 2.0
    else:
        scale = min(bw / w, bh / h)
    return 1.0 / scale if scale > 0 else 1.0


def _is_svg(source, filename: str | None) -> bool:
    if filename and str(filename).lower().endswith(".svg"):
        return True
    if isinstance(source, (bytes, bytearray)):
        return source.lstrip()[:200].lower().startswith((b"<svg", b"<?xml"))
    if isinstance(source, str) and source.lstrip().startswith("<"):
        return "<svg" in source[:400].lower()
    if isinstance(source, (str, FsPath)):
        return str(source).lower().endswith(".svg")
    return False


def vectorize(source, params: Params, profile: Profile, filename: str | None = None) -> Drawing:
    """Fonte -> traços em pixels (ou unidades de SVG), com Y para cima."""
    if params.mode == "svg" or _is_svg(source, filename):
        paths, size = V.parse_svg(source)
        return Drawing(paths, size, {"mode": "svg"})

    gray = preprocess(
        load_gray(source),
        PreprocessParams(
            max_dim=params.max_dim,
            invert=params.invert,
            brightness=params.brightness,
            contrast=params.contrast,
            gamma=params.gamma,
            blur=params.blur,
            autolevel=params.autolevel,
        ),
    )
    h, w = gray.shape
    mode = params.mode
    ppm = px_per_mm((h, w), profile.content_box(), params)   # pixels por mm de papel

    if mode == "edges":
        paths = V.vectorize_edges(gray, params.edge_sigma, params.edge_low, params.edge_high)
    elif mode == "centerline":
        paths = V.vectorize_centerline(gray, params.threshold)
    elif mode == "contours":
        paths = V.vectorize_contours(gray, params.levels, params.contour_low, params.contour_high)
    elif mode == "hatch":
        paths = V.vectorize_hatch(
            gray, params.hatch_spacing * ppm, params.hatch_levels,
            params.hatch_angle, params.hatch_angle_step,
            min_length=max(params.min_length, 0.3) * ppm,
        )
    elif mode == "spiral":
        paths = V.vectorize_spiral(
            gray, params.spiral_pitch * ppm, params.spiral_wavelength * ppm,
            params.spiral_amplitude * ppm, skip_white=params.spiral_skip_white,
        )
    elif mode == "stipple":
        paths = V.vectorize_stipple(
            gray, params.stipple_points, params.stipple_iterations,
            params.stipple_style, params.stipple_dot * ppm, time_budget=params.time_budget,
        )
    else:
        raise ValueError(f"modo desconhecido: {mode!r} (use um de: {', '.join(MODES)})")

    return Drawing(paths, (float(w), float(h)), {"mode": mode})


def layout(drawing: Drawing, profile: Profile, params: Params) -> Drawing:
    """Encaixa na folha e recorta o que a caneta não alcança."""
    box = profile.content_box()
    if box[2] <= 0 or box[3] <= 0:
        return Drawing([], drawing.size, dict(drawing.meta))
    placed = fit_to_box(
        drawing, box, mode=params.fit, rotate_deg=params.rotate,
        use_content_bounds=params.use_content_bounds and not fills_frame(params.mode),
        align=params.align,
    )
    x, y, w, h = box
    reach = profile.reachable_rect()
    rect = (max(x, reach[0]), max(y, reach[1]), min(x + w, reach[2]), min(y + h, reach[3]))
    return clip_rect(placed, rect)


def optimize(drawing: Drawing, profile: Profile, params: Params) -> Drawing:
    box = profile.content_box()
    return optimize_drawing(
        drawing,
        tolerance=params.simplify,
        join_epsilon=params.join,
        min_length=params.min_length,
        reorder=params.reorder,
        start=(box[0], box[1]),
        time_budget=params.time_budget,
    )


@dataclass
class Result:
    drawing: Drawing
    emit: EmitResult
    params: Params
    profile: Profile

    @property
    def gcode(self) -> str:
        return self.emit.gcode

    @property
    def stats(self) -> dict:
        return self.emit.stats

    @property
    def warnings(self) -> list[str]:
        return self.emit.warnings


def generate(
    source,
    params: Params | dict | None = None,
    profile: Profile | str | None = None,
    filename: str | None = None,
    title: str = "",
) -> Result:
    """Pipeline completo: fonte -> `Result` com desenho posicionado e G-code."""
    params = params if isinstance(params, Params) else Params.from_dict(params)
    profile = profile if isinstance(profile, Profile) else load_profile(profile)

    drawing = vectorize(source, params, profile, filename)
    drawing = layout(drawing, profile, params)
    drawing = optimize(drawing, profile, params)

    notes = [f"modo: {params.mode}", f"origem: {filename or 'imagem'}"]
    return Result(drawing, emit_gcode(drawing, profile, title, notes), params, profile)
