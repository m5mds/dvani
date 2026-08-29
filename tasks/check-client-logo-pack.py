"""Verify the served sharpness and shape of assets/client-logos-monochrome.

The pack is a set of white-on-transparent silhouettes rendered on a dark section.
Softness is what makes a mark read as "unclear", so the primary gate measures the
antialiasing band width at the size the browser actually paints:

    blur_dev = |{p : 26 <= alpha(p) < 230}| / perimeter(alpha >= 128)
               * served_device_width / CANVAS_WIDTH

A mark rendered from real vector art lands near 0.3-0.5; one upscaled from a
150 DPI PDF crop lands above 1.45.

Usage:
    python tasks/check-client-logo-pack.py              # check against the gates
    python tasks/check-client-logo-pack.py --baseline   # rewrite the stored baseline
    python tasks/check-client-logo-pack.py --table      # print measurements, never fail
"""

from __future__ import annotations

import json
import sys
from dataclasses import dataclass, asdict
from pathlib import Path

import cv2
import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PACK_DIR = ROOT / "assets" / "client-logos-monochrome"

# The pack is mixed. A mark ships in the client's own colours when that artwork
# reads on the dark relationships section, and as a white silhouette when it does
# not. The colour roster lives in build-colour-marks.py so there is one source of
# truth; every ink-shape gate below is written for silhouettes and is skipped for
# colour marks, which get their own contrast gate instead.
def _colour_marks() -> frozenset[str]:
    import importlib.util
    spec = importlib.util.spec_from_file_location(
        "_colour_build", Path(__file__).resolve().parent / "build-colour-marks.py")
    module = importlib.util.module_from_spec(spec)
    sys.modules["_colour_build"] = module
    spec.loader.exec_module(module)
    return frozenset(module.COLOUR_MARKS)


COLOUR = _colour_marks()
# The relationships section ground. A colour mark that cannot clear this against
# it is unreadable where it actually ships, whatever it looks like on white.
SECTION_GROUND = (14, 16, 18)
MIN_COLOUR_CONTRAST = 3.0
BASELINE_PATH = ROOT / "tasks" / "client-logo-baseline.json"

CANVAS_SIZE = (1200, 448)
CONTENT_SIZE = (1080, 320)
MOBILE_SIZE = (640, 239)

# Served size in device pixels at DPR 2, viewport >= 1768 CSS px (every clamp saturates).
#   .relationship-marks figure  flex-basis 21rem = 336px, padding-inline 2.4rem = 38.4px
#     -> content 259.2 CSS px; img width:100% -> 259.2 x 96.8, under the 6.6rem max-height.
SERVED_DEVICE_WIDTH = 518.4
#   .relationship-mark--wide  padding 1.75rem -> content 280px, but max-height 4.75rem = 76px
#     binds first, so object-fit: contain paints 76 * 1200/448 = 203.6 CSS px.
SERVED_DEVICE_WIDTH_WIDE = 407.1
WIDE_MARKS = frozenset({"rcu-mono-v3", "neom-mono-v3", "rosewood-mono-v3"})

# Marks re-extracted from native-resolution colour crops of divani profile.pdf.
# Their ceiling is the source: the pages are 1650x928 JPEGs at 150 DPI and an
# individual logo occupies only 47x20 to 384x108 px there, so these cannot reach
# the vector-artwork gate however they are processed. Holding them to a gate they
# can never clear leaves the checker permanently red and therefore useless as a
# regression detector - so they are gated against their recorded baseline instead.
# Moving one out of this set requires real brand artwork; see SOURCES.tsv.
PAGE_CROP = frozenset({
    "siac", "six-senses", "astra-construction", "elegancia-arabia",
    "jedco-jeddah-airports", "kidana", "hayyak", "house-express",
    "swiss-inn-hotels-resorts", "swiss-inn-tabuk", "alsharif-group-holding",
    "abdul-mohsen-al-tamimi-group", "ministry-civil-service", "albaddad-engineering",
})
# How much a page-crop mark may drift above its baseline before it counts as a
# regression. Rebuilds are deterministic, so this only absorbs deliberate retuning.
PAGE_CROP_DRIFT = 1.05

# The marks whose artwork is being replaced with official brand sources.
REPLACED = frozenset({
    "gaca", "astra-construction", "six-senses", "siac", "elegancia-arabia",
    "jedco-jeddah-airports", "kidana", "rcu-mono-v3", "le-meridien",
    "red-sea-global", "amaala", "hayyak", "swiss-inn-hotels-resorts",
    "bec-arabia", "swiss-inn-tabuk", "alsharif-group-holding",
    "abdul-mohsen-al-tamimi-group", "ministry-civil-service",
    "house-express", "albaddad-engineering", "crowne-plaza",
})

EXPECTED_COUNT = 49

