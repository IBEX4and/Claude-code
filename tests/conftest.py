import io

import numpy as np
import pytest
from PIL import Image, ImageDraw

from pengcode.machine import load_profile


@pytest.fixture
def profile():
    return load_profile()


@pytest.fixture
def line_art():
    """PNG de traço: um círculo e um retângulo, com bordas nítidas."""
    img = Image.new("L", (300, 300), 255)
    d = ImageDraw.Draw(img)
    d.ellipse([40, 40, 260, 260], outline=0, width=5)
    d.rectangle([110, 110, 190, 190], fill=60)
    buf = io.BytesIO()
    img.save(buf, "PNG")
    return buf.getvalue()


@pytest.fixture
def gray_field():
    """Imagem de tons contínuos, sem nenhuma borda dura."""
    yy, xx = np.mgrid[0:240, 0:240]
    g = np.clip(0.5 + 0.4 * np.cos(xx / 40.0) * np.sin(yy / 30.0), 0, 1)
    buf = io.BytesIO()
    Image.fromarray((g * 255).astype(np.uint8)).save(buf, "PNG")
    return buf.getvalue()
