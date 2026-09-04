"""Leitor de SVG: converte formas e caminhos em polilinhas.

Suporta `path` (incluindo arcos elípticos), `line`, `polyline`, `polygon`,
`rect`, `circle`, `ellipse`, grupos aninhados e o atributo `transform`.
Estilos, texto e imagens embutidas são ignorados — o objetivo é geometria.
"""

from __future__ import annotations

import re
import xml.etree.ElementTree as ET

import numpy as np

from ..paths import Path

_NUM = re.compile(r"[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?")
_CMD = re.compile(r"[MmZzLlHhVvCcSsQqTtAa]")
_UNIT = re.compile(r"^\s*([-+]?[\d.eE+-]+)\s*([a-z%]*)\s*$", re.I)
_UNITS_PER = {"": 1.0, "px": 1.0, "pt": 1.25, "pc": 15.0, "mm": 3.7795275591, "cm": 37.795275591, "in": 96.0}

IDENTITY = np.array([[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]])


def _floats(text: str) -> list[float]:
    return [float(m) for m in _NUM.findall(text or "")]


def _length(value: str | None, default: float = 0.0) -> float:
    if not value:
        return default
    m = _UNIT.match(value)
    if not m:
        return default
    try:
        return float(m.group(1)) * _UNITS_PER.get(m.group(2).lower(), 1.0)
    except ValueError:
        return default


def _parse_transform(text: str | None) -> np.ndarray:
    if not text:
        return IDENTITY
    matrix = IDENTITY
    for name, args in re.findall(r"(\w+)\s*\(([^)]*)\)", text):
        a = _floats(args)
        m = IDENTITY
        if name == "matrix" and len(a) == 6:
            m = np.array([[a[0], a[2], a[4]], [a[1], a[3], a[5]], [0, 0, 1]])
        elif name == "translate" and a:
            m = np.array([[1, 0, a[0]], [0, 1, a[1] if len(a) > 1 else 0.0], [0, 0, 1]])
        elif name == "scale" and a:
            sy = a[1] if len(a) > 1 else a[0]
            m = np.array([[a[0], 0, 0], [0, sy, 0], [0, 0, 1]])
        elif name == "rotate" and a:
            t = np.deg2rad(a[0])
            c, s = np.cos(t), np.sin(t)
            m = np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])
            if len(a) >= 3:
                to = np.array([[1, 0, a[1]], [0, 1, a[2]], [0, 0, 1]])
                back = np.array([[1, 0, -a[1]], [0, 1, -a[2]], [0, 0, 1]])
                m = to @ m @ back
        elif name == "skewX" and a:
            m = np.array([[1, np.tan(np.deg2rad(a[0])), 0], [0, 1, 0], [0, 0, 1]])
        elif name == "skewY" and a:
            m = np.array([[1, 0, 0], [np.tan(np.deg2rad(a[0])), 1, 0], [0, 0, 1]])
        matrix = matrix @ m
    return matrix


def _apply(matrix: np.ndarray, pts: np.ndarray) -> np.ndarray:
    pts = np.asarray(pts, dtype=float).reshape(-1, 2)
    hom = np.concatenate([pts, np.ones((len(pts), 1))], axis=1)
    return (hom @ matrix.T)[:, :2]


def _bezier(p0, p1, p2, p3, tol: float) -> np.ndarray:
    """Cúbica achatada em polilinha; o número de passos vem do tamanho dela."""
    chord = np.linalg.norm(p3 - p0) + np.linalg.norm(p1 - p0) + np.linalg.norm(p2 - p1) + np.linalg.norm(p3 - p2)
    n = int(np.clip(np.sqrt(chord / max(tol, 1e-3)) * 2, 4, 240))
    t = np.linspace(0, 1, n + 1)[1:, None]
    mt = 1 - t
    return mt**3 * p0 + 3 * mt**2 * t * p1 + 3 * mt * t**2 * p2 + t**3 * p3


