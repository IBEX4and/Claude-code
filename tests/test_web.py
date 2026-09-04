import pytest

fastapi = pytest.importorskip("fastapi")
from fastapi.testclient import TestClient

from pengcode.web.app import create_app


@pytest.fixture
def client():
    return TestClient(create_app())


@pytest.fixture
def uploaded(client, line_art):
    r = client.post("/api/upload", files={"file": ("t.png", line_art, "image/png")})
    return r.json()["image_id"]


def test_index_and_assets_are_served(client):
    assert client.get("/").status_code == 200
    for asset in ("app.js", "app.css", "favicon.svg"):
        assert client.get(f"/static/{asset}").status_code == 200


def test_config_lists_everything_the_ui_needs(client):
    cfg = client.get("/api/config").json()
    assert set(cfg) >= {"profile", "papers", "modes", "mode_order", "patterns", "defaults"}
    for mode in cfg["mode_order"]:
        assert "label" in cfg["modes"][mode]


def test_upload_rejects_an_empty_file(client):
    assert client.post("/api/upload", files={"file": ("v.png", b"", "image/png")}).status_code == 400


def test_generate_returns_geometry_and_stats(client, uploaded):
    r = client.post("/api/generate", json={"image_id": uploaded, "params": {"mode": "edges", "max_dim": 250}}).json()
    assert r["paths"] and all(len(p["p"]) >= 2 for p in r["paths"])
    assert r["stats"]["paths"] == len(r["paths"])
    assert set(r["geometry"]) == {"bed", "reachable", "paper", "box"}


def test_profile_overrides_merge_deeply(client, uploaded):
    """A interface manda só o que mudou; o resto do perfil tem que sobreviver."""
    r = client.post(
        "/api/generate",
        json={"image_id": uploaded, "params": {"mode": "edges", "max_dim": 200},
              "profile": {"_paper": "A6", "z": {"down": 1.7}}},
    ).json()
    gcode = client.get(f"/api/gcode/{r['id']}").text
    assert "Z1.7" in gcode          # o que mudou foi aplicado
    assert "Z25" in gcode           # z.safe, que não foi enviado, continua lá


def test_pen_offset_override_changes_the_reachable_area(client, uploaded):
    r = client.post(
        "/api/generate",
        json={"image_id": uploaded, "params": {"mode": "edges", "max_dim": 200},
              "profile": {"pen_offset": {"y": -10}}},
    ).json()
    assert r["geometry"]["reachable"][3] == pytest.approx(246.0)


def test_calibration_pattern_needs_no_image(client):
    r = client.post("/api/generate", json={"pattern": "frame"}).json()
    assert r["stats"]["paths"] > 0 and r["name"] == "calib_frame"


def test_gcode_download_is_an_attachment_without_extrusion(client, uploaded):
    r = client.post("/api/generate", json={"image_id": uploaded, "params": {"mode": "edges", "max_dim": 200}}).json()
    g = client.get(f"/api/gcode/{r['id']}")
    assert g.status_code == 200
    assert "attachment" in g.headers["content-disposition"]
    assert "G28" in g.text and "M104" not in g.text


def test_missing_image_and_expired_result_report_clearly(client):
    assert client.post("/api/generate", json={"image_id": "xxx"}).status_code == 404
    assert client.get("/api/gcode/xxx").status_code == 404


def test_unknown_pattern_is_rejected(client):
    assert client.post("/api/generate", json={"pattern": "nao_existe"}).status_code == 400


def test_bad_parameters_return_422_not_a_crash(client, uploaded):
    r = client.post("/api/generate", json={"image_id": uploaded, "params": {"mode": "nao_existe"}})
    assert r.status_code == 422
