import pytest

from pengcode.machine.profile import apply_paper, load_profile
from pengcode.pipeline import MODES, Params, generate, px_per_mm, vectorize

RASTER_MODES = [m for m in MODES if m != "svg"]


@pytest.mark.parametrize("mode", RASTER_MODES)
def test_every_mode_runs_end_to_end(mode, line_art, profile):
    r = generate(line_art, Params(mode=mode, max_dim=300, time_budget=0.4), profile)
    assert r.stats["paths"] > 0
    assert r.stats["clamped_points"] == 0
    assert r.gcode.startswith(";")
    assert "G28" in r.gcode


@pytest.mark.parametrize("mode", RASTER_MODES)
def test_output_stays_inside_the_drawable_box(mode, gray_field, profile):
    r = generate(gray_field, Params(mode=mode, max_dim=250, time_budget=0.4), profile)
    x, y, w, h = profile.content_box()
    x0, y0, x1, y1 = r.drawing.bounds()
    assert x0 >= x - 1e-6 and y0 >= y - 1e-6 and x1 <= x + w + 1e-6 and y1 <= y + h + 1e-6


def test_density_params_are_millimetres_not_pixels(gray_field, profile):
    """O mesmo espaçamento em mm deve dar o mesmo traçado em resoluções diferentes."""
    a = generate(gray_field, Params(mode="hatch", hatch_spacing=1.5, max_dim=200, time_budget=0.3), profile)
    b = generate(gray_field, Params(mode="hatch", hatch_spacing=1.5, max_dim=400, time_budget=0.3), profile)
    assert abs(a.stats["draw_mm"] - b.stats["draw_mm"]) / a.stats["draw_mm"] < 0.20


def test_finer_spacing_draws_more(gray_field, profile):
    coarse = generate(gray_field, Params(mode="hatch", hatch_spacing=3.0, max_dim=250, time_budget=0.3), profile)
    fine = generate(gray_field, Params(mode="hatch", hatch_spacing=1.0, max_dim=250, time_budget=0.3), profile)
    assert fine.stats["draw_mm"] > coarse.stats["draw_mm"] * 2


def test_px_per_mm_follows_the_fit_mode(profile):
    box = profile.content_box()
    fit = px_per_mm((600, 600), box, Params(fit="fit"))
    fill = px_per_mm((600, 600), box, Params(fit="fill"))
    assert fit > fill      # "caber" escala menos, então cada mm leva mais pixels


def test_reordering_shortens_travel(line_art, profile):
    on = generate(line_art, Params(mode="hatch", hatch_spacing=1.2, max_dim=300, reorder=True, time_budget=1.0), profile)
    off = generate(line_art, Params(mode="hatch", hatch_spacing=1.2, max_dim=300, reorder=False), profile)
    assert on.stats["travel_mm"] < off.stats["travel_mm"]


def test_svg_input_is_detected_from_content(profile):
    svg = b'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="6" height="4"/></svg>'
    r = generate(svg, Params(), profile, filename="desenho.svg")
    assert r.drawing.meta["mode"] == "svg" and r.stats["paths"] == 1


def test_rotation_changes_the_aspect_of_the_result(line_art, profile):
    apply_paper(profile, "quadrado_150")
    up = generate(line_art, Params(mode="edges", max_dim=250, rotate=0, time_budget=0.3), profile).drawing.bounds()
    side = generate(line_art, Params(mode="edges", max_dim=250, rotate=90, time_budget=0.3), profile).drawing.bounds()
    assert abs((up[2] - up[0]) - (side[3] - side[1])) < 2.0    # girou, não deformou


def test_params_from_dict_is_lenient_about_types():
    p = Params.from_dict({"mode": "hatch", "invert": "true", "levels": "8", "blur": "1.5", "lixo": 1, "gamma": None})
    assert (p.mode, p.invert, p.levels, p.blur, p.gamma) == ("hatch", True, 8, 1.5, 1.0)


def test_unknown_mode_is_rejected(line_art, profile):
    with pytest.raises(ValueError, match="modo desconhecido"):
        vectorize(line_art, Params(mode="inexistente"), profile)


def test_a_drawable_box_of_zero_yields_nothing(line_art):
    profile = load_profile()
    profile.paper.margin = 500.0
    r = generate(line_art, Params(mode="edges", max_dim=200), profile)
    assert r.stats["paths"] == 0