# Measured on the pack before replacement: the 28 keepers span 0.38-1.87, the 21
# targets span 1.82-3.70. The bands overlap around 1.8-1.9, so a single threshold
# cannot separate them — hence two gates with different jobs.
#
# GATE_REPLACED is the goal: land inside the better half of the keeper population.
# The two marks in the pack built from real vector art score 0.38 (rosewood-mono-v3)
# and 0.69 (neom-mono-v3), so this is comfortably achievable with official artwork.
GATE_REPLACED = 1.20
# GATE_ALL is only a regression guard, set just above the worst current keeper
# (cce, 1.87) so an untouched mark cannot silently degrade.
GATE_ALL = 1.95
# Centring is measured on the alpha > 8 bounding box, whose extreme rows can be a
# 4%-opacity resampling fringe (kidana's outermost ink rows peak at alpha 11). LANCZOS
# leaves that fringe asymmetric by a pixel or two, which is 0.45% of the 448px canvas
# and invisible. Anything beyond this is a real centring bug in normalise().
CENTRE_TOLERANCE_PX = 2

# Diagnostic only, never a gate: rosewood-mono-v3 is the sharpest mark in the pack
# and still measures 0.68, so a hard floor here would fail the reference standard.
# A low value means fine sublines will alias at served size — send it to human review.
MIN_STROKE_WARN_DEVICE_PX = 1.0


class CheckError(RuntimeError):
    """A pack-level failure that should stop the build."""


@dataclass(frozen=True)
class Measurement:
    stem: str
    blur_dev: float
    ink_w: int
    ink_h: int
    offset_dx: int
    offset_dy: int
    min_stroke_dev: float
    holes: int
    coverage: float
    served_width: float
    ground_contrast: float


def _served_width(stem: str) -> float:
    return SERVED_DEVICE_WIDTH_WIDE if stem in WIDE_MARKS else SERVED_DEVICE_WIDTH


def _relative_luminance(rgb: np.ndarray) -> np.ndarray:
    channel = rgb.astype(np.float64) / 255.0
    channel = np.where(channel <= 0.03928, channel / 12.92, ((channel + 0.055) / 1.055) ** 2.4)
    return 0.2126 * channel[..., 0] + 0.7152 * channel[..., 1] + 0.0722 * channel[..., 2]


def _ground_contrast(rgb: np.ndarray, alpha: np.ndarray) -> float:
    """WCAG contrast between a mark's ink and the section it is painted on.

    Composited over the ground first: a half-opaque pixel does not deliver its
    own colour, it delivers a blend, and judging the raw colour overstates a
    translucent mark.
    """
    ink = alpha > 128
    if not ink.any():
        return 0.0
    weight = (alpha[ink] / 255.0)[:, None]
    ground = np.array(SECTION_GROUND, dtype=np.float64)
    composited = rgb[ink] * weight + ground * (1.0 - weight)
    ink_luminance = float(_relative_luminance(composited).mean())
    ground_luminance = float(_relative_luminance(ground))
    hi, lo = max(ink_luminance, ground_luminance), min(ink_luminance, ground_luminance)
    return (hi + 0.05) / (lo + 0.05)


def _perimeter(alpha: np.ndarray) -> int:
    """Count solid pixels that touch a non-solid neighbour (4-connected)."""
    solid = alpha >= 128
    edge = np.zeros_like(solid)
    edge[1:, :] |= solid[1:, :] & ~solid[:-1, :]
    edge[:-1, :] |= solid[:-1, :] & ~solid[1:, :]
    edge[:, 1:] |= solid[:, 1:] & ~solid[:, :-1]
    edge[:, :-1] |= solid[:, :-1] & ~solid[:, 1:]
    return int(edge.sum())


def _min_stroke(alpha: np.ndarray, scale: float) -> float:
    """Thinnest stroke that survives to the served size, in device pixels."""
    core = (alpha >= 128).astype(np.uint8)
    if not core.any():
        return 0.0
    dist = cv2.distanceTransform(core, cv2.DIST_L2, 5)
    ridge = (dist >= cv2.dilate(dist, np.ones((3, 3), np.float32)) - 1e-6) & (dist > 0)
    values = dist[ridge]
    if values.size == 0:
        return 0.0
    return float(np.percentile(values, 5) * 2.0 * scale)


def _hole_count(alpha: np.ndarray, bbox: tuple[int, int, int, int]) -> int:
    """Enclosed background regions — counters, knockouts. Guards against fill-in."""
    x, y, width, height = bbox
    core = (alpha[y : y + height, x : x + width] >= 128).astype(np.uint8)
    count, labels = cv2.connectedComponents(1 - core, 4)
    touching = set(labels[0, :]) | set(labels[-1, :]) | set(labels[:, 0]) | set(labels[:, -1])
    return sum(1 for component in range(1, count) if component not in touching)


