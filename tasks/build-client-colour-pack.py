"""Build colour client marks from the raster artwork the client supplied directly.

build-colour-marks.py handles vector artwork sourced from brand sites: it rasterises
an SVG that already carries its own transparency. This script handles the other
half - flat photographic artwork (JPEG, no alpha) delivered by the client, which
has to have its background knocked out before it can sit on the dark relationships
section. Both write into the same pack and honour the same canvas contract, so the
two paths stay separate rather than becoming a flag on one script.

Three things happen here, in this order:

  1. KNOCKOUT. The background colour is read from a four-pixel border ring, and
     every pixel within `hard` of it becomes transparent, with a graded alpha band
     out to `soft` so the antialiasing survives. Thresholds are per-stem because
     the sources are not uniform: most are ink on #fefefe and tolerate a wide band,
     el-seif-engineering is white artwork on #f7f7f7 and needs a band of 3 or the
     wordmark is erased along with the ground.

  2. NEUTRAL-INK REVERSAL, for the four stems in REVERSE_NEUTRAL_INK. These are
     light-background lockups whose wordmark is black or near-black; knocked out and
     dropped on #101010 the wordmark simply is not there (five-seasons-hotel measured
     1.36:1, elegancia-arabia 1.76:1). Brands publish reversed lockups for exactly
     this case, so the transform reproduces one: pixels that are both dark and
     near-neutral have their lightness inverted, and everything with chroma is left
     alone. elegancia's green diamond, china-comservice's red square and
     national-talents-company's colour monogram all come through untouched - only the
     black type moves. The mask is feathered on both axes so glyph antialiasing does
     not band.

     It is applied per stem, never globally, and the reason is rose-land: its wordmark
     is black on a gold plate, so it reads perfectly well already and reversing it
     would produce white type on gold, which is not a lockup the brand publishes.

  3. FIT. Trim to ink, scale into the content box, centre on the canvas. Identical
     to build-colour-marks.fit - same canvas, same content box, so these marks drop
     into the marquee beside the existing ones at the same optical size.

Every mark is gated on measured WCAG contrast against the section ground before it
ships; see check-client-logo-pack.py, which reads the roster below.

Usage:
    python tasks/build-client-colour-pack.py           # build every mark
    python tasks/build-client-colour-pack.py --list    # show the roster, build nothing
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
BRAND_DIR = ROOT / "assets" / "brand-sources" / "client-logos-2026"
PACK_DIR = ROOT / "assets" / "client-logos-monochrome"
MOBILE_DIR = PACK_DIR / "640"
CANVAS_SIZE = (1200, 448)
CONTENT_SIZE = (1080, 320)
MOBILE_SIZE = (640, 239)

# The relationships section ground, matching check-client-logo-pack.SECTION_GROUND.
SECTION_GROUND = np.array([14.0, 16.0, 18.0])
MIN_CONTRAST = 3.0

# stem -> artwork filename. Every one of these is client-delivered artwork and
# replaces a mark that was previously a 150 DPI crop out of divani profile.pdf or,
# for havelock-one, a white silhouette standing in for a two-blue logo.
CLIENT_MARKS: dict[str, str] = {
    "abdul-mohsen-al-tamimi-group": "abdul-mohsen-al-tamimi-group.jpg",
    "albaddad-engineering": "albaddad-engineering.jpg",
    "alsharif-group-holding": "alsharif-group-holding.jpg",
    "astra-construction": "astra-construction.jpg",
    "china-comservice": "china-comservice.jpg",
    "diriyah-company": "diriyah-company.jpg",
    "diwan-al-kashi": "diwan-al-kashi.jpg",
    "el-seif-engineering": "el-seif-engineering.jpg",
    "elegancia-arabia": "elegancia-arabia.jpg",
    "five-seasons-hotel": "five-seasons-hotel.jpg",
    "havelock-one": "havelock-one.jpg",
    "jedco-jeddah-airports": "jedco-jeddah-airports.jpg",
    "lilac-park": "lilac-park.jpg",
    "national-talents-company": "national-talents-company.jpg",
    "north-coffee": "north-coffee.jpg",
    "rose-land": "rose-land.jpg",
    "siac": "siac.jpg",
    "skyline-tabuk-hotel": "skyline-tabuk-hotel.jpg",
    "watania-business-group": "watania-business-group.jpg",
}

# stem -> (hard, soft) knockout band, in RGB distance from the sampled ground.
# Absent means DEFAULT_BAND. el-seif-engineering is the reason this is per-stem:
# its artwork is #ffffff type on a #f7f7f7 plate, eight units apart, so anything
# wider than 3 takes the wordmark with the background.
DEFAULT_BAND = (26.0, 62.0)
KNOCKOUT_BAND: dict[str, tuple[float, float]] = {
    "el-seif-engineering": (3.0, 7.0),
}

# Stems whose wordmark is black or near-black on a light ground. See (2) above.
REVERSE_NEUTRAL_INK = frozenset({
    "china-comservice",
    "elegancia-arabia",
    "five-seasons-hotel",
    "national-talents-company",
})

# Stems drawn entirely in a dark chromatic ink - both of these are a deep blue -
# which is a colour, not a neutral, so REVERSE_NEUTRAL_INK leaves it alone and it
# lands under the gate on the section ground: siac 2.76:1, jedco 2.88:1. The lift
# raises those pixels toward LIFT_TARGET luma by scaling all three channels by one
# factor, which moves value and leaves hue where it is, and it is capped so no
# channel clips - a clipped channel is what would actually shift the hue. Both come
# out at the brand's own blue, a tint lighter: siac 4.62:1, jedco 4.13:1. This is
# the tint a brand's own dark-background guidance calls for, and it is applied only
# to marks that cannot clear the gate without it.
LIFT_TARGET = 0.45
LIFT_DARK_INK = frozenset({"jedco-jeddah-airports", "siac"})


def knockout(image: Image.Image, band: tuple[float, float]) -> Image.Image:
    """Make the flat background transparent, keeping the antialiasing band."""
    hard, soft = band
    rgb = np.asarray(image.convert("RGB")).astype(np.float64)
    ring = np.concatenate([
        rgb[:4].reshape(-1, 3), rgb[-4:].reshape(-1, 3),
        rgb[:, :4].reshape(-1, 3), rgb[:, -4:].reshape(-1, 3),
    ])
    ground = np.median(ring, axis=0)
    distance = np.linalg.norm(rgb - ground, axis=2)
    alpha = np.clip((distance - hard) / (soft - hard), 0.0, 1.0)
    return Image.fromarray(
        np.dstack([rgb, alpha * 255.0]).astype(np.uint8), "RGBA")


def _luma(rgb: np.ndarray) -> np.ndarray:
    return rgb @ np.array([0.2126, 0.7152, 0.0722])


def _smoothstep(edge0: float, edge1: float, x: np.ndarray) -> np.ndarray:
    t = np.clip((x - edge0) / (edge1 - edge0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def reverse_neutral_ink(image: Image.Image) -> Image.Image:
    """Invert the lightness of dark near-neutral pixels; leave chroma alone.

    Reproduces a brand's reversed lockup rather than inventing one: black type
    becomes white type, and every coloured element keeps its own value.
    """
    arr = np.asarray(image).astype(np.float64) / 255.0
    rgb, alpha = arr[:, :, :3], arr[:, :, 3]
    high, low = rgb.max(axis=2), rgb.min(axis=2)
    saturation = np.where(high > 1e-6, (high - low) / np.maximum(high, 1e-6), 0.0)
    luma = _luma(rgb)
    # Feathered on both axes so a glyph's antialiasing ramp does not band.
    mask = (1.0 - _smoothstep(0.14, 0.26, saturation)) * (1.0 - _smoothstep(0.34, 0.50, luma))
    lifted = np.clip(rgb + (1.0 - 2.0 * luma)[:, :, None], 0.0, 1.0)
    rgb = rgb * (1.0 - mask)[:, :, None] + lifted * mask[:, :, None]
    return Image.fromarray(
        (np.dstack([rgb, alpha]) * 255.0).astype(np.uint8), "RGBA")


def lift_dark_ink(image: Image.Image) -> Image.Image:
    """Raise dark chromatic ink toward LIFT_TARGET luma without moving its hue."""
    arr = np.asarray(image).astype(np.float64) / 255.0
    rgb, alpha = arr[:, :, :3], arr[:, :, 3]
    luma = _luma(rgb)
    # One factor across all three channels preserves the ratios between them, so
    # the hue holds - as long as nothing clips, hence the ceiling on the factor.
    headroom = 1.0 / np.maximum(rgb.max(axis=2), 1e-6)
    wanted = LIFT_TARGET / np.maximum(luma, 1e-6)
    factor = np.minimum(wanted, headroom)
    # Feathered so the lift fades out rather than banding across a gradient.
    factor = 1.0 + (factor - 1.0) * (1.0 - _smoothstep(0.32, 0.48, luma))
    rgb = np.clip(rgb * factor[:, :, None], 0.0, 1.0)
    return Image.fromarray(
        (np.dstack([rgb, alpha]) * 255.0).astype(np.uint8), "RGBA")


def fit(image: Image.Image) -> tuple[Image.Image, float]:
    """Trim to the ink, scale into the content box, centre on the canvas."""
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


def _relative_luminance(rgb: np.ndarray) -> np.ndarray:
    channel = rgb / 255.0
    channel = np.where(channel <= 0.03928, channel / 12.92,
                       ((channel + 0.055) / 1.055) ** 2.4)
    return _luma(channel)


def ground_contrast(image: Image.Image) -> float:
    """WCAG contrast of the mark's ink against the section, composited first."""
    arr = np.asarray(image).astype(np.float64)
    rgb, alpha = arr[:, :, :3], arr[:, :, 3]
    ink = alpha > 128
    if not ink.any():
        return 0.0
    weight = (alpha[ink] / 255.0)[:, None]
    composited = rgb[ink] * weight + SECTION_GROUND * (1.0 - weight)
    ink_luminance = float(_relative_luminance(composited).mean())
    ground_luminance = float(_relative_luminance(SECTION_GROUND))
    hi, lo = max(ink_luminance, ground_luminance), min(ink_luminance, ground_luminance)
    return (hi + 0.05) / (lo + 0.05)


