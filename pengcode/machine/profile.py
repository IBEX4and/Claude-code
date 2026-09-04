"""Perfil da máquina: geometria, offset da caneta, velocidades e G-code fixo."""

from dataclasses import asdict, dataclass, field, fields, is_dataclass
from pathlib import Path as FsPath

import yaml

PROFILE_DIR = FsPath(__file__).parent / "profiles"
DEFAULT_PROFILE = "bambu_a1"


@dataclass
class Bed:
    x: float = 256.0
    y: float = 256.0


@dataclass
class PenOffset:
    """Posição da ponta da caneta em relação ao bico, em mm.

    Medida com o padrão de calibração `cross`: desenhe a cruz, meça onde ela
    caiu de verdade e a diferença é este offset.
    """

    x: float = 0.0
    y: float = -35.0


@dataclass
class ZConfig:
    up: float = 4.0      # caneta levantada (viagem)
    down: float = 1.0    # caneta encostada; com suporte de mola, um pouco abaixo do contato
    safe: float = 25.0   # altura de segurança para entrar e sair do desenho
    feed: float = 2400.0
    min: float = 0.0     # limites duros: o emissor recusa sair daqui
    max: float = 60.0


@dataclass
class Feeds:
    draw: float = 2400.0
    travel: float = 9000.0


@dataclass
class Paper:
    width: float = 210.0
    height: float = 297.0
    x: float = 20.0       # canto inferior esquerdo da folha, em coordenadas de mesa
    y: float = 5.0
    margin: float = 10.0


@dataclass
class Profile:
    name: str = "Bambu Lab A1 + caneta"
    description: str = ""
    bed: Bed = field(default_factory=Bed)
    pen_offset: PenOffset = field(default_factory=PenOffset)
    z: ZConfig = field(default_factory=ZConfig)
    feeds: Feeds = field(default_factory=Feeds)
    paper: Paper = field(default_factory=Paper)
    accel: float = 1500.0
    start_gcode: str = ""
    end_gcode: str = ""

    # --- geometria derivada -------------------------------------------------

    def reachable_rect(self) -> tuple[float, float, float, float]:
        """Onde a **ponta da caneta** consegue chegar, em coordenadas de mesa.

        O carro se move em [0, bed] e a caneta vive deslocada, então a área
        útil é a mesa inteira menos o offset — é por isso que uma caneta muito
        à frente do bico custa altura de desenho.
        """
        ox, oy = self.pen_offset.x, self.pen_offset.y
        x0, x1 = max(0.0, ox), min(self.bed.x, self.bed.x + ox)
        y0, y1 = max(0.0, oy), min(self.bed.y, self.bed.y + oy)
        return (x0, y0, max(x0, x1), max(y0, y1))

    def paper_rect(self) -> tuple[float, float, float, float]:
        p = self.paper
        return (p.x, p.y, p.x + p.width, p.y + p.height)

    def content_box(self) -> tuple[float, float, float, float]:
        """Caixa de desenho: folha menos margem, cortada pela área alcançável.

        Devolvida como (x, y, largura, altura).
        """
        px0, py0, px1, py1 = self.paper_rect()
        m = self.paper.margin
        rx0, ry0, rx1, ry1 = self.reachable_rect()
        x0 = max(px0 + m, rx0)
        y0 = max(py0 + m, ry0)
        x1 = min(px1 - m, rx1)
        y1 = min(py1 - m, ry1)
        return (x0, y0, max(0.0, x1 - x0), max(0.0, y1 - y0))

    def check(self) -> list[str]:
        """Avisos de configuração — não impedem gerar, mas você quer ler."""
        out = []
        px0, py0, px1, py1 = self.paper_rect()
        rx0, ry0, rx1, ry1 = self.reachable_rect()
        if px0 < rx0 - 1e-6 or py0 < ry0 - 1e-6 or px1 > rx1 + 1e-6 or py1 > ry1 + 1e-6:
            out.append(
                f"A folha ({px0:.0f},{py0:.0f})-({px1:.0f},{py1:.0f}) mm passa da área "
                f"alcançável pela caneta ({rx0:.0f},{ry0:.0f})-({rx1:.0f},{ry1:.0f}) mm. "
                "O desenho será recortado."
            )
        bw, bh = self.content_box()[2:]
        if bw <= 0 or bh <= 0:
            out.append("A área de desenho ficou vazia: reveja folha, margem e offset da caneta.")
        if self.z.down >= self.z.up:
            out.append("z.down deve ser menor que z.up, senão a caneta nunca levanta.")
        if not (self.z.min <= self.z.down <= self.z.max):
            out.append(f"z.down={self.z.down} está fora dos limites [{self.z.min}, {self.z.max}].")
        if self.accel > 5000:
            out.append("Aceleração alta: na A1 a mesa balança em Y e o papel tende a sair do lugar.")
        return out

    # --- serialização -------------------------------------------------------

    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict) -> "Profile":
        return _build(cls, data or {})


def _build(cls, data: dict):
    """Constrói uma dataclass a partir de um dict, preenchendo o que faltar."""
    kwargs = {}
    for f in fields(cls):
        if f.name not in data or data[f.name] is None:
            continue
        value = data[f.name]
        if is_dataclass(f.type) and isinstance(value, dict):
            kwargs[f.name] = _build(f.type, value)
        else:
            kwargs[f.name] = value
    return cls(**kwargs)


def list_profiles() -> list[str]:
    return sorted(p.stem for p in PROFILE_DIR.glob("*.yaml"))


def load_profile(name_or_path: str | FsPath | None = None) -> Profile:
    """Carrega um perfil pelo nome (`bambu_a1`) ou por caminho de arquivo."""
    name_or_path = name_or_path or DEFAULT_PROFILE
    candidate = FsPath(name_or_path)
    if not candidate.exists():
        candidate = PROFILE_DIR / f"{name_or_path}.yaml"
    if not candidate.exists():
        raise FileNotFoundError(
            f"perfil '{name_or_path}' não encontrado (disponíveis: {', '.join(list_profiles())})"
        )
    with open(candidate, "r", encoding="utf-8") as fh:
        return Profile.from_dict(yaml.safe_load(fh) or {})


# Formatos de papel em mm (largura, altura) no modo retrato. Nem todos cabem em
# todo perfil — `Profile.check()` avisa quando a folha passa do alcance.
PAPER_PRESETS: dict[str, tuple[float, float]] = {
    "A6": (105.0, 148.0),
    "A5": (148.0, 210.0),
    "A4": (210.0, 297.0),
    "carta": (215.9, 279.4),
    "quadrado_100": (100.0, 100.0),
    "quadrado_150": (150.0, 150.0),
    "cartao_10x15": (100.0, 150.0),
}


def apply_paper(profile: Profile, preset: str, landscape: bool = False, center: bool = True) -> Profile:
    """Troca o formato da folha do perfil, opcionalmente centrando-a na mesa."""
    if preset not in PAPER_PRESETS:
        raise KeyError(f"formato '{preset}' desconhecido (use um de: {', '.join(PAPER_PRESETS)})")
    w, h = PAPER_PRESETS[preset]
    if landscape:
        w, h = h, w
    profile.paper.width, profile.paper.height = w, h
    if center:
        rx0, ry0, rx1, ry1 = profile.reachable_rect()
        profile.paper.x = round(rx0 + ((rx1 - rx0) - w) / 2.0, 2)
        profile.paper.y = round(ry0 + ((ry1 - ry0) - h) / 2.0, 2)
    return profile
