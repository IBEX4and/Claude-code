import pytest

from pengcode.calibrate import HINTS, PATTERNS, build
from pengcode.core.text import GLYPHS, text_paths, text_width
from pengcode.gcode import emit_gcode


@pytest.mark.parametrize("name", sorted(PATTERNS))
def test_pattern_fits_inside_the_drawable_box(name, profile):
    d = build(name, profile)
    x, y, w, h = profile.content_box()
    x0, y0, x1, y1 = d.bounds()
    assert x0 >= x - 1e-6 and y0 >= y - 1e-6
    assert x1 <= x + w + 1e-6 and y1 <= y + h + 1e-6


@pytest.mark.parametrize("name", sorted(PATTERNS))
def test_pattern_emits_without_clamping(name, profile):
    result = emit_gcode(build(name, profile), profile)
    assert result.stats["clamped_points"] == 0
    assert result.stats["paths"] > 0
    assert name in HINTS


def test_zladder_varies_z_and_respects_the_hard_limits(profile):
    d = build("zladder", profile, z_from=3.0, z_to=-5.0, steps=6)
    zs = {p.pen_z for p in d.paths if p.pen_z is not None}
    assert len(zs) > 1
    assert min(zs) >= profile.z.min and max(zs) <= profile.z.max


def test_speed_grid_varies_feed_and_accel(profile):
    d = build("speed", profile)
    assert len({p.feed for p in d.paths if p.feed}) == 4
    assert len({p.accel for p in d.paths if p.accel}) == 4


def test_unknown_pattern_raises(profile):
    with pytest.raises(KeyError):
        build("nao_existe", profile)


def test_font_covers_digits_and_uppercase():
    for char in "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ":
        assert char in GLYPHS


def test_text_is_placed_at_the_requested_baseline():
    paths = text_paths("Z1.4", x=10, y=20, height=5)
    xs = [p.bounds() for p in paths]
    assert min(b[0] for b in xs) >= 10 - 1e-9
    assert min(b[1] for b in xs) >= 20 - 1e-9
    assert max(b[3] for b in xs) <= 20 + 5 + 1e-9


def test_text_width_grows_with_the_string():
    assert text_width("AB", 4) > text_width("A", 4) > 0


def test_unknown_characters_are_skipped_not_crashed():
    assert text_paths("→§", 0, 0) == []