def build(stem: str, artwork: str) -> tuple[Image.Image, float, float]:
    source = BRAND_DIR / artwork
    if not source.exists():
        raise SystemExit(f"missing artwork: {source}")
    mark = knockout(Image.open(source), KNOCKOUT_BAND.get(stem, DEFAULT_BAND))
    if stem in REVERSE_NEUTRAL_INK:
        mark = reverse_neutral_ink(mark)
    if stem in LIFT_DARK_INK:
        mark = lift_dark_ink(mark)
    canvas, scale = fit(mark)
    return canvas, scale, ground_contrast(canvas)


def main() -> None:
    if "--list" in sys.argv:
        for stem, artwork in sorted(CLIENT_MARKS.items()):
            flag = " reversed" if stem in REVERSE_NEUTRAL_INK else ""
            print(f"  {stem:32} {artwork}{flag}")
        print(f"\n  {len(CLIENT_MARKS)} client-delivered colour marks")
        return

    MOBILE_DIR.mkdir(parents=True, exist_ok=True)
    failures = []
    for stem, artwork in sorted(CLIENT_MARKS.items()):
        canvas, scale, contrast = build(stem, artwork)
        if contrast < MIN_CONTRAST:
            failures.append((stem, contrast))
        canvas.save(PACK_DIR / f"{stem}.png", optimize=True)
        canvas.resize(MOBILE_SIZE, Image.Resampling.LANCZOS).save(
            MOBILE_DIR / f"{stem}.png", optimize=True)
        print(f"  {stem:32} <- {artwork:34} fit {scale:5.2f}x  contrast {contrast:5.2f}:1")
    print(f"Built {len(CLIENT_MARKS)} client colour marks.")
    if failures:
        print("\nBelow the 3:1 section-ground gate:")
        for stem, contrast in failures:
            print(f"  {stem:32} {contrast:5.2f}:1")


if __name__ == "__main__":
    main()
