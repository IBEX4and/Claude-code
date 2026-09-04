"""Pré-visualização em SVG: o desenho, as viagens e o contexto da máquina.

Ver a ordem dos deslocamentos em vermelho antes de plotar é o jeito mais
barato de descobrir que a otimização não fez o que você esperava.
"""

from __future__ import annotations

from xml.sax.saxutils import escape

from .core.paths import Drawing
from .machine.profile import Profile


def _points(points, height: float) -> str:
    return " ".join(f"{x:.2f},{height - y:.2f}" for x, y in points)


def to_svg(
    drawing: Drawing,
    profile: Profile,
    show_travel: bool = True,
    show_context: bool = True,
    px_per_mm: float = 3.0,
    stroke: float = 0.35,
    title: str = "",
) -> str:
    """Renderiza o desenho já posicionado em milímetros de mesa."""
    bw, bh = profile.bed.x, profile.bed.y
    w_px, h_px = bw * px_per_mm, bh * px_per_mm
    out = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{w_px:.0f}" height="{h_px:.0f}" '
        f'viewBox="0 0 {bw:.2f} {bh:.2f}">',
        f"<title>{escape(title or 'pengcode')}</title>",
        f'<rect x="0" y="0" width="{bw:.2f}" height="{bh:.2f}" fill="#e9e9ec"/>',
    ]

    if show_context:
        rx0, ry0, rx1, ry1 = profile.reachable_rect()
        px0, py0, px1, py1 = profile.paper_rect()
        cx, cy, cw, ch = profile.content_box()
        out.append(
            f'<rect x="{rx0:.2f}" y="{bh - ry1:.2f}" width="{rx1 - rx0:.2f}" height="{ry1 - ry0:.2f}" '
            f'fill="none" stroke="#9aa0aa" stroke-width="0.6" stroke-dasharray="3 2"/>'
        )
        out.append(
            f'<rect x="{px0:.2f}" y="{bh - py1:.2f}" width="{px1 - px0:.2f}" height="{py1 - py0:.2f}" '
            f'fill="#ffffff" stroke="#c2c6cf" stroke-width="0.5"/>'
        )
        out.append(
            f'<rect x="{cx:.2f}" y="{bh - (cy + ch):.2f}" width="{cw:.2f}" height="{ch:.2f}" '
            f'fill="none" stroke="#c9ccd4" stroke-width="0.4" stroke-dasharray="2 2"/>'
        )

    if show_travel:
        segs = []
        cur = (profile.content_box()[0], profile.content_box()[1])
        for p in drawing.paths:
            if len(p) < 2:
                continue
            segs.append(f"M{cur[0]:.2f},{bh - cur[1]:.2f} L{p.start[0]:.2f},{bh - p.start[1]:.2f}")
            cur = tuple(p.points[0] if p.closed else p.end)
        if segs:
            out.append(
                f'<path d="{" ".join(segs)}" fill="none" stroke="#e2483c" stroke-width="{stroke * 0.5:.3f}" '
                f'stroke-opacity="0.55" stroke-dasharray="1 1"/>'
            )

    out.append(f'<g fill="none" stroke="#101014" stroke-width="{stroke:.3f}" '
               'stroke-linecap="round" stroke-linejoin="round">')
    for p in drawing.paths:
        if len(p) < 2:
            continue
        tag = "polygon" if p.closed else "polyline"
        out.append(f'<{tag} points="{_points(p.points, bh)}"/>')
    out.append("</g></svg>")
    return "\n".join(out)


def save_svg(path, drawing: Drawing, profile: Profile, **kwargs) -> None:
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(to_svg(drawing, profile, **kwargs))
