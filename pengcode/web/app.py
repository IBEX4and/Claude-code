"""Servidor da interface.

A imagem é enviada uma vez e fica em memória; cada mexida num controle refaz
só o pipeline. É o que permite mexer num slider e ver o traçado mudar sem
esperar upload a cada vez.
"""

from __future__ import annotations

import uuid
from collections import OrderedDict
from pathlib import Path as FsPath

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import FileResponse, JSONResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from .. import __version__
from ..calibrate import HINTS, PATTERNS, build
from ..core.paths import Drawing
from ..gcode import emit_gcode
from ..machine.profile import (
    PAPER_PRESETS,
    Profile,
    apply_paper,
    list_profiles,
    load_profile,
)
from ..pipeline import MODE_INFO, MODES, Params, generate

STATIC = FsPath(__file__).parent / "static"
MAX_UPLOAD = 24 * 1024 * 1024
CACHE_SIZE = 24


class _Cache(OrderedDict):
    """Dicionário com teto — evita que a memória cresça sem limite."""

    def put(self, key, value):
        self[key] = value
        while len(self) > CACHE_SIZE:
            self.popitem(last=False)


class GenerateRequest(BaseModel):
    image_id: str | None = None
    pattern: str | None = None
    params: dict = {}
    profile: dict = {}


def _serialize(drawing: Drawing) -> list[dict]:
    return [
        {"p": [[round(float(x), 2), round(float(y), 2)] for x, y in path.points], "c": bool(path.closed)}
        for path in drawing.paths
        if len(path) >= 2
    ]


def _deep_merge(base: dict, patch: dict) -> dict:
    """Mescla recursiva: a interface manda só o que mudou, não o perfil inteiro."""
    out = dict(base)
    for key, value in patch.items():
        if key.startswith("_"):
            continue
        if isinstance(value, dict) and isinstance(out.get(key), dict):
            out[key] = _deep_merge(out[key], value)
        else:
            out[key] = value
    return out


def _profile_from(payload: dict, fallback: str | None) -> Profile:
    if not payload:
        return load_profile(fallback)
    base = payload.get("_base") or fallback
    profile = Profile.from_dict(_deep_merge(load_profile(base).to_dict(), payload))
    preset = payload.get("_paper")
    if preset in PAPER_PRESETS:
        apply_paper(profile, preset, landscape=bool(payload.get("_landscape")), center=bool(payload.get("_center", True)))
    return profile


def create_app(profile_name: str | None = None) -> FastAPI:
    app = FastAPI(title="pengcode", version=__version__)
    images: _Cache = _Cache()
    results: _Cache = _Cache()

    app.mount("/static", StaticFiles(directory=STATIC), name="static")

    @app.get("/")
    def index():
        return FileResponse(STATIC / "index.html")

    @app.get("/api/config")
    def config():
        return {
            "version": __version__,
            "profile": load_profile(profile_name).to_dict(),
            "profiles": list_profiles(),
            "papers": sorted(PAPER_PRESETS),
            "modes": MODE_INFO,
            "mode_order": list(MODES),
            "patterns": {k: HINTS[k] for k in sorted(PATTERNS)},
            "defaults": Params().to_dict(),
        }

    @app.post("/api/upload")
    async def upload(file: UploadFile = File(...)):
        data = await file.read()
        if not data:
            raise HTTPException(400, "arquivo vazio")
        if len(data) > MAX_UPLOAD:
            raise HTTPException(413, f"arquivo acima de {MAX_UPLOAD // 1024 // 1024} MB")
        image_id = uuid.uuid4().hex
        images.put(image_id, (data, file.filename or "imagem"))
        return {"image_id": image_id, "name": file.filename, "bytes": len(data)}

    @app.post("/api/generate")
    def generate_endpoint(req: GenerateRequest):
        profile = _profile_from(req.profile, profile_name)

        if req.pattern:
            if req.pattern not in PATTERNS:
                raise HTTPException(400, f"padrão desconhecido: {req.pattern}")
            drawing = build(req.pattern, profile)
            emit = emit_gcode(drawing, profile, title=f"calibrate:{req.pattern}", notes=[HINTS[req.pattern]])
            params = Params()
            name = f"calib_{req.pattern}"
        else:
            entry = images.get(req.image_id or "")
            if entry is None:
                raise HTTPException(404, "imagem não encontrada — envie o arquivo de novo")
            data, name = entry
            try:
                result = generate(data, Params.from_dict(req.params), profile, filename=name, title=FsPath(name).stem)
            except Exception as exc:  # parâmetros ruins não devem derrubar o servidor
                raise HTTPException(422, f"falha ao gerar: {exc}") from exc
            drawing, emit, params = result.drawing, result.emit, result.params
            name = FsPath(name).stem

        result_id = uuid.uuid4().hex
        results.put(result_id, (emit.gcode, name))
        box = profile.content_box()
        return JSONResponse(
            {
                "id": result_id,
                "name": name,
                "paths": _serialize(drawing),
                "stats": emit.stats,
                "warnings": emit.warnings,
                "params": params.to_dict(),
                "geometry": {
                    "bed": [profile.bed.x, profile.bed.y],
                    "reachable": list(profile.reachable_rect()),
                    "paper": list(profile.paper_rect()),
                    "box": [box[0], box[1], box[0] + box[2], box[1] + box[3]],
                },
            }
        )

    @app.get("/api/gcode/{result_id}")
    def download(result_id: str):
        entry = results.get(result_id)
        if entry is None:
            raise HTTPException(404, "resultado expirado — gere de novo")
        gcode, name = entry
        return PlainTextResponse(
            gcode,
            headers={"Content-Disposition": f'attachment; filename="{name}.gcode"'},
            media_type="text/plain; charset=utf-8",
        )

    return app
