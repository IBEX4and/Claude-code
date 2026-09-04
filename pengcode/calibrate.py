"""Padrões de calibração.

Rodar estes quatro antes do primeiro desenho economiza horas: eles medem o
offset da caneta, a altura de contato, e onde velocidade e aceleração começam
a estragar o traço nesta máquina, com esta caneta, neste papel.
"""

from __future__ import annotations

import numpy as np

from .core.paths import Drawing, Path
from .core.text import text_paths, text_width
from .machine.profile import Profile

LABEL_H = 3.5


def _rect(x, y, w, h, **kw) -> Path:
    return Path([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], closed=True, **kw)


def _circle(cx, cy, r, n=48, **kw) -> Path:
    t = np.linspace(0, 2 * np.pi, n, endpoint=False)
    return Path(np.stack([cx + r * np.cos(t), cy + r * np.sin(t)], axis=1), closed=True, **kw)


def _label(text: str, cx: float, cy: float, size: float, box, height: float = LABEL_H) -> list[Path]:
    """Rótulo perto de (cx, cy), sempre dentro da caixa desenhável.

    Um rótulo que vaza para fora da área alcançável é pior que rótulo nenhum:
    ele seria recortado no G-code e ainda contaria como ponto fora de curso.
    """
    x, y, w, h = box
    width = text_width(text, height)
    lx = min(max(cx - width / 2.0, x), max(x, x + w - width))
    above = cy <= y + h / 2.0            # cruz na metade de baixo -> rótulo por cima
    ly = cy + size / 2.0 + 1.5 if above else cy - size / 2.0 - height - 1.5
    ly = min(max(ly, y), max(y, y + h - height))
    return text_paths(text, lx, ly, height)


def _cross(cx, cy, size, **kw) -> list[Path]:
    h = size / 2.0
    return [Path([[cx - h, cy], [cx + h, cy]], **kw), Path([[cx, cy - h], [cx, cy + h]], **kw)]


def frame(profile: Profile) -> Drawing:
    """Contorno da área desenhável, para posicionar a folha.

    Rode este primeiro, sempre. Se o retângulo não cair inteiro no papel, é a
    folha que está no lugar errado — não o desenho.
    """
    x, y, w, h = profile.content_box()
    paths = [_rect(x, y, w, h)]

    tick = min(12.0, w / 4.0, h / 4.0)
    for cx, cy, sx, sy in ((x, y, 1, 1), (x + w, y, -1, 1), (x, y + h, 1, -1), (x + w, y + h, -1, -1)):
        paths.append(Path([[cx + sx * tick, cy], [cx, cy], [cx, cy + sy * tick]]))

    # marca o canto de origem com um triângulo, para conferir a orientação
    paths.append(Path([[x + 2, y + 2], [x + 2 + tick / 2, y + 2], [x + 2, y + 2 + tick / 2]], closed=True))
    paths += text_paths(f"{w:.0f}X{h:.0f}MM", x + 4 + tick / 2, y + 3, LABEL_H)
    return Drawing(paths, meta={"pattern": "frame"})


def cross(profile: Profile, size: float = 20.0, inset: float = 15.0) -> Drawing:
    """Cruzes em coordenadas conhecidas, para medir o offset da caneta.

    Procedimento: desenhe, meça onde a cruz caiu de verdade na mesa e some a
    diferença ao offset atual — `novo = atual + (medido - pretendido)`.
    """
    x, y, w, h = profile.content_box()
    spots = [
        (x + inset, y + inset),
        (x + w - inset, y + inset),
        (x + inset, y + h - inset),
        (x + w / 2.0, y + h / 2.0),
    ]
    box = (x, y, w, h)
    paths: list[Path] = []
    for cx, cy in spots:
        paths += _cross(cx, cy, size)
        paths.append(_circle(cx, cy, size / 6.0, 24))
        paths += _label(f"{cx:.0f},{cy:.0f}", cx, cy, size, box)
    paths += text_paths("MEDIR NA MESA", x + 4, y + h - LABEL_H, LABEL_H)
    return Drawing(paths, meta={"pattern": "cross"})


