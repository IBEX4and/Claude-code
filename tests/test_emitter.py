import re

import pytest

from pengcode.core.paths import Drawing, Path
from pengcode.gcode import emit_gcode, estimate_time, format_duration


def _moves(gcode):
    """Só os movimentos gerados pelo desenho — sem o start/end do perfil."""
    body = gcode.split(":: fim")[0].split("----------------------------------------")[-1]
    return [l for l in body.splitlines() if l.startswith("G1")]


def test_never_extrudes_and_never_heats(profile):
    d = Drawing([Path([[70, 20], [180, 20]]), Path([[70, 30], [180, 30]], closed=False)])
    g = emit_gcode(d, profile).gcode
    assert not re.search(r"\bE-?\d", g)
    for forbidden in ("M104", "M109", "M140", "M190", "M106 P0 S255"):
        assert forbidden not in g


def test_pen_offset_is_applied_to_every_move(profile):
    profile.pen_offset.x, profile.pen_offset.y = 3.0, -35.0
    g = emit_gcode(Drawing([Path([[100, 100], [110, 100]])]), profile).gcode
    assert "X97 Y135" in g          # 100-3, 100-(-35)
    assert "X107 Y135" in g


def test_points_outside_the_machine_are_clamped_and_reported(profile):
    far = Drawing([Path([[-500, -500], [900, 900]])])
    result = emit_gcode(far, profile)
    assert result.stats["clamped_points"] == 2
    assert any("fora do curso" in w for w in result.warnings)
    for line in _moves(result.gcode):
        for axis, limit in (("X", profile.bed.x), ("Y", profile.bed.y)):
            m = re.search(rf"{axis}(-?[\d.]+)", line)
            if m:
                assert -1e-6 <= float(m.group(1)) <= limit + 1e-6


def test_z_goes_up_between_paths_and_down_to_draw(profile):
    g = emit_gcode(Drawing([Path([[70, 20], [80, 20]]), Path([[70, 40], [80, 40]])]), profile).gcode
    zs = [float(re.search(r"Z([\d.]+)", l).group(1)) for l in _moves(g) if " Z" in f" {l}"]
    assert profile.z.up in zs and profile.z.down in zs
    assert zs.count(profile.z.down) == 2       # uma descida por traço


def test_per_path_overrides_reach_the_output(profile):
    d = Drawing([Path([[70, 20], [80, 20]], pen_z=1.45, feed=1234, accel=777)])
    g = emit_gcode(d, profile).gcode
    assert "Z1.45" in g and "F1234" in g and "M204 S777" in g


def test_redundant_feed_is_not_repeated(profile):
    """F só reaparece quando muda de verdade — 6 pontos, não 5 repetições."""
    profile.feeds.draw = 1800          # diferente de z.feed, para forçar a troca
    g = emit_gcode(Drawing([Path([[70 + i, 20] for i in range(6)])]), profile).gcode
    xy_moves = [l for l in _moves(g) if " Z" not in f" {l}"]
    assert len(xy_moves) == 6                       # 1 viagem + 5 traços
    assert sum("F" in l for l in xy_moves) == 2     # uma para viagem, uma para desenho


def test_closed_path_returns_to_its_first_point(profile):
    square = Path([[70, 20], [90, 20], [90, 40], [70, 40]], closed=True)
    moves = [l for l in _moves(emit_gcode(Drawing([square]), profile).gcode) if "Z" not in l]
    assert moves[0].split()[1:3] == moves[-1].split()[1:3]   # viagem inicial e fechamento


def test_estimate_grows_with_length(profile):
    short = Drawing([Path([[70, 20], [80, 20]])])
    long = Drawing([Path([[70, 20], [180, 20]])])
    assert estimate_time(long, profile) > estimate_time(short, profile)


def test_empty_drawing_still_emits_a_valid_program(profile):
    result = emit_gcode(Drawing([]), profile)
    assert "G28" in result.gcode and result.stats["paths"] == 0


def test_bad_template_placeholder_degrades_gracefully(profile):
    profile.start_gcode = "G1 X{nao_existe}"
    result = emit_gcode(Drawing([]), profile)
    assert "G1 X{nao_existe}" in result.gcode
    assert any("placeholder" in w for w in result.warnings)


@pytest.mark.parametrize("seconds,text", [(0, "0m00s"), (75, "1m15s"), (3725, "1h02m05s")])
def test_duration_formatting(seconds, text):
    assert format_duration(seconds) == text