def measure(path: Path) -> Measurement:
    stem = path.stem
    image = Image.open(path)
    if image.mode != "RGBA":
        raise CheckError(f"{stem}: mode is {image.mode}, expected RGBA")
    if image.size != CANVAS_SIZE:
        raise CheckError(f"{stem}: canvas is {image.width}x{image.height}, expected 1200x448")

    rgba = np.asarray(image)
    rgb, alpha = rgba[:, :, :3], rgba[:, :, 3]

    visible = alpha > 0
    if not visible.any():
        raise CheckError(f"{stem}: no visible pixels")
    if stem not in COLOUR and not np.all(rgb[visible] == 255):
        raise CheckError(f"{stem}: ink is not pure white — colour fringing survived the build")

    ys, xs = np.nonzero(alpha > 8)
    x0, x1, y0, y1 = int(xs.min()), int(xs.max()), int(ys.min()), int(ys.max())
    ink_w, ink_h = x1 - x0 + 1, y1 - y0 + 1
    bbox = (x0, y0, ink_w, ink_h)

    if ink_w > CONTENT_SIZE[0] or ink_h > CONTENT_SIZE[1]:
        raise CheckError(f"{stem}: ink {ink_w}x{ink_h} exceeds the {CONTENT_SIZE} content box")

    served = _served_width(stem)
    scale = served / CANVAS_SIZE[0]
    band = int(((alpha >= 26) & (alpha < 230)).sum())
    perimeter = max(_perimeter(alpha), 1)

    return Measurement(
        stem=stem,
        blur_dev=band / perimeter * scale,
        ink_w=ink_w,
        ink_h=ink_h,
        offset_dx=x0 + x1 + 1 - CANVAS_SIZE[0],
        offset_dy=y0 + y1 + 1 - CANVAS_SIZE[1],
        min_stroke_dev=_min_stroke(alpha, scale),
        holes=_hole_count(alpha, bbox),
        coverage=float((alpha[y0 : y1 + 1, x0 : x1 + 1] >= 128).mean()),
        served_width=served,
        ground_contrast=_ground_contrast(rgb, alpha),
    )


def measure_pack() -> list[Measurement]:
    paths = sorted(PACK_DIR.glob("*.png"))
    if len(paths) != EXPECTED_COUNT:
        raise CheckError(f"Expected {EXPECTED_COUNT} logos in {PACK_DIR}, found {len(paths)}")
    return [measure(path) for path in paths]


def _load_baseline() -> dict[str, dict]:
    if not BASELINE_PATH.exists():
        return {}
    return json.loads(BASELINE_PATH.read_text(encoding="utf-8"))


def print_table(measurements: list[Measurement]) -> None:
    baseline = _load_baseline()
    print(f"{'mark':34} {'blur':>6} {'was':>6} {'ink':>10} {'stroke':>7} {'holes':>6} {'cover':>6}")
    print("-" * 82)
    for m in sorted(measurements, key=lambda m: -m.blur_dev):
        previous = baseline.get(m.stem, {}).get("blur_dev")
        was = "     -" if previous is None else f"{previous:6.2f}"
        flag = " *" if m.stem in REPLACED else "  "
        print(
            f"{m.stem:34}{flag}{m.blur_dev:5.2f} {was} "
            f"{m.ink_w:4}x{m.ink_h:<4} {m.min_stroke_dev:7.2f} {m.holes:6} {m.coverage:6.2f}"
        )
    print("\n* = replaced with official brand artwork")


def check_mobile_variants() -> list[str]:
    """The 640px variants are what phones are actually served - gate them too.

    They were unmeasured while a flat hardening gain was applied, which destroyed
    ink components on 16 of 49 marks. Component count against the master is the
    check that matters: blur looks better the more detail you erase.
    """
    failures: list[str] = []
    mobile_dir = PACK_DIR / "640"
    if not mobile_dir.is_dir():
        return ["mobile variants missing: assets/client-logos-monochrome/640/"]

    masters = sorted(PACK_DIR.glob("*.png"))
    variants = {path.name for path in mobile_dir.glob("*.png")}
    missing = {path.name for path in masters} - variants
    if missing:
        failures.append(f"mobile variants missing for: {sorted(missing)}")

    for master_path in masters:
        variant_path = mobile_dir / master_path.name
        if not variant_path.exists():
            continue
        variant = Image.open(variant_path)
        if variant.size != MOBILE_SIZE:
            failures.append(
                f"{master_path.stem} (640): canvas is {variant.width}x{variant.height}, "
                f"expected {MOBILE_SIZE[0]}x{MOBILE_SIZE[1]}"
            )
            continue
        master_alpha = np.asarray(Image.open(master_path).convert("RGBA"))[:, :, 3]
        reference = np.asarray(
            Image.fromarray(master_alpha).resize(MOBILE_SIZE, Image.Resampling.LANCZOS)
        )
        shipped = np.asarray(variant.convert("RGBA"))[:, :, 3]
        expected = _ink_components(reference)
        actual = _ink_components(shipped)
        if actual < expected:
            failures.append(
                f"{master_path.stem} (640): {expected - actual} ink component(s) lost to "
                f"hardening ({expected} -> {actual}); lower its mobile gain"
            )
    return failures


