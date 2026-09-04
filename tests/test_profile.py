import pytest

from pengcode.machine.profile import (
    PAPER_PRESETS,
    Profile,
    apply_paper,
    list_profiles,
    load_profile,
)


def test_default_profile_is_self_consistent(profile):
    assert profile.check() == []
    assert "bambu_a1" in list_profiles()


def test_pen_offset_shrinks_the_reachable_area(profile):
    profile.pen_offset.y = -35.0
    x0, y0, x1, y1 = profile.reachable_rect()
    assert (x1 - x0) == profile.bed.x            # X intacto
    assert (y1 - y0) == profile.bed.y - 35.0     # Y perde exatamente o offset


def test_positive_offset_shifts_the_reachable_area_the_other_way(profile):
    profile.pen_offset.x = 20.0
    x0, _, x1, _ = profile.reachable_rect()
    assert (x0, x1) == (20.0, profile.bed.x)


def test_a4_does_not_fit_with_a_large_pen_offset(profile):
    """Achado real: 35 mm de offset deixam 221 mm em Y, e A4 tem 297."""
    apply_paper(profile, "A4")
    assert any("alcançável" in w for w in profile.check())


def test_a5_fits(profile):
    apply_paper(profile, "A5")
    assert profile.check() == []
    assert profile.content_box()[2] > 100


def test_content_box_is_clipped_by_reach(profile):
    apply_paper(profile, "A4")
    x, y, w, h = profile.content_box()
    rx0, ry0, rx1, ry1 = profile.reachable_rect()
    assert x >= rx0 and y >= ry0 and x + w <= rx1 + 1e-9 and y + h <= ry1 + 1e-9


def test_check_catches_an_inverted_pen(profile):
    profile.z.down, profile.z.up = 5.0, 1.0
    assert any("nunca levanta" in w for w in profile.check())


def test_check_catches_z_outside_the_hard_limits(profile):
    profile.z.down = 999.0
    assert any("fora dos limites" in w for w in profile.check())


def test_roundtrip_through_dict(profile):
    clone = Profile.from_dict(profile.to_dict())
    assert clone.to_dict() == profile.to_dict()


def test_partial_dict_keeps_the_defaults():
    p = Profile.from_dict({"accel": 900})
    assert p.accel == 900 and p.bed.x == 256.0


def test_unknown_paper_and_profile_raise():
    with pytest.raises(KeyError):
        apply_paper(load_profile(), "A0")
    with pytest.raises(FileNotFoundError):
        load_profile("nao_existe")


@pytest.mark.parametrize("preset", sorted(PAPER_PRESETS))
def test_every_preset_centres_within_reach(preset, profile):
    apply_paper(profile, preset)
    px0, py0, px1, py1 = profile.paper_rect()
    rx0, ry0, rx1, ry1 = profile.reachable_rect()
    assert abs((px0 + px1) / 2 - (rx0 + rx1) / 2) < 1e-6
    assert abs((py0 + py1) / 2 - (ry0 + ry1) / 2) < 1e-6
