import numpy as np

from pengcode.core.optimize import (
    drop_short,
    join_paths,
    order_paths,
    simplify,
    simplify_points,
    tsp_points,
)
from pengcode.core.paths import Drawing, Path


def test_simplify_collapses_a_straight_line():
    line = np.stack([np.linspace(0, 10, 60), np.linspace(0, 10, 60)], axis=1)
    assert len(simplify_points(line, 0.01)) == 2


def test_simplify_keeps_a_real_corner():
    pts = np.array([[0, 0], [5, 0], [5, 5]], dtype=float)
    assert len(simplify_points(pts, 0.01)) == 3


def test_join_merges_touching_ends_and_reverses_when_needed():
    a = Path([[0, 0], [5, 0]])
    b = Path([[10, 0], [5.05, 0]])       # encosta pela ponta final
    merged = join_paths([a, b], epsilon=0.2)
    assert len(merged) == 1
    assert np.allclose(merged[0].points[-1], [10, 0])


def test_join_leaves_closed_paths_alone():
    loop = Path([[0, 0], [1, 0], [1, 1]], closed=True)
    out = join_paths([loop, Path([[0, 0], [0.05, 0.05]])], epsilon=0.5)
    assert sum(p.closed for p in out) == 1


def test_drop_short_removes_slivers():
    kept = drop_short([Path([[0, 0], [0.1, 0]]), Path([[0, 0], [5, 0]])], min_length=1.0)
    assert len(kept) == 1


def test_order_paths_cuts_travel_a_lot():
    rng = np.random.default_rng(7)
    paths = [Path(np.array([p, p + [1, 0]])) for p in rng.uniform(0, 100, (80, 2))]
    before = Drawing(paths).travel_length()
    after = Drawing(order_paths(paths, time_budget=1.0)).travel_length()
    assert after < before / 3


def test_order_paths_never_flips_a_closed_path():
    loops = [Path(np.array([[0, 0], [1, 0], [1, 1]]) + p, closed=True) for p in np.random.rand(12, 2) * 50]
    out = order_paths(loops, time_budget=0.5)
    assert len(out) == 12
    assert all(p.closed for p in out)
    for p in out:                                     # a geometria segue intacta
        assert any(np.allclose(sorted(p.points.tolist()), sorted(q.points.tolist())) for q in loops)


def test_order_paths_is_a_noop_for_a_single_path():
    only = [Path([[0, 0], [1, 1]])]
    assert order_paths(only)[0] is only[0]


def test_tsp_shortens_a_random_cloud():
    rng = np.random.default_rng(3)
    pts = rng.uniform(0, 100, (150, 2))
    length = lambda p: float(np.hypot(*np.diff(p, axis=0).T).sum())
    assert length(tsp_points(pts, time_budget=1.0)) < length(pts) / 4
