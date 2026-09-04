from pathlib import Path

import pytest

from pengcode.cli import main


@pytest.fixture
def image(tmp_path, line_art):
    p = tmp_path / "entrada.png"
    p.write_bytes(line_art)
    return p


def test_info_prints_the_effective_geometry(capsys):
    assert main(["info"]) == 0
    out = capsys.readouterr().out
    assert "alcance" in out and "desenho" in out


def test_plot_writes_gcode_and_preview(image, tmp_path, capsys):
    out = tmp_path / "saida.gcode"
    assert main(["plot", str(image), "-o", str(out), "--mode", "edges", "--max-dim", "250",
                 "--preview", str(tmp_path / "p.svg")]) == 0
    assert "G28" in out.read_text()
    assert (tmp_path / "p.svg").read_text().startswith("<svg")


def test_plot_defaults_the_output_next_to_the_input(image):
    assert main(["plot", str(image), "--mode", "centerline", "--max-dim", "200"]) == 0
    assert image.with_suffix(".gcode").exists()


def test_machine_flags_reach_the_gcode(image, tmp_path):
    out = tmp_path / "s.gcode"
    main(["plot", str(image), "-o", str(out), "--mode", "edges", "--max-dim", "200",
          "--paper", "A6", "--z-down", "1.6", "--accel", "900", "--pen-offset-y", "-20"])
    text = out.read_text()
    assert "Z1.6" in text and "M204 S900" in text


def test_missing_file_exits_with_an_error(tmp_path, capsys):
    assert main(["plot", str(tmp_path / "nao_existe.png")]) == 2
    assert "não encontrado" in capsys.readouterr().err


def test_calibrate_writes_a_pattern(tmp_path):
    out = tmp_path / "c.gcode"
    assert main(["calibrate", "zladder", "-o", str(out), "--steps", "5"]) == 0
    assert out.read_text().count("Z") > 5


def test_preview_command_writes_only_svg(image, tmp_path):
    out = tmp_path / "v.svg"
    assert main(["preview", str(image), "-o", str(out), "--mode", "edges", "--max-dim", "200"]) == 0
    assert out.exists() and not out.with_suffix(".gcode").exists()