def zladder(
    profile: Profile,
    z_from: float | None = None,
    z_to: float | None = None,
    steps: int = 11,
    length: float = 70.0,
) -> Drawing:
    """Escada de altura: o mesmo traço em vários Z, cada um rotulado.

    O menor Z que já marca de forma uniforme é o seu `z.down`. Com suporte de
    mola, escolha um ou dois degraus **abaixo** dele: é essa folga que absorve
    papel ondulado e mesa desnivelada.
    """
    steps = max(2, int(steps))
    nominal = profile.z.down
    z_from = nominal + 1.0 if z_from is None else z_from
    z_to = nominal - 1.0 if z_to is None else z_to

    x, y, w, h = profile.content_box()
    length = min(length, w - 30.0)
    gap = min(8.0, (h - 20.0) / steps)
    paths: list[Path] = []
    for i, z in enumerate(np.linspace(z_from, z_to, steps)):
        z = float(min(max(z, profile.z.min), profile.z.max))
        row = y + h - 10.0 - i * gap
        label = f"Z{z:.2f}"
        paths += text_paths(label, x + 2, row - LABEL_H / 2.0, LABEL_H, pen_z=nominal)
        paths.append(Path([[x + 24, row], [x + 24 + length, row]], pen_z=z))
        # um zigue-zague curto no mesmo Z revela falha em mudança de direção
        zig = np.array([[x + 26 + length + k * 2.0, row + (2.0 if k % 2 else -2.0)] for k in range(6)])
        if zig[:, 0].max() <= x + w:
            paths.append(Path(zig, pen_z=z))
    paths += text_paths("ESCADA DE Z", x + 2, y + 4, LABEL_H, pen_z=nominal)
    return Drawing(paths, meta={"pattern": "zladder"})


def speed(
    profile: Profile,
    feeds: tuple[float, ...] = (1200, 2400, 4800, 8000),
    accels: tuple[float, ...] = (500, 1500, 3000, 6000),
) -> Drawing:
    """Grade velocidade x aceleração.

    Cada célula tem um círculo (mostra arredondamento de canto e ringing), um
    zigue-zague (mostra o chicote da caneta) e um quadrado. Escolha a célula
    mais rápida que ainda sai limpa — e confira se o papel não andou.
    """
    x, y, w, h = profile.content_box()
    cols, rows = len(feeds), len(accels)
    margin_left, margin_top = 20.0, 8.0
    cw = (w - margin_left) / cols
    ch = (h - margin_top) / rows
    size = min(cw, ch) * 0.62

    paths: list[Path] = []
    for c, feed in enumerate(feeds):
        cx = x + margin_left + c * cw + cw / 2.0
        label = f"F{feed:.0f}"
        paths += text_paths(label, cx - text_width(label, LABEL_H) / 2.0, y + h - LABEL_H - 1, LABEL_H)

    for r, accel in enumerate(accels):
        cy = y + h - margin_top - r * ch - ch / 2.0
        paths += text_paths(f"A{accel:.0f}", x, cy - LABEL_H / 2.0, LABEL_H)
        for c, feed in enumerate(feeds):
            cx = x + margin_left + c * cw + cw / 2.0
            kw = {"feed": float(feed), "accel": float(accel)}
            paths.append(_circle(cx, cy, size / 2.0, 60, **kw))
            paths.append(_rect(cx - size / 2.8, cy - size / 2.8, size / 1.4, size / 1.4, **kw))
            n = 7
            zx = np.linspace(cx - size / 2.6, cx + size / 2.6, n)
            zy = cy + np.where(np.arange(n) % 2, size / 5.0, -size / 5.0)
            paths.append(Path(np.stack([zx, zy], axis=1), **kw))
    return Drawing(paths, meta={"pattern": "speed"})


PATTERNS = {
    "frame": frame,
    "cross": cross,
    "zladder": zladder,
    "speed": speed,
}

HINTS = {
    "frame": "Contorno da área desenhável. Use para posicionar e prender a folha.",
    "cross": "Cruzes em coordenadas conhecidas. novo_offset = atual + (medido - pretendido).",
    "zladder": "Mesmo traço em vários Z. O menor que marca uniforme é o seu z.down.",
    "speed": "Grade F x A. Pegue a célula mais rápida que ainda sai limpa.",
}


def build(name: str, profile: Profile, **kwargs) -> Drawing:
    if name not in PATTERNS:
        raise KeyError(f"padrão '{name}' desconhecido (use um de: {', '.join(PATTERNS)})")
    return PATTERNS[name](profile, **kwargs)
