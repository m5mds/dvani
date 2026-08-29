"""Fit full-colour client artwork onto the shared mark canvas.

The pack is mixed: a mark ships in colour when the client's own artwork reads on
the dark relationships section, and as a white silhouette when it does not. This
script builds the colour half. The silhouette half stays with
build-client-logo-pack.py, which keys artwork down to an alpha mask - exactly what
must NOT happen here, so this is a separate path rather than a flag on that one.

Selection is not a matter of taste. Each candidate was rasterised on the section
ground (#0E1012) and measured for contrast; anything under 3:1 stays monochrome.
Two candidates were measured as usable and then rejected on inspection, which is
why the contact sheet is part of this process and not a formality:

  jedco-jeddah-airports  DecoCorner's "jeddah-airports" file is the King Abdulaziz
                         International Airport mark. This slot credits JEDCO,
                         Jeddah Airports Company - the operator, a different
                         entity. Swapping it would misattribute the client.
  red-sea-global         Measured 4.85, but the figure is carried by the bright
                         emblem; the "Red Sea Global" wordmark beside it is a
                         muted blue that reads far worse than the white
                         silhouette it would replace.

neom is a judgement call the measurement cannot make: it scores 4.48 on the
strength of its colour emblem, while the "NEOM" wordmark beside it is near-black
and reads faintly on the dark ground. Included in colour at the client's
direction - the emblem is the recognisable half.

SVG is rasterised with headless Chromium rather than a Node toolchain, because
sharp/librsvg is not a declared dependency of this repo.

Usage:
    python tasks/build-colour-marks.py            # build every colour mark
    python tasks/build-colour-marks.py --list     # show the split, build nothing
"""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
BRAND_DIR = ROOT / "assets" / "brand-sources" / "client-logos"
PACK_DIR = ROOT / "assets" / "client-logos-monochrome"
MOBILE_DIR = PACK_DIR / "640"
CANVAS_SIZE = (1200, 448)
CONTENT_SIZE = (1080, 320)
MOBILE_SIZE = (640, 239)
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
# Rasterise vector sources well above the content box so the LANCZOS fit always
# downsamples, matching what build-client-logo-pack.py does for its own sources.
RASTER_LONG_EDGE = 2 * max(CONTENT_SIZE)

# dvani mark stem -> artwork filename, with the measured contrast on #0E1012.
COLOUR_MARKS: dict[str, tuple[str, float]] = {
    "bec-arabia": ("bec.svg", 18.18),
    "gaca": ("gaca.svg", 16.96),
    "havelock-one": ("havelock-one.svg", 16.60),
    "hayyak": ("hayyak.svg", 16.25),
    "rcu-mono-v3": ("royal-commission-alula.svg", 5.85),
    "mas-engineering-construction": ("mas-ecc.png", 3.72),
    "alfanar-engineering-services": ("alfanar.svg", 3.41),
    "neom-mono-v3": ("neom.svg", 4.48),
}


def rasterise(source: Path) -> Image.Image:
    """Render artwork to RGBA at high resolution, transparent background."""
    if source.suffix.lower() != ".svg":
        return Image.open(source).convert("RGBA")

    import base64

    payload = base64.b64encode(source.read_bytes()).decode()
    # Size the viewport to the artwork's own aspect so nothing is letterboxed away.
    probe = Image.new("RGBA", (1, 1))
    with tempfile.TemporaryDirectory() as tmp:
        shot = Path(tmp) / "out.png"
        html = Path(tmp) / "page.html"
        html.write_text(
            "<style>html,body{margin:0;background:transparent}"
            f"img{{display:block;width:{RASTER_LONG_EDGE}px;height:auto}}</style>"
            f'<img src="data:image/svg+xml;base64,{payload}">'
        )
        result = subprocess.run(
            [CHROME, "--headless", "--disable-gpu", "--no-sandbox",
             "--default-background-color=00000000",
             "--hide-scrollbars", f"--screenshot={shot}",
             f"--window-size={RASTER_LONG_EDGE},{RASTER_LONG_EDGE}",
             html.as_uri()],
            capture_output=True, text=True,
        )
        if not shot.exists():
            raise RuntimeError(f"{source.name}: rasterise failed\n{result.stderr[-400:]}")
        probe = Image.open(shot).convert("RGBA").copy()
    return probe


def fit(image: Image.Image) -> Image.Image:
    """Trim to the ink, scale into the content box, centre on the canvas.

    Colour and per-pixel alpha are carried through untouched - the artwork is the
    deliverable here, not a mask derived from it.
    """
    alpha = np.asarray(image)[:, :, 3]
    ys, xs = np.nonzero(alpha > 8)
    if len(xs) == 0:
        raise RuntimeError("no visible pixels")
    image = image.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    scale = min(CONTENT_SIZE[0] / image.width, CONTENT_SIZE[1] / image.height)
    size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
    image = image.resize(size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", CANVAS_SIZE, (0, 0, 0, 0))
    canvas.alpha_composite(image, ((CANVAS_SIZE[0] - image.width) // 2,
                                   (CANVAS_SIZE[1] - image.height) // 2))
    return canvas, scale


def main() -> None:
    if "--list" in sys.argv:
        for stem, (art, contrast) in sorted(COLOUR_MARKS.items(), key=lambda kv: -kv[1][1]):
            print(f"  {stem:32} {art:28} {contrast:5.2f} : 1")
        print(f"\n  {len(COLOUR_MARKS)} colour, {49 - len(COLOUR_MARKS)} monochrome")
        return

    MOBILE_DIR.mkdir(parents=True, exist_ok=True)
    for stem, (art, contrast) in sorted(COLOUR_MARKS.items()):
        source = BRAND_DIR / art
        if not source.exists():
            raise SystemExit(f"missing artwork: {source}")
        canvas, scale = fit(rasterise(source))
        canvas.save(PACK_DIR / f"{stem}.png", optimize=True)
        canvas.resize(MOBILE_SIZE, Image.Resampling.LANCZOS).save(
            MOBILE_DIR / f"{stem}.png", optimize=True)
        print(f"  {stem:32} <- {art:28} fit {scale:.2f}x  contrast {contrast:.2f}:1")
    print(f"Built {len(COLOUR_MARKS)} colour marks.")


if __name__ == "__main__":
    main()
