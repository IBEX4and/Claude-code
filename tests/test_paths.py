import numpy as np

from pengcode.core.paths import Drawing, Path, polyline_length


def test_length_and_bounds():
    p = Path([[0, 0], [3, 4]])
    assert p.length() == 5.0
    assert p.bounds() == (0.0, 0.0, 3.0, 4.0)


def test_closed_path_counts_the_closing_segment():
    square = Path([[0, 0], [1, 0], [1, 1], [0, 1]], closed=True)
    assert square.length() == 4.0
    assert Path(square.points, closed=False).length() == 3.0


def test_reverse_preserves_overrides():
    p = Path([[0, 0], [1, 1]], pen_z=1.3, feed=900, accel=700)
    r = p.reversed()
    assert (r.pen_z, r.feed, r.accel) == (1.3, 900, 700)
    assert np.allclose(r.points[0], [1, 1])


def test_travel_length_follows_path_order():
    d = Drawing([Path([[0, 0], [1, 0]]), Path([[10, 0], [11, 0]])])
    assert d.travel_length(start=(0, 0)) == 9.0     # 0->0 e 1->10
    assert d.point_count() == 4


def test_closed_path_returns_to_its_start():
    d = Drawing([Path([[0, 0], [5, 0], [5, 5]], closed=True), Path([[0, 0], [1, 0]])])
    assert d.travel_length(start=(0, 0)) == 0.0     # o laço volta à origem


def test_polyline_length_of_degenerate_input():
    assert polyline_length(np.zeros((0, 2))) == 0.0
    assert polyline_length([[1, 1]]) == 0.0
