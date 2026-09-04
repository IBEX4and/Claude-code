import numpy as np
import pytest

from pengcode.core.paths import Drawing
from pengcode.core.raster import PreprocessParams, load_gray, preprocess, to_xy
from pengcode.core.vectorize import (
    parse_svg,
    trace_skeleton,
    vectorize_centerline,
    vectorize_contours,
    vectorize_edges,
    vectorize_hatch,
    vectorize_spiral,
    vectorize_stipple,
)


@pytest.fixture
def square():
    img = np.ones((80, 80), np.float32)
    img[20:60, 20:60] = 0.0
    return img


def test_to_xy_flips_the_row_axis():
    assert np.allclose(to_xy(np.array([[0, 5]]), 10), [[5, 9]])


def test_preprocess_stays_in_range_and_resizes():
    img = np.linspace(0, 1, 64 * 64, dtype=np.float32).reshape(64, 64)
    out = preprocess(img, PreprocessParams(max_dim=32, blur=0.5))
    assert out.shape == (32, 32) and 0.0 <= out.min() and out.max() <= 1.0


def test_transparent_png_is_composited_over_white(tmp_path):
    from PIL import Image

    p = tmp_path / "t.png"
    Image.new("RGBA", (8, 8), (0, 0, 0, 0)).save(p)
    assert load_gray(p).min() > 0.9      # transparente vira branco, não preto


def test_trace_skeleton_walks_a_line_and_a_loop():
    mask = np.zeros((20, 20), bool)
    mask[5, 2:15] = True
    assert len(trace_skeleton(mask)) == 1

    loop = np.zeros((20, 20), bool)
    loop[5, 5:15] = loop[14, 5:15] = True
    loop[5:15, 5] = loop[5:15, 14] = True
    traced = trace_skeleton(loop)
    assert len(traced) >= 1 and sum(len(t) for t in traced) > 30


def test_every_raster_mode_produces_geometry(square):
    assert len(vectorize_edges(square)) > 0
    assert len(vectorize_contours(square, levels=3)) > 0
    assert len(vectorize_hatch(square, spacing=3.0)) > 0
    assert len(vectorize_spiral(square, pitch=6.0)) > 0
    assert len(vectorize_stipple(square, n_points=200, iterations=4, time_budget=0.5)) > 0


def test_centerline_reduces_a_thick_stroke_to_one_line():
    img = np.ones((80, 80), np.float32)
    img[36:44, 10:70] = 0.0                      # traço grosso na horizontal
    paths = vectorize_centerline(img)
    assert len(paths) == 1
    assert paths[0].length() > 40                # virou uma linha, não um contorno


def test_edges_uses_quantiles_so_a_soft_image_still_yields_lines():
    yy, xx = np.mgrid[0:120, 0:120]
    soft = np.clip(0.5 + 0.08 * np.cos(xx / 20.0) * np.sin(yy / 15.0), 0, 1).astype(np.float32)
    assert len(vectorize_edges(soft)) > 0   # limiar absoluto devolveria zero aqui


def test_stipple_tsp_is_one_continuous_path(square):
    paths = vectorize_stipple(square, n_points=250, iterations=4, mode="tsp", time_budget=0.5)
    assert len(paths) == 1 and len(paths[0]) > 200


def test_stipple_dots_are_closed_rings(square):
    dots = vectorize_stipple(square, n_points=60, iterations=3, mode="dots")
    assert len(dots) > 0 and all(d.closed for d in dots)


def test_hatch_gets_denser_in_darker_areas():
    img = np.ones((120, 120), np.float32)
    img[:, 60:] = 0.1
    total = lambda ps: sum(p.length() for p in ps)
    left = total([p for p in vectorize_hatch(img, spacing=3.0) if p.bounds()[2] < 60])
    right = total([p for p in vectorize_hatch(img, spacing=3.0) if p.bounds()[0] > 60])
    assert right > left * 3


def test_blank_image_yields_nothing():
    blank = np.ones((60, 60), np.float32)
    assert vectorize_centerline(blank) == []
    assert vectorize_stipple(blank, n_points=100) == []


SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect x="10" y="10" width="30" height="20"/>
  <circle cx="70" cy="30" r="15"/>
  <path d="M 10 60 L 40 60 C 50 60 50 90 40 90 Z"/>
  <path d="M50 60 A 20 20 0 0 1 90 60"/>
  <g transform="translate(5,5) scale(0.5)"><line x1="0" y1="0" x2="20" y2="20"/></g>
</svg>"""


def test_svg_reads_shapes_paths_arcs_and_groups():
    paths, size = parse_svg(SVG)
    assert size == (100.0, 100.0)
    assert len(paths) == 5
    assert sum(p.closed for p in paths) == 3


def test_svg_y_axis_is_flipped_to_match_the_machine():
    paths, _ = parse_svg(SVG)
    rect = next(p for p in paths if len(p) == 4)
    assert rect.bounds() == (10.0, 70.0, 40.0, 90.0)   # y svg 10..30 -> 70..90


def test_svg_group_transform_is_applied():
    paths, _ = parse_svg(SVG)
    seg = next(p for p in paths if len(p) == 2)
    assert np.allclose(seg.points[0], [5, 95])         # translate(5,5) e depois o flip


def test_svg_curve_is_flattened_into_many_points():
    paths, _ = parse_svg(SVG)
    curved = next(p for p in paths if p.closed and 10 < len(p) < 200)
    assert len(curved) > 10


def test_svg_bounds_are_finite():
    paths, _ = parse_svg(SVG)
    assert np.isfinite(Drawing(paths).bounds()).all()
