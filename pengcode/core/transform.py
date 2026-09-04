"""Transformações geométricas: encaixe na folha, rotação e recorte."""

from __future__ import annotations

import numpy as np

from .paths import Drawing, Path


def map_paths(paths: list[Path], fn) -> list[Path]:
    return [p.transformed(fn) for p in paths]


def translate(paths: list[Path], dx: float, dy: float) -> list[Path]:
    d = np.array([dx, dy], dtype=float)
    return map_paths(paths, lambda pts: pts + d)


def scale(paths: list[Path], sx: float, sy: float | None = None) -> list[Path]:
    s = np.array([sx, sx if sy is None else sy], dtype=float)
    return map_paths(paths, lambda pts: pts * s)


def rotate(paths: list[Path], degrees: float, center=(0.0, 0.0)) -> list[Path]:
    t = np.deg2rad(degrees)
    c, s = np.cos(t), np.sin(t)
    m = np.array([[c, -s], [s, c]])
    o = np.asarray(center, dtype=float)
    return map_paths(paths, lambda pts: (pts - o) @ m.T + o)


def fit_to_box(
    drawing: Drawing,
    box: tuple[float, float, float, float],
    mode: str = "fit",
    rotate_deg: float = 0.0,
    use_content_bounds: bool = True,
    align: str = "center",
) -> Drawing:
    """Escala e posiciona o desenho dentro de `box` = (x, y, largura, altura).

    - `fit`: cabe inteiro na caixa, mantendo proporção (o padrão).
    - `fill`: cobre a caixa inteira, mantendo proporção (sobra é recortada).
    - `stretch`: deforma para preencher exatamente.

    `use_content_bounds=False` usa o tamanho da imagem original em vez do
    retângulo ocupado pelos traços — útil quando as margens brancas da
    imagem fazem parte da composição.
    """
    paths = [p for p in drawing.paths if len(p) >= 2]
    if not paths:
        return Drawing([], drawing.size, dict(drawing.meta))

    if rotate_deg:
        paths = rotate(paths, rotate_deg)

    if use_content_bounds or not drawing.size:
        b = Drawing(paths).bounds()
        x0, y0, x1, y1 = b
    else:
        w, h = drawing.size
        if rotate_deg:
            corners = np.array([[0, 0], [w, 0], [w, h], [0, h]], dtype=float)
            t = np.deg2rad(rotate_deg)
            m = np.array([[np.cos(t), -np.sin(t)], [np.sin(t), np.cos(t)]])
            corners = corners @ m.T
            x0, y0 = corners.min(axis=0)
            x1, y1 = corners.max(axis=0)
        else:
            x0, y0, x1, y1 = 0.0, 0.0, w, h

    src_w = max(x1 - x0, 1e-9)
    src_h = max(y1 - y0, 1e-9)
    bx, by, bw, bh = box

    if mode == "stretch":
        sx, sy = bw / src_w, bh / src_h
    elif mode == "fill":
        sx = sy = max(bw / src_w, bh / src_h)
    else:
        sx = sy = min(bw / src_w, bh / src_h)

    out_w, out_h = src_w * sx, src_h * sy
    if align == "min":
        ox, oy = bx, by
    elif align == "max":
        ox, oy = bx + bw - out_w, by + bh - out_h
    else:
        ox, oy = bx + (bw - out_w) / 2.0, by + (bh - out_h) / 2.0

    origin = np.array([x0, y0])
    factor = np.array([sx, sy])
    shift = np.array([ox, oy])
    moved = map_paths(paths, lambda pts: (pts - origin) * factor + shift)
    return Drawing(moved, (bw, bh), dict(drawing.meta))


def _liang_barsky(a, b, rect):
    """Recorta o segmento a-b contra o retângulo; None se ficar totalmente fora."""
    x0, y0, x1, y1 = rect
    dx, dy = b[0] - a[0], b[1] - a[1]
    t0, t1 = 0.0, 1.0
    for p, q in ((-dx, a[0] - x0), (dx, x1 - a[0]), (-dy, a[1] - y0), (dy, y1 - a[1])):
        if abs(p) < 1e-12:
            if q < 0:
                return None
            continue
        r = q / p
        if p < 0:
            if r > t1:
                return None
            t0 = max(t0, r)
        else:
            if r < t0:
                return None
            t1 = min(t1, r)
    if t0 > t1:
        return None
    a = np.asarray(a, dtype=float)
    d = np.array([dx, dy])
    return a + d * t0, a + d * t1


def clip_rect(drawing: Drawing, rect: tuple[float, float, float, float]) -> Drawing:
    """Corta tudo que sai do retângulo (xmin, ymin, xmax, ymax).

    Sem isso, um desenho maior que a área alcançável faria a máquina bater no
    fim de curso ou "achatar" o desenho contra a borda.
    """
    x0, y0, x1, y1 = rect
    out: list[Path] = []
    for p in drawing.paths:
        if len(p) < 2:
            continue
        b = p.bounds()
        if b and b[0] >= x0 and b[1] >= y0 and b[2] <= x1 and b[3] <= y1:
            out.append(p)  # inteiramente dentro: preserva inclusive o fechamento
            continue

        pts = p.points
        if p.closed and len(pts) > 2:
            pts = np.vstack([pts, pts[0]])

        run: list[np.ndarray] = []
        for i in range(len(pts) - 1):
            seg = _liang_barsky(pts[i], pts[i + 1], rect)
            if seg is None:
                if len(run) >= 2:
                    out.append(p._like(np.array(run)))
                run = []
                continue
            pa, pb = seg
            if run and np.allclose(run[-1], pa, atol=1e-9):
                run.append(pb)
            else:
                if len(run) >= 2:
                    out.append(p._like(np.array(run)))
                run = [pa, pb]
        if len(run) >= 2:
            out.append(p._like(np.array(run)))

    return Drawing(out, drawing.size, dict(drawing.meta))