def _arc(p0, rx, ry, phi_deg, large, sweep, p1, tol: float) -> np.ndarray:
    """Arco elíptico do SVG (parametrização ponta-a-ponta -> centro)."""
    if np.allclose(p0, p1):
        return np.zeros((0, 2))
    rx, ry = abs(rx), abs(ry)
    if rx < 1e-12 or ry < 1e-12:
        return p1.reshape(1, 2)

    phi = np.deg2rad(phi_deg)
    cos_p, sin_p = np.cos(phi), np.sin(phi)
    d = (p0 - p1) / 2.0
    x1 = cos_p * d[0] + sin_p * d[1]
    y1 = -sin_p * d[0] + cos_p * d[1]

    scale = (x1 / rx) ** 2 + (y1 / ry) ** 2
    if scale > 1:
        rx *= np.sqrt(scale)
        ry *= np.sqrt(scale)

    num = rx**2 * ry**2 - rx**2 * y1**2 - ry**2 * x1**2
    den = rx**2 * y1**2 + ry**2 * x1**2
    coef = np.sqrt(max(num, 0.0) / den) if den > 0 else 0.0
    if large == sweep:
        coef = -coef
    cxp, cyp = coef * rx * y1 / ry, -coef * ry * x1 / rx
    center = np.array([cos_p * cxp - sin_p * cyp, sin_p * cxp + cos_p * cyp]) + (p0 + p1) / 2.0

    def angle(ux, uy):
        return np.arctan2(uy, ux)

    theta0 = angle((x1 - cxp) / rx, (y1 - cyp) / ry)
    theta1 = angle((-x1 - cxp) / rx, (-y1 - cyp) / ry)
    delta = theta1 - theta0
    if sweep and delta < 0:
        delta += 2 * np.pi
    elif not sweep and delta > 0:
        delta -= 2 * np.pi

    n = int(np.clip(abs(delta) * max(rx, ry) / max(tol, 1e-3), 6, 360))
    t = theta0 + delta * np.linspace(0, 1, n + 1)[1:]
    x = center[0] + rx * np.cos(t) * cos_p - ry * np.sin(t) * sin_p
    y = center[1] + rx * np.cos(t) * sin_p + ry * np.sin(t) * cos_p
    return np.stack([x, y], axis=1)


def _parse_path_d(d: str, tol: float) -> list[tuple[np.ndarray, bool]]:
    """Devolve [(pontos, fechado)] no espaço local do elemento."""
    tokens = []
    pos = 0
    for m in _CMD.finditer(d or ""):
        if m.start() > pos:
            tokens.append(("args", d[pos : m.start()]))
        tokens.append(("cmd", m.group()))
        pos = m.end()
    if pos < len(d or ""):
        tokens.append(("args", d[pos:]))

    subpaths: list[tuple[np.ndarray, bool]] = []
    current: list[np.ndarray] = []
    cur = np.zeros(2)
    start = np.zeros(2)
    prev_ctrl_c = None
    prev_ctrl_q = None
    cmd = None
    args: list[float] = []

    def flush(closed=False):
        nonlocal current
        if len(current) >= 2:
            subpaths.append((np.array(current), closed))
        current = []

    i = 0
    while i < len(tokens):
        kind, value = tokens[i]
        if kind != "cmd":
            i += 1
            continue
        cmd = value
        args = _floats(tokens[i + 1][1]) if i + 1 < len(tokens) and tokens[i + 1][0] == "args" else []
        i += 2 if args else 1

        rel = cmd.islower()
        c = cmd.upper()

        if c == "Z":
            if len(current) >= 2:
                flush(closed=True)
            cur = start.copy()
            current = [cur.copy()]
            prev_ctrl_c = prev_ctrl_q = None
            continue

        step = {"M": 2, "L": 2, "H": 1, "V": 1, "C": 6, "S": 4, "Q": 4, "T": 2, "A": 7}[c]
        if not args:
            continue
        for k in range(0, len(args) - step + 1, step):
            a = args[k : k + step]
            if c == "M":
                p = np.array(a[:2])
                cur = cur + p if rel else p
                if k == 0:
                    flush()
                    start = cur.copy()
                    current = [cur.copy()]
                else:  # coordenadas extras depois de um M viram L
                    current.append(cur.copy())
                prev_ctrl_c = prev_ctrl_q = None
                continue
            if not current:
                current = [cur.copy()]
            if c == "L":
                p = np.array(a[:2])
                cur = cur + p if rel else p
                current.append(cur.copy())
                prev_ctrl_c = prev_ctrl_q = None
            elif c == "H":
                cur = np.array([cur[0] + a[0] if rel else a[0], cur[1]])
                current.append(cur.copy())
                prev_ctrl_c = prev_ctrl_q = None
            elif c == "V":
                cur = np.array([cur[0], cur[1] + a[0] if rel else a[0]])
                current.append(cur.copy())
                prev_ctrl_c = prev_ctrl_q = None
            elif c in ("C", "S"):
                if c == "C":
                    c1 = cur + a[0:2] if rel else np.array(a[0:2])
                    c2 = cur + a[2:4] if rel else np.array(a[2:4])
                    end = cur + a[4:6] if rel else np.array(a[4:6])
                else:
                    c1 = 2 * cur - prev_ctrl_c if prev_ctrl_c is not None else cur.copy()
                    c2 = cur + a[0:2] if rel else np.array(a[0:2])
                    end = cur + a[2:4] if rel else np.array(a[2:4])
                current.extend(_bezier(cur, c1, c2, end, tol))
                prev_ctrl_c, prev_ctrl_q = c2, None
                cur = end
            elif c in ("Q", "T"):
                if c == "Q":
                    q = cur + a[0:2] if rel else np.array(a[0:2])
                    end = cur + a[2:4] if rel else np.array(a[2:4])
                else:
                    q = 2 * cur - prev_ctrl_q if prev_ctrl_q is not None else cur.copy()
                    end = cur + a[0:2] if rel else np.array(a[0:2])
                c1 = cur + 2.0 / 3.0 * (q - cur)   # quadrática -> cúbica
                c2 = end + 2.0 / 3.0 * (q - end)
                current.extend(_bezier(cur, c1, c2, end, tol))
                prev_ctrl_q, prev_ctrl_c = q, None
                cur = end
            elif c == "A":
                end = cur + a[5:7] if rel else np.array(a[5:7])
                pts = _arc(cur, a[0], a[1], a[2], bool(a[3]), bool(a[4]), end, tol)
                if len(pts):
                    current.extend(pts)
                else:
                    current.append(end.copy())
                cur = end
                prev_ctrl_c = prev_ctrl_q = None
    flush()
    return subpaths