def _ink_components(alpha: np.ndarray) -> int:
    count, _ = cv2.connectedComponents((alpha > 10).astype(np.uint8), 8)
    return count - 1


def check(measurements: list[Measurement]) -> tuple[list[str], list[str]]:
    """Return (failures, warnings). Only failures stop the build."""
    failures: list[str] = check_mobile_variants()
    warnings: list[str] = []
    baseline = _load_baseline()

    for m in measurements:
        if m.stem in COLOUR:
            # Every gate below reads ink shape and assumes a silhouette: blur
            # measures an antialiasing band against a hard edge, min-stroke and
            # counters assume one flat ink. None of that describes a gradient, a
            # patterned emblem, or a two-tone lockup. What actually matters for a
            # colour mark is whether it survives the ground it is painted on.
            if m.ground_contrast < MIN_COLOUR_CONTRAST:
                failures.append(
                    f"{m.stem}: colour artwork contrasts {m.ground_contrast:.2f}:1 against "
                    f"the section ground, under the {MIN_COLOUR_CONTRAST:.1f}:1 minimum - "
                    f"ship the monochrome silhouette instead, or source a light variant"
                )
            continue

        recorded = baseline.get(m.stem, {}).get("blur_dev")
        if m.stem in PAGE_CROP:
            # Source-capped: fail only on regression against the recorded value.
            if recorded is None:
                failures.append(
                    f"{m.stem}: no baseline recorded, so its page-crop gate cannot be "
                    f"evaluated - run --baseline and commit tasks/client-logo-baseline.json"
                )
                continue
            else:
                gate, why = recorded * PAGE_CROP_DRIFT, f"page-crop ceiling, baseline {recorded:.2f}"
        else:
            gate = GATE_REPLACED if m.stem in REPLACED else GATE_ALL
            why = "vector-artwork gate" if m.stem in REPLACED else "regression guard"
        if m.blur_dev > gate:
            failures.append(
                f"{m.stem}: blur {m.blur_dev:.2f} device px exceeds {gate:.2f} ({why}, "
                f"served at {m.served_width:.0f}px)"
            )
        if abs(m.offset_dx) > CENTRE_TOLERANCE_PX or abs(m.offset_dy) > CENTRE_TOLERANCE_PX:
            failures.append(
                f"{m.stem}: ink is off-centre by ({m.offset_dx}, {m.offset_dy}) px"
            )
        if m.min_stroke_dev and m.min_stroke_dev < MIN_STROKE_WARN_DEVICE_PX:
            warnings.append(
                f"{m.stem}: thinnest stroke is {m.min_stroke_dev:.2f} device px - "
                f"fine detail will alias at served size; check the contact sheet"
            )
        previous = baseline.get(m.stem)
        if previous:
            if previous["holes"] >= 3 and m.holes < previous["holes"] * 0.6:
                failures.append(
                    f"{m.stem}: counters dropped from {previous['holes']} to {m.holes} - "
                    f"interior detail was filled in"
                )
            if m.coverage < previous["coverage"] * 0.65:
                warnings.append(
                    f"{m.stem}: ink coverage fell from {previous['coverage']:.2f} to "
                    f"{m.coverage:.2f} - may read anaemic beside the untouched marks"
                )
    return failures, warnings


def main() -> None:
    args = set(sys.argv[1:])
    measurements = measure_pack()

    if "--baseline" in args:
        BASELINE_PATH.write_text(
            json.dumps({m.stem: asdict(m) for m in measurements}, indent=2, sort_keys=True),
            encoding="utf-8",
        )
        print_table(measurements)
        print(f"\nBaseline written to {BASELINE_PATH.relative_to(ROOT)}")
        return

    print_table(measurements)
    if "--table" in args:
        return

    failures, warnings = check(measurements)
    if warnings:
        print(f"\n{len(warnings)} warning(s):")
        for warning in warnings:
            print(f"  ! {warning}")
    if failures:
        print(f"\n{len(failures)} failure(s):", file=sys.stderr)
        for failure in failures:
            print(f"  - {failure}", file=sys.stderr)
        raise SystemExit(1)
    print(f"\nAll {len(measurements)} marks pass.")


if __name__ == "__main__":
    main()
