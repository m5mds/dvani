"""Size each client mark to the marquee tile it is actually painted in.

Every mark in the pack ships on the same 1200x448 canvas with its ink fitted into
a 1080x320 box, and the marquee paints that canvas at the tile's full content
width. That is right for a landscape lockup, which fills the box across, and wrong
for a portrait one, which is limited by the box's height and ends up painting at
roughly a third of its neighbour's area. On the strip the effect reads as a set of
logos at inconsistent sizes rather than one wall of clients.

The fix is per-mark and geometric: measure the mark's own ink bounds, work out how
much it can grow before it touches the tile's padded box on either axis, and write
that factor onto the tag as --mark-scale. home-monumental.css applies it as a
transform, so nothing reflows and no canvas is re-rendered - the pack itself is
untouched. A landscape mark comes out near 1.07 (it was already close to the tile
width); a portrait one comes out at the 1.5 ceiling.

check-client-logo-pack.py imports mark_scale() from here, because a mark painted
1.5x larger is served at 1.5x the device width and its blur gate has to follow.

Usage:
    python tasks/fit-marquee-marks.py            # rewrite index.html and ar.html
    python tasks/fit-marquee-marks.py --list     # print the factors, write nothing
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PACK_DIR = ROOT / "assets" / "client-logos-monochrome"
PAGES = ("index.html", "ar.html")

CANVAS_SIZE = (1200, 448)

# The box the ink is allowed to grow into, in canvas pixels.
#   width  0.96 * 1200 - the tile's own padding supplies the optical margin, so
#          this only keeps the ink off the very edge of the painted canvas.
#   height 480      - the tile's padded content box is 0.409 of the image box's
#          width at the tightest breakpoint (figure min-height 8.5rem, padding-block
#          2vw, flex-basis 21rem), and 0.409 * 1200 = 490. Rounded down to 480 so a
#          full-height mark keeps a pixel of air.
INK_LIMIT_W, INK_LIMIT_H = 1152.0, 480.0
# A mark can grow until it hits a limit, and then it stops. In practice the height
# limit binds first for everything portrait and lands at 1.5; the ceiling is here
# so a mark with an unusually tight ink box cannot run away.
SCALE_CAP = 1.55

TAG = re.compile(
    r'(<img srcset="assets/client-logos-monochrome/640/(?P<stem>[a-z0-9-]+)\.png 640w,'
    r'[^>]*?)\swidth="\d+" height="\d+"(?:\sstyle="--mark-scale:[^"]*")?(?P<rest>[^>]*?>)')


def mark_scale(stem: str) -> float:
    """How much larger than its canvas fit the mark is painted in the marquee."""
    alpha = np.asarray(Image.open(PACK_DIR / f"{stem}.png").convert("RGBA"))[:, :, 3]
    ys, xs = np.nonzero(alpha > 8)
    if len(xs) == 0:
        raise RuntimeError(f"{stem}: no visible pixels")
    ink_w = xs.max() - xs.min() + 1
    ink_h = ys.max() - ys.min() + 1
    return round(min(INK_LIMIT_W / ink_w, INK_LIMIT_H / ink_h, SCALE_CAP), 3)


def fit_page(path: Path) -> int:
    text = path.read_text(encoding="utf-8")

    def rewrite(match: re.Match) -> str:
        scale = mark_scale(match.group("stem"))
        return (f'{match.group(1)} width="{CANVAS_SIZE[0]}" height="{CANVAS_SIZE[1]}" '
                f'style="--mark-scale: {scale}"{match.group("rest")}')

    text, count = TAG.subn(rewrite, text)
    path.write_text(text, encoding="utf-8")
    return count


def main() -> None:
    scales = {path.stem: mark_scale(path.stem) for path in sorted(PACK_DIR.glob("*.png"))}
    if "--list" in sys.argv:
        for stem, scale in sorted(scales.items(), key=lambda kv: -kv[1]):
            print(f"  {stem:34} {scale:5.3f}x")
        return
    for name in PAGES:
        print(f"  {name:12} {fit_page(ROOT / name)} marks sized")


if __name__ == "__main__":
    main()