def _shape_points(tag: str, el, tol: float) -> list[tuple[np.ndarray, bool]]:
    get = lambda k, d=0.0: _length(el.get(k), d)
    if tag == "line":
        return [(np.array([[get("x1"), get("y1")], [get("x2"), get("y2")]]), False)]
    if tag in ("polyline", "polygon"):
        nums = _floats(el.get("points", ""))
        pts = np.array(nums[: len(nums) // 2 * 2]).reshape(-1, 2)
        return [(pts, tag == "polygon")] if len(pts) >= 2 else []
    if tag == "rect":
        x, y, w, h = get("x"), get("y"), get("width"), get("height")
        if w <= 0 or h <= 0:
            return []
        return [(np.array([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]), True)]
    if tag in ("circle", "ellipse"):
        cx, cy = get("cx"), get("cy")
        rx = get("r") if tag == "circle" else get("rx")
        ry = rx if tag == "circle" else get("ry")
        if rx <= 0 or ry <= 0:
            return []
        n = int(np.clip(2 * np.pi * max(rx, ry) / max(tol, 1e-3), 24, 720))
        t = np.linspace(0, 2 * np.pi, n, endpoint=False)
        return [(np.stack([cx + rx * np.cos(t), cy + ry * np.sin(t)], axis=1), True)]
    return []


def parse_svg(source, tolerance: float = 0.2) -> tuple[list[Path], tuple[float, float]]:
    """Lê um SVG e devolve (traços em Y-para-cima, (largura, altura))."""
    if isinstance(source, (bytes, bytearray)):
        root = ET.fromstring(bytes(source))
    elif isinstance(source, str) and source.lstrip().startswith("<"):
        root = ET.fromstring(source)
    else:
        root = ET.parse(source).getroot()

    view = _floats(root.get("viewBox", ""))
    if len(view) == 4:
        vx, vy, vw, vh = view
    else:
        vx, vy = 0.0, 0.0
        vw, vh = _length(root.get("width"), 300.0), _length(root.get("height"), 300.0)
    vw = vw or 300.0
    vh = vh or 300.0

    collected: list[tuple[np.ndarray, bool]] = []

    def walk(el, matrix):
        matrix = matrix @ _parse_transform(el.get("transform"))
        tag = el.tag.split("}")[-1]
        if tag == "path":
            for pts, closed in _parse_path_d(el.get("d", ""), tolerance):
                collected.append((_apply(matrix, pts), closed))
        else:
            for pts, closed in _shape_points(tag, el, tolerance):
                collected.append((_apply(matrix, pts), closed))
        for child in el:
            walk(child, matrix)

    walk(root, IDENTITY)

    paths = []
    for pts, closed in collected:
        if len(pts) < 2:
            continue
        out = np.stack([pts[:, 0] - vx, vh - (pts[:, 1] - vy)], axis=1)  # Y-para-cima
        paths.append(Path(out, closed=closed))
    return paths, (float(vw), float(vh))
