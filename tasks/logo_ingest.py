"""Turn official brand artwork into the alpha mask the logo pack build expects.

`build-client-logo-pack.py` keys on the alpha channel, which only works for
artwork that already ships transparent. Official brand assets arrive in every
other form too - black on white, white on a dark plate, full colour on white, a
mark sitting on a brand-colour tile - and for those alpha is 255 everywhere, so
the bounding box would cover the whole canvas and the output would be a solid
white rectangle.

`ingest()` normalises all of them by keying on *colour distance from the
background* in CIE Lab rather than on luminance:

  - polarity-free, so light-on-dark and dark-on-light need no separate path;
  - colour-agnostic, so a mid-blue mark on white keys as cleanly as a black one;
  - interior counters survive for free, because the hole in an 'O' is
    background-coloured and therefore keys to alpha 0. Flood-filling in from a
    corner - the usual approach - is exactly what destroys counters.

The module refuses artwork it cannot key confidently rather than emitting a
quietly wrong mask.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Literal

import cv2
import numpy as np
from PIL import Image


CONTENT_SIZE = (1080, 320)

# A border ring this thick is sampled to estimate the background plate.
BORDER_FRACTION = 0.02
# Fraction of the ring that must sit within this many delta-E of the median for
# the plate to count as flat.
BACKGROUND_TOLERANCE = 12.0
MIN_BACKGROUND_CONFIDENCE = 0.70
# Ink must stand this far off the plate, in delta-E 76, to key reliably.
MIN_INK_CONTRAST = 20.0
# Speckles smaller than this at *output* scale are dropped.
DESPECKLE_OUTPUT_PX = 2.0
# Above this, the mark is probably a drop shadow or outer glow rather than art.
SOFT_FRACTION_WARN = 0.30


class SourceError(RuntimeError):
    """Artwork that cannot be keyed confidently. Fix the source, not the code."""


@dataclass(frozen=True)
class IngestReport:
    kind: Literal["alpha", "keyed"]
    background_confidence: float
    ink_contrast: float
    ink_bbox: tuple[int, int, int, int]
    fit_scale: float
    components: int
    holes: int
    soft_fraction: float

    @property
    def upscales(self) -> bool:
        """True when the pipeline would have to enlarge this source to fill the box."""
        return self.fit_scale > 1.0


def _disk(diameter: int) -> np.ndarray:
    return cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (diameter, diameter))


def _is_flat(pixels: np.ndarray) -> bool:
    """True when a pixel population is a single flat colour, ignoring outliers."""
    if pixels.size == 0:
        return False
    spread = np.percentile(pixels, 95, axis=0) - np.percentile(pixels, 5, axis=0)
    return bool(np.all(spread < 12))


def _border_ring(height: int, width: int) -> np.ndarray:
    thickness = max(2, round(BORDER_FRACTION * min(height, width)))
    ring = np.zeros((height, width), dtype=bool)
    ring[:thickness] = True
    ring[-thickness:] = True
    ring[:, :thickness] = True
    ring[:, -thickness:] = True
    return ring


def _bbox(mask: np.ndarray) -> tuple[int, int, int, int]:
    ys, xs = np.nonzero(mask)
    if xs.size == 0:
        raise SourceError("no visible pixels after keying")
    x0, x1 = int(xs.min()), int(xs.max())
    y0, y1 = int(ys.min()), int(ys.max())
    return x0, y0, x1 - x0 + 1, y1 - y0 + 1


def _hole_count(core: np.ndarray, bbox: tuple[int, int, int, int]) -> int:
    x, y, width, height = bbox
    window = core[y : y + height, x : x + width].astype(np.uint8)
    count, labels = cv2.connectedComponents(1 - window, 4)
    touching = set(labels[0, :]) | set(labels[-1, :]) | set(labels[:, 0]) | set(labels[:, -1])
    return sum(1 for component in range(1, count) if component not in touching)


def _despeckle(alpha: np.ndarray, fit_scale: float) -> tuple[np.ndarray, int]:
    """Drop components too small to survive to the output canvas.

    The legacy `clean_alpha` hardcodes a 4px area, tuned for ~1000px sources. Official
    artwork arrives at 2400-4800px, where 4px is far too small to catch anything and,
    more importantly, is not the quantity that matters. Scaling the threshold by the
    fit means the decision is made in output pixels: at a 4000px-wide source
    (fit_scale ~0.27) the floor becomes ~55 source px, so a GACA diacritic - hundreds
    of pixels there - survives while a JPEG speck does not.
    """
    threshold = max(4, int(round((DESPECKLE_OUTPUT_PX / max(fit_scale, 1e-6)) ** 2)))
    count, labels, stats, _ = cv2.connectedComponentsWithStats((alpha > 10).astype(np.uint8), 8)
    kept = 0
    for component in range(1, count):
        if stats[component, cv2.CC_STAT_AREA] < threshold:
            alpha[labels == component] = 0
        else:
            kept += 1
    return alpha, kept


def ingest(
    source: Path,
    *,
    polarity: Literal["auto", "ink-dark", "ink-light"] = "auto",
    content: tuple[int, int] = CONTENT_SIZE,
) -> tuple[np.ndarray, IngestReport]:
    """Convert any official-artwork raster into a clean uint8 alpha mask.

    Returns the full-frame mask (uncropped) plus a report used for gating and review.
    """
    image = Image.open(source).convert("RGBA")
    rgba = np.asarray(image)
    rgb, source_alpha = rgba[:, :, :3], rgba[:, :, 3]
    height, width = source_alpha.shape

    ring = _border_ring(height, width)
    opaque = source_alpha > 250
    transparent_fraction = float((source_alpha < 250).mean())
    # A logo on an opaque brand-colour tile looks transparent-free but still needs keying.
    tile_like = bool(opaque.mean() > 0.60 and _is_flat(rgb[opaque]))

    if transparent_fraction >= 0.05 and not tile_like:
        # Real vector rasters and transparent PNGs: the alpha ramp is genuine
        # antialiasing. Applying a floor here would eat it and re-introduce the
        # very softness this replacement exists to remove.
        alpha = source_alpha.astype(np.uint8).copy()
        kind: Literal["alpha", "keyed"] = "alpha"
        background_confidence = 1.0
        ink_contrast = float("inf")
        core = alpha >= 128
    else:
        kind = "keyed"
        # float32 in 0..1 gives true Lab (L 0..100, a/b +/-127). On uint8 input OpenCV
        # rescales L by 2.55 and offsets a/b by 128, which silently changes what every
        # delta-E constant below means.
        lab = cv2.cvtColor((rgb / 255.0).astype(np.float32), cv2.COLOR_RGB2LAB)
        sample = (ring & opaque) if tile_like else ring
        if sample.sum() < 16:
            raise SourceError(f"{source.name}: not enough border pixels to estimate a background")

        background = np.median(lab[sample].reshape(-1, 3), axis=0)
        distance = np.linalg.norm(lab - background, axis=-1)

        background_confidence = float((distance[sample] < BACKGROUND_TOLERANCE).mean())
        if background_confidence < MIN_BACKGROUND_CONFIDENCE:
            raise SourceError(
                f"{source.name}: border is not a flat plate "
                f"(confidence {background_confidence:.2f}); crop to the mark "
                f"or supply a transparent PNG"
            )

        scaled = np.clip(distance * (255.0 / max(float(np.percentile(distance, 99.5)), 1e-3)), 0, 255)
        _, otsu = cv2.threshold(scaled.astype(np.uint8), 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)
        core = otsu.astype(bool)

        if polarity == "ink-light" and core.mean() > 0.5:
            core = ~core
        elif polarity == "ink-dark" and core.mean() > 0.5:
            core = ~core
        if core.mean() > 0.55:
            raise SourceError(
                f"{source.name}: keyed region covers {core.mean():.0%} of the frame; "
                f"polarity is ambiguous - pass polarity= explicitly"
            )

        halo = cv2.dilate(core.astype(np.uint8), _disk(5)).astype(bool)
        # Anchor on the *nearest* ink so a two-colour mark saturates both colours to
        # opaque instead of rendering the further one semi-transparent.
        ink_level = float(np.percentile(distance[core], 20))
        plate_level = float(np.percentile(distance[~halo], 98)) if (~halo).any() else 0.0
        ink_contrast = ink_level - plate_level
        if ink_contrast < MIN_INK_CONTRAST:
            raise SourceError(
                f"{source.name}: ink stands only delta-E {ink_contrast:.1f} off the "
                f"background; supply higher-contrast artwork"
            )

        # Antialiasing blends linearly between ink and plate, so distance is
        # proportional to coverage and this two-point ramp recovers it.
        alpha = np.clip((distance - plate_level) / (ink_level - plate_level), 0.0, 1.0)
        alpha = (alpha * 255.0).astype(np.uint8)

    visible = alpha > 8
    if not visible.any():
        raise SourceError(f"{source.name}: nothing visible after keying")

    x, y, ink_w, ink_h = _bbox(visible)
    fit_scale = min(content[0] / ink_w, content[1] / ink_h)
    alpha, components = _despeckle(alpha, fit_scale)

    # Recompute after despeckling; dropping a stray speck can tighten the box.
    x, y, ink_w, ink_h = _bbox(alpha > 8)
    fit_scale = min(content[0] / ink_w, content[1] / ink_h)

    window = alpha[y : y + ink_h, x : x + ink_w]
    soft_fraction = float(((window > 8) & (window < 64)).mean())

    return alpha, IngestReport(
        kind=kind,
        background_confidence=background_confidence,
        ink_contrast=ink_contrast,
        ink_bbox=(x, y, ink_w, ink_h),
        fit_scale=fit_scale,
        components=components,
        holes=_hole_count(alpha >= 128, (x, y, ink_w, ink_h)),
        soft_fraction=soft_fraction,
    )


def describe(name: str, report: IngestReport) -> str:
    x, y, ink_w, ink_h = report.ink_bbox
    parts = [
        f"{name}: {report.kind}",
        f"ink {ink_w}x{ink_h}",
        f"fit {report.fit_scale:.2f}x",
        f"parts {report.components}",
        f"holes {report.holes}",
    ]
    if report.kind == "keyed":
        parts.append(f"contrast dE {report.ink_contrast:.0f}")
    if report.upscales:
        parts.append("UPSCALES")
    if report.soft_fraction > SOFT_FRACTION_WARN:
        parts.append(f"SOFT {report.soft_fraction:.0%} - drop shadow?")
    return "  ".join(parts)
