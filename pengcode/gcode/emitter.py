"""Geração do G-code.

Duas regras que este módulo nunca quebra:

1. **Nenhum comando de extrusão (E) e nenhum aquecimento.** Um `E` perdido faz
   o extrusor moer a vazio; um `M109` esquenta um bico que ninguém vai usar.
2. **Todo XY passa pelo limite da máquina.** Coordenadas fora de curso são
   presas na borda e contabilizadas num aviso, em vez de irem para a
   impressora e baterem no fim de curso.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field

import numpy as np

from ..core.paths import Drawing, Path
from ..machine.profile import Profile


@dataclass
class EmitResult:
    gcode: str
    stats: dict = field(default_factory=dict)
    warnings: list[str] = field(default_factory=list)

    def save(self, path) -> None:
        with open(path, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(self.gcode)


def _n(value: float) -> str:
    """Número compacto: 3 casas, sem zeros à toa e sem '-0'."""
    text = f"{float(value):.3f}".rstrip("0").rstrip(".")
    return "0" if text in ("", "-0", "-") else text


def _move_time(length: float, feed_mm_min: float, accel: float) -> float:
    """Tempo de um movimento com rampa trapezoidal (segundos)."""
    if length <= 0:
        return 0.0
    v = max(feed_mm_min, 1.0) / 60.0
    a = max(accel, 1.0)
    ramp = v * v / (2 * a)
    if 2 * ramp >= length:          # nem chega na velocidade alvo
        return 2 * math.sqrt(length / a)
    return (length - 2 * ramp) / v + 2 * v / a


def estimate_time(drawing: Drawing, profile: Profile, start=(0.0, 0.0)) -> float:
    """Estimativa em segundos. Considera cada traço como um movimento contínuo."""
    a = profile.accel
    z_travel = abs(profile.z.up - profile.z.down)
    total = 0.0
    cur = np.asarray(start, dtype=float)
    for p in drawing.paths:
        if len(p) < 2:
            continue
        pa = p.accel or a
        total += _move_time(float(np.hypot(*(p.start - cur))), profile.feeds.travel, pa)
        total += 2 * _move_time(z_travel, profile.z.feed, pa)
        total += _move_time(p.length(), p.feed or profile.feeds.draw, pa)
        cur = p.points[0] if p.closed else p.end
    return total


def format_duration(seconds: float) -> str:
    seconds = int(round(max(0.0, seconds)))
    h, rem = divmod(seconds, 3600)
    m, s = divmod(rem, 60)
    return f"{h}h{m:02d}m{s:02d}s" if h else f"{m}m{s:02d}s"


def _template_context(profile: Profile) -> dict:
    return {
        "accel": _n(profile.accel),
        "z_safe": _n(profile.z.safe),
        "z_up": _n(profile.z.up),
        "z_down": _n(profile.z.down),
        "z_feed": _n(profile.z.feed),
        "feed_draw": _n(profile.feeds.draw),
        "feed_travel": _n(profile.feeds.travel),
        "bed_x": _n(profile.bed.x),
        "bed_y": _n(profile.bed.y),
        "park_x": _n(profile.bed.x / 2.0),
        "park_y": _n(max(0.0, profile.bed.y - 6.0)),
    }


def _render(template: str, context: dict, warnings: list[str], label: str) -> list[str]:
    if not template:
        return []
    try:
        text = template.format(**context)
    except (KeyError, IndexError, ValueError) as exc:
        warnings.append(f"{label}: placeholder não reconhecido ({exc}); usando o texto literal.")
        text = template
    return [line.rstrip() for line in text.rstrip("\n").split("\n")]


class _Emitter:
    """Mantém o estado da máquina para não repetir Z e F desnecessariamente."""

    def __init__(self, profile: Profile, warnings: list[str]):
        self.p = profile
        self.lines: list[str] = []
        self.warnings = warnings
        self.z: float | None = None
        self.f: float | None = None
        self.accel: float | None = None
        self.pos = np.array([0.0, 0.0])
        self.clamped = 0
        self.travel_mm = 0.0
        self.draw_mm = 0.0

    def raw(self, line: str) -> None:
        self.lines.append(line)

    def to_machine(self, point) -> np.ndarray:
        """Coordenada de papel (mm de mesa) -> coordenada de bico, com limite."""
        x = float(point[0]) - self.p.pen_offset.x
        y = float(point[1]) - self.p.pen_offset.y
        cx = min(max(x, 0.0), self.p.bed.x)
        cy = min(max(y, 0.0), self.p.bed.y)
        if abs(cx - x) > 1e-6 or abs(cy - y) > 1e-6:
            self.clamped += 1
        return np.array([cx, cy])

    def set_accel(self, accel: float) -> None:
        if self.accel is not None and abs(self.accel - accel) < 1e-6:
            return
        self.raw(f"M204 S{_n(accel)}")
        self.accel = accel

    def move_z(self, z: float) -> None:
        z = min(max(float(z), self.p.z.min), self.p.z.max)
        if self.z is not None and abs(self.z - z) < 1e-6:
            return
        self.raw(f"G1 Z{_n(z)} F{_n(self.p.z.feed)}")
        self.f = self.p.z.feed
        self.z = z

    def move_xy(self, point, feed: float, drawing: bool) -> None:
        target = self.to_machine(point)
        dist = float(np.hypot(*(target - self.pos)))
        if dist < 1e-6:
            return
        if self.f is not None and abs(self.f - feed) < 1e-6:
            self.raw(f"G1 X{_n(target[0])} Y{_n(target[1])}")
        else:
            self.raw(f"G1 X{_n(target[0])} Y{_n(target[1])} F{_n(feed)}")
            self.f = feed
        self.pos = target
        if drawing:
            self.draw_mm += dist
        else:
            self.travel_mm += dist


def emit_gcode(
    drawing: Drawing,
    profile: Profile,
    title: str = "",
    notes: list[str] | None = None,
) -> EmitResult:
    """Converte um desenho já posicionado em mm de mesa para G-code."""
    warnings = list(profile.check())
    context = _template_context(profile)
    em = _Emitter(profile, warnings)

    paths = [p for p in drawing.paths if len(p) >= 2]
    seconds = estimate_time(Drawing(paths), profile)
    stats = Drawing(paths).stats()

    header = [
        "; ==========================================================",
        "; G-code de desenho a caneta gerado por pengcode",
        "; NAO ha extrusao e NENHUM aquecedor e ligado neste arquivo.",
        "; ==========================================================",
        f"; perfil        : {profile.name}",
    ]
    if title:
        header.append(f"; desenho       : {title}")
    header += [
        f"; tracos        : {stats['paths']}",
        f"; pontos        : {stats['points']}",
        f"; desenhando    : {stats['draw_mm']:.0f} mm",
        f"; viagem        : {stats['travel_mm']:.0f} mm",
        f"; tempo estimado: {format_duration(seconds)}",
        f"; offset caneta : X{_n(profile.pen_offset.x)} Y{_n(profile.pen_offset.y)} mm",
        f"; Z desenho/topo: {_n(profile.z.down)} / {_n(profile.z.up)} mm",
    ]
    for note in notes or []:
        header.append(f"; {note}")
    header.append(";")

    em.lines.extend(header)
    em.lines.extend(_render(profile.start_gcode, context, warnings, "start_gcode"))
    em.z = profile.z.safe  # o start_gcode padrão sobe até a altura segura
    em.f = None

    em.accel = profile.accel  # o start_gcode padrão já emitiu o M204
    for path in paths:
        if path.accel is not None:
            em.set_accel(path.accel)
        feed = profile.feeds.draw if path.feed is None else path.feed
        em.move_z(profile.z.up)
        em.move_xy(path.points[0], profile.feeds.travel, drawing=False)
        em.move_z(profile.z.down if path.pen_z is None else path.pen_z)
        for point in path.points[1:]:
            em.move_xy(point, feed, drawing=True)
        if path.closed and len(path.points) > 2:
            em.move_xy(path.points[0], feed, drawing=True)
    em.move_z(profile.z.up)

    em.lines.extend(_render(profile.end_gcode, context, warnings, "end_gcode"))

    if em.clamped:
        warnings.append(
            f"{em.clamped} ponto(s) caíram fora do curso da máquina e foram presos na borda. "
            "Reduza o desenho ou reveja o offset da caneta."
        )

    stats = {
        **stats,
        "seconds": round(seconds, 1),
        "duration": format_duration(seconds),
        "machine_draw_mm": round(em.draw_mm, 1),
        "machine_travel_mm": round(em.travel_mm, 1),
        "clamped_points": em.clamped,
        "lines": len(em.lines),
    }
    return EmitResult("\n".join(em.lines) + "\n", stats, warnings)
