import numpy as np

from pengcode.core.paths import Drawing, Path
from pengcode.core.transform import clip_rect, fit_to_box, rotate


def test_fit_keeps_aspect_and_centres():
    d = Drawing([Path([[0, 0], [100, 0], [100, 50], [0, 50]], closed=True)], size=(100, 50))
    x0, y0, x1, y1 = fit_to_box(d, (0, 0, 200, 200)).bounds()
    assert (x1 - x0, y1 - y0) == (200.0, 100.0)      # escala 2x, proporção mantida
    assert y0 == 50.0                                 # centrado na vertical


def test_stretch_fills_the_box_exactly():
    d = Drawing([Path([[0, 0], [10, 0], [10, 10], [0, 10]], closed=True)], size=(10, 10))
    b = fit_to_box(d, (5, 5, 40, 20), mode="stretch").bounds()
    assert np.allclose(b, (5, 5, 45, 25))


def test_fill_covers_the_box():
    d = Drawing([Path([[0, 0], [10, 0], [10, 10], [0, 10]], closed=True)], size=(10, 10))
    x0, y0, x1, y1 = fit_to_box(d, (0, 0, 40, 20), mode="fill").bounds()
    assert (x1 - x0) >= 40 and (y1 - y0) >= 20


def test_rotation_is_applied_before_fitting():
    d = Drawing([Path([[0, 0], [10, 0]])], size=(10, 1))
    b = fit_to_box(d, (0, 0, 100, 100), rotate_deg=90).bounds()
    assert (b[3] - b[1]) > (b[2] - b[0])              # ficou vertical


def test_clip_splits_a_path_that_leaves_and_returns():
    p = Path([[-10, 10], [50, 10], [50, -5], [60, -5], [60, 20]])
    out = clip_rect(Drawing([p]), (0, 0, 100, 100))
    assert len(out.paths) == 2
    assert out.bounds()[0] >= 0 and out.bounds()[1] >= 0


def test_clip_keeps_an_inside_path_untouched_including_closure():
    loop = Path([[10, 10], [20, 10], [20, 20]], closed=True)
    out = clip_rect(Drawing([loop]), (0, 0, 100, 100))
    assert len(out.paths) == 1 and out.paths[0].closed


def test_clip_drops_what_is_fully_outside():
    assert len(clip_rect(Drawing([Path([[200, 200], [300, 300]])]), (0, 0, 100, 100)).paths) == 0


def test_rotate_about_a_centre():
    out = rotate([Path([[1, 0]])], 90, center=(0, 0))
    assert np.allclose(out[0].points[0], [0, 1], atol=1e-9)
