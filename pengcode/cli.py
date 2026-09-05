"""Interface de linha de comando do pengcode."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path as FsPath

from . import __version__
from .calibrate import HINTS, PATTERNS, build
from .gcode import emit_gcode
from .machine.profile import PAPER_PRESETS, apply_paper, list_profiles, load_profile
from .pipeline import MODE_INFO, MODES, Params, generate
from .preview import save_svg


def _profile_from_args(args):
    profile = load_profile(getattr(args, "profile", None))
    if getattr(args, "paper", None):
        apply_paper(profile, args.paper, landscape=getattr(args, "landscape", False))
    for name in ("pen_offset_x", "pen_offset_y"):
        value = getattr(args, name, None)
        if value is not None:
            setattr(profile.pen_offset, name.split("_")[-1], value)
    if getattr(args, "z_down", None) is not None:
        profile.z.down = args.z_down
    if getattr(args, "z_up", None) is not None:
        profile.z.up = args.z_up
    if getattr(args, "accel", None) is not None:
        profile.accel = args.accel
    if getattr(args, "feed_draw", None) is not None:
        profile.feeds.draw = args.feed_draw
    return profile


def _report(stats: dict, warnings: list[str], out: FsPath | None, preview: FsPath | None) -> None:
    print(f"  traços     {stats['paths']}   pontos {stats['points']}")
    print(f"  desenhando {stats['draw_mm']:.0f} mm   viagem {stats['travel_mm']:.0f} mm")
    print(f"  tempo      ~{stats['duration']}")
    if out:
        print(f"  g-code     {out}")
    if preview:
        print(f"  preview    {preview}")
    for w in warnings:
        print(f"  AVISO: {w}", file=sys.stderr)


def cmd_plot(args) -> int:
    profile = _profile_from_args(args)
    params = Params.from_dict({k: v for k, v in vars(args).items() if v is not None})
    source = FsPath(args.image)
    if not source.exists():
        print(f"arquivo não encontrado: {source}", file=sys.stderr)
        return 2

    result = generate(source.read_bytes(), params, profile, filename=source.name, title=source.stem)
    out = FsPath(args.output) if args.output else source.with_suffix(".gcode")
    result.emit.save(out)

    preview = None
    if args.preview:
        preview = FsPath(args.preview if isinstance(args.preview, str) else out.with_suffix(".svg"))
        save_svg(preview, result.drawing, profile, title=source.stem)

    print(f"{source.name}  [modo {params.mode}]")
    _report(result.stats, result.warnings, out, preview)
    return 0


def cmd_preview(args) -> int:
    profile = _profile_from_args(args)
    params = Params.from_dict({k: v for k, v in vars(args).items() if v is not None})
    source = FsPath(args.image)
    result = generate(source.read_bytes(), params, profile, filename=source.name, title=source.stem)
    out = FsPath(args.output) if args.output else source.with_suffix(".svg")
    save_svg(out, result.drawing, profile, title=source.stem)
    print(f"{source.name}  [modo {params.mode}]")
    _report(result.stats, result.warnings, None, out)
    return 0


def cmd_calibrate(args) -> int:
    profile = _profile_from_args(args)
    kwargs = {}
    if args.pattern == "zladder":
        kwargs = {k: v for k, v in (("z_from", args.z_from), ("z_to", args.z_to), ("steps", args.steps)) if v is not None}
    drawing = build(args.pattern, profile, **kwargs)
    result = emit_gcode(drawing, profile, title=f"calibrate:{args.pattern}", notes=[HINTS[args.pattern]])
    out = FsPath(args.output) if args.output else FsPath(f"calib_{args.pattern}.gcode")
    result.save(out)

    preview = None
    if args.preview:
        preview = out.with_suffix(".svg")
        save_svg(preview, drawing, profile, title=args.pattern)

    print(f"{args.pattern}: {HINTS[args.pattern]}")
    _report(result.stats, result.warnings, out, preview)
    return 0


def cmd_info(args) -> int:
    profile = _profile_from_args(args)
    rx0, ry0, rx1, ry1 = profile.reachable_rect()
    cx, cy, cw, ch = profile.content_box()
    print(f"perfil     {profile.name}")
    print(f"mesa       {profile.bed.x:.0f} x {profile.bed.y:.0f} mm")
    print(f"offset     X{profile.pen_offset.x:+.1f} Y{profile.pen_offset.y:+.1f} mm")
    print(f"alcance    ({rx0:.0f}, {ry0:.0f}) a ({rx1:.0f}, {ry1:.0f}) mm")
    print(f"folha      {profile.paper.width:.0f} x {profile.paper.height:.0f} mm em ({profile.paper.x:.0f}, {profile.paper.y:.0f})")
    print(f"desenho    {cw:.0f} x {ch:.0f} mm a partir de ({cx:.0f}, {cy:.0f})")
    print(f"Z          desce {profile.z.down} / sobe {profile.z.up} / seguro {profile.z.safe} mm")
    print(f"avanços    desenho {profile.feeds.draw:.0f} / viagem {profile.feeds.travel:.0f} mm/min, accel {profile.accel:.0f} mm/s²")
    print()
    print(f"perfis     {', '.join(list_profiles())}")
    print(f"papéis     {', '.join(PAPER_PRESETS)}")
    print(f"modos      {', '.join(MODES)}")
    for w in profile.check():
        print(f"AVISO: {w}", file=sys.stderr)
    return 0


def _open_browser_soon(url: str, delay: float = 1.5) -> None:
    """Abre o navegador depois que o servidor subiu, sem travar se não houver um."""
    import threading
    import webbrowser

    def go():
        import time

        time.sleep(delay)
        try:
            webbrowser.open(url)
        except Exception:
            pass       # sem navegador (servidor, container): o endereço já foi impresso

    threading.Thread(target=go, daemon=True).start()


def cmd_web(args) -> int:
    try:
        import uvicorn
    except ImportError:
        print("interface web precisa dos extras: pip install 'pengcode[web]'", file=sys.stderr)
        return 2
    from .web.app import create_app

    url = f"http://{args.host}:{args.port}"
    print(f"pengcode em {url}")
    print("(feche esta janela ou aperte Ctrl+C para parar)")
    if not args.no_browser:
        _open_browser_soon(url)
    uvicorn.run(create_app(args.profile), host=args.host, port=args.port, log_level="warning")
    return 0


def _add_machine_args(p) -> None:
    g = p.add_argument_group("máquina")
    g.add_argument("--profile", help=f"perfil ou caminho .yaml (padrão: bambu_a1)")
    g.add_argument("--paper", choices=sorted(PAPER_PRESETS), help="formato da folha")
    g.add_argument("--landscape", action="store_true", help="folha deitada")
    g.add_argument("--pen-offset-x", type=float, dest="pen_offset_x", help="offset da caneta em X (mm)")
    g.add_argument("--pen-offset-y", type=float, dest="pen_offset_y", help="offset da caneta em Y (mm)")
    g.add_argument("--z-down", type=float, dest="z_down", help="altura de desenho (mm)")
    g.add_argument("--z-up", type=float, dest="z_up", help="altura de viagem (mm)")
    g.add_argument("--accel", type=float, help="aceleração (mm/s²)")
    g.add_argument("--feed-draw", type=float, dest="feed_draw", help="velocidade de desenho (mm/min)")


def _add_pipeline_args(p) -> None:
    g = p.add_argument_group("desenho")
    g.add_argument("--mode", choices=MODES, help="modo de vetorização")
    g.add_argument("--max-dim", type=int, dest="max_dim", help="maior lado da imagem em pixels")
    g.add_argument("--invert", action="store_true", default=None, help="inverte claro/escuro")
    g.add_argument("--brightness", type=float)
    g.add_argument("--contrast", type=float)
    g.add_argument("--gamma", type=float)
    g.add_argument("--blur", type=float)
    g.add_argument("--rotate", type=float, help="giro em graus")
    g.add_argument("--fit", choices=("fit", "fill", "stretch"))

    m = p.add_argument_group("parâmetros do modo")
    for name, info in MODE_INFO.items():
        for param in info["params"]:
            flag = "--" + param.replace("_", "-")
            kind = float if param not in ("levels", "hatch_levels", "stipple_points", "stipple_iterations") else int
            if param == "stipple_style":
                m.add_argument(flag, dest=param, choices=("tsp", "dots"), help=f"[{name}]")
            else:
                m.add_argument(flag, dest=param, type=kind, help=f"[{name}]")

    o = p.add_argument_group("otimização")
    o.add_argument("--simplify", type=float, help="tolerância de simplificação (mm)")
    o.add_argument("--join", type=float, help="distância para emendar traços (mm)")
    o.add_argument("--min-length", type=float, dest="min_length", help="descarta traços menores (mm)")
    o.add_argument("--no-reorder", action="store_false", dest="reorder", default=None,
                   help="não reordena os traços (mantém a ordem do vetorizador)")
    o.add_argument("--time-budget", type=float, dest="time_budget", help="segundos para o refino da ordem")


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="pengcode",
        description="Gera G-code de desenho a caneta a partir de imagens (Bambu Lab A1 e afins).",
    )
    p.add_argument("--version", action="version", version=f"pengcode {__version__}")
    sub = p.add_subparsers(dest="command", required=True)

    plot = sub.add_parser("plot", help="imagem -> G-code")
    plot.add_argument("image", help="PNG, JPG, SVG...")
    plot.add_argument("-o", "--output", help="arquivo .gcode de saída")
    plot.add_argument("--preview", nargs="?", const=True, help="também salva um preview SVG")
    _add_machine_args(plot)
    _add_pipeline_args(plot)
    plot.set_defaults(func=cmd_plot)

    prev = sub.add_parser("preview", help="imagem -> SVG de conferência, sem gerar G-code")
    prev.add_argument("image")
    prev.add_argument("-o", "--output")
    _add_machine_args(prev)
    _add_pipeline_args(prev)
    prev.set_defaults(func=cmd_preview)

    cal = sub.add_parser("calibrate", help="gera um padrão de calibração")
    cal.add_argument("pattern", choices=sorted(PATTERNS), help="; ".join(f"{k}: {v}" for k, v in HINTS.items()))
    cal.add_argument("-o", "--output")
    cal.add_argument("--preview", action="store_true")
    cal.add_argument("--z-from", type=float, dest="z_from", help="[zladder] Z inicial")
    cal.add_argument("--z-to", type=float, dest="z_to", help="[zladder] Z final")
    cal.add_argument("--steps", type=int, help="[zladder] número de degraus")
    _add_machine_args(cal)
    cal.set_defaults(func=cmd_calibrate)

    info = sub.add_parser("info", help="mostra a geometria efetiva do perfil")
    _add_machine_args(info)
    info.set_defaults(func=cmd_info)

    web = sub.add_parser("web", help="abre a interface com viewport de preview")
    web.add_argument("--host", default="127.0.0.1")
    web.add_argument("--port", type=int, default=8000)
    web.add_argument("--profile")
    web.add_argument("--no-browser", action="store_true", help="não abre o navegador sozinho")
    web.set_defaults(func=cmd_web)

    return p


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
