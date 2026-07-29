from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from logo_ingest import SourceError, describe, ingest  # noqa: E402


ROOT = Path(__file__).resolve().parents[1]
PROFILE_DIR = ROOT / "assets" / "profile-client-logos"
OFFICIAL_DIR = ROOT / "assets" / "hires" / "client-logos"
OUTPUT_DIR = ROOT / "assets" / "client-logos-monochrome"
CANVAS_SIZE = (1200, 448)
CONTENT_SIZE = (1080, 320)

# Official brand artwork, which supersedes the PDF-derived sources above. Every
# mark here traces back to divani profile.pdf, whose pages are 1650x928 JPEGs at
# 150 DPI; individual logos occupy only 47x20 to 384x108 px there, against the
# ~518 device px the marquee paints at 2x DPR. Those crops cannot be sharpened,
# only replaced. See tasks/lessons.md "Upscaling Is Not Image Quality".
BRAND_DIR = ROOT / "assets" / "brand-sources" / "client-logos"
BRAND_CACHE = ROOT / "assets" / "brand-sources" / ".cache"
RASTERISER = ROOT / "tasks" / "rasterise-brand-svg.js"
BRAND_EXTS = (".svg", ".png", ".webp", ".jpg", ".jpeg")
# Rasterise SVGs so the ink itself carries at least this much detail on its long
# edge - twice the content box, so the LANCZOS fit always downsamples.
BRAND_INK_TARGET = 2 * max(CONTENT_SIZE)
BRAND_RASTER_MAX = 6000

# The 21 marks measured as soft at served size. Every one must be replaced, or the
# build fails - a typo in a source filename must not silently ship the blurry mark.
BRAND_EXPECTED = frozenset({
    "gaca", "astra-construction", "six-senses", "siac", "elegancia-arabia",
    "jedco-jeddah-airports", "kidana", "rcu-mono-v3", "le-meridien",
    "red-sea-global", "amaala", "hayyak", "swiss-inn-hotels-resorts",
    "bec-arabia", "swiss-inn-tabuk", "alsharif-group-holding",
    "abdul-mohsen-al-tamimi-group", "ministry-civil-service",
    "house-express", "albaddad-engineering", "crowne-plaza",
})

OFFICIAL_FILES = (
    "siac.png",
    "amaala.png",
    "red-sea-global.png",
    "rcu-mono-v3.png",
    "hayyak.png",
    "bec-arabia.png",
    "neom-mono-v3.png",
    "gaca.png",
    "six-senses.png",
    "le-meridien.png",
    "house-express.png",
    "rosewood-mono-v3.png",
    "crowne-plaza.png",
)

OFFICIAL_ALPHA_FLOORS = {
    "siac.png": 82,
    "bec-arabia.png": 136,
    "crowne-plaza.png": 136,
    "house-express.png": 82,
    "six-senses.png": 104,
}

PROFILE_FILES = (
    "jedco-jeddah-airports.png",
    "watania-business-group.png",
    "ibtech.png",
    "mastery-house.png",
    "alsharif-group-holding.png",
    "elegancia-arabia.png",
    "diriyah-company.png",
    "cce.png",
    "mas-engineering-construction.png",
    "havelock-one.png",
    "astra-construction.png",
    "alfanar-engineering-services.png",
    "china-comservice.png",
    "national-housing-company.png",
    "albaddad-engineering.png",
    "al-tanfeethi.png",
    "abdul-mohsen-al-tamimi-group.png",
    "kidana.png",
    "ministry-civil-service.png",
    "civil-affairs.png",
    "national-talents-company.png",
    "raleen-hotel-resorts.png",
    "aris-star.png",
    "swiss-inn-hotels-resorts.png",
    "swiss-inn-tabuk.png",
    "lilac-park.png",
    "five-seasons-hotel.png",
    "skyline-tabuk-hotel.png",
    "marvelous-hotel.png",
    "rose-land.png",
    "hikari-sushi-lounge.png",
    "diwan-al-kashi.png",
    "top-grill.png",
    "north-coffee.png",
    "hirola.png",
    "mazyan.png",
)


def clean_alpha(alpha: np.ndarray, floor: int = 7) -> np.ndarray:
    alpha = alpha.astype(np.float32)
    gain = 255.0 / max(1.0, 255.0 - float(floor))
    alpha = np.clip((alpha - float(floor)) * gain, 0.0, 255.0).astype(np.uint8)
    binary = (alpha > 10).astype(np.uint8)
    count, labels, stats, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)
    for component in range(1, count):
        if stats[component, cv2.CC_STAT_AREA] < 4:
            alpha[labels == component] = 0
    return alpha


def normalise(
    source: Path,
    *,
    trim_right: float = 1.0,
    alpha_floor: int = 7,
    alpha: np.ndarray | None = None,
) -> Image.Image:
    """Crop, fit, and centre a mark on the shared canvas.

    Passing `alpha` skips the legacy alpha-channel read and uses a mask prepared by
    logo_ingest instead. Everything below the branch is shared, so marks built from
    the original sources stay byte-identical.
    """
    if alpha is None:
        image = Image.open(source).convert("RGBA")
        if trim_right < 1.0:
            image = image.crop((0, 0, round(image.width * trim_right), image.height))
        rgba = np.asarray(image).copy()
        alpha = clean_alpha(rgba[:, :, 3], alpha_floor)
    points = cv2.findNonZero((alpha > 8).astype(np.uint8))
    if points is None:
        raise RuntimeError(f"No visible logo pixels in {source}")
    x, y, width, height = cv2.boundingRect(points)
    alpha = alpha[y : y + height, x : x + width]
    logo = Image.new("RGBA", (width, height), (255, 255, 255, 0))
    logo.putalpha(Image.fromarray(alpha, mode="L"))
    scale = min(CONTENT_SIZE[0] / width, CONTENT_SIZE[1] / height)
    rendered_size = (max(1, round(width * scale)), max(1, round(height * scale)))
    logo = logo.resize(rendered_size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", CANVAS_SIZE, (255, 255, 255, 0))
    offset = ((CANVAS_SIZE[0] - logo.width) // 2, (CANVAS_SIZE[1] - logo.height) // 2)
    canvas.alpha_composite(logo, offset)
    return canvas


def resolve_brand_source(filename: str) -> Path | None:
    """Official artwork for a mark, if it has been supplied.

    The stem must match the output filename exactly. That is not cosmetic:
    home-monumental.css keys on `img[src$="/gaca.png"]` and on the three
    `-mono-v3.png` names, so renaming an output would silently drop its CSS rule.
    """
    stem = Path(filename).stem
    for extension in BRAND_EXTS:
        candidate = BRAND_DIR / f"{stem}{extension}"
        if candidate.exists():
            return candidate
    return None


def rasterise_svg(source: Path, target: int) -> Path:
    destination = BRAND_CACHE / f"{source.stem}@{target}.png"
    if destination.exists():
        return destination
    BRAND_CACHE.mkdir(parents=True, exist_ok=True)
    result = subprocess.run(
        ["node", str(RASTERISER), str(source), str(destination), str(target)],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise SourceError(f"{source.name}: {result.stderr.strip() or 'rasterisation failed'}")
    return destination


def prepare_brand_raster(source: Path) -> tuple[Path, object]:
    """Resolve official artwork to a raster whose *ink* carries enough detail.

    Rasterising an SVG to a fixed canvas size is not sufficient: art sitting inside
    a large whitespace viewBox would come out mostly empty. So measure the ink after
    ingesting, and re-render larger if the mark itself is under-resolved.
    """
    if source.suffix.lower() != ".svg":
        return source, ingest(source)[1]

    target = BRAND_INK_TARGET
    raster = rasterise_svg(source, target)
    _, report = ingest(raster)

    # What matters is that the LANCZOS fit never has to enlarge - not that the ink
    # hits some absolute pixel count. A wide mark like RCU fits the 1080x320 box at
    # 0.5x and is already supersampled; a mark stranded inside a large whitespace
    # viewBox comes out small and needs another pass at higher density.
    if report.fit_scale > 1.0:
        target = min(BRAND_RASTER_MAX, int(target * report.fit_scale) + 1)
        raster = rasterise_svg(source, target)
        _, report = ingest(raster)
        if report.fit_scale > 1.0:
            _, _, ink_w, ink_h = report.ink_bbox
            raise SourceError(
                f"{source.name}: ink is only {ink_w}x{ink_h} even rendered at {target}px - "
                f"the artwork lacks real vector detail"
            )
    return raster, report


def build_from_brand_source(filename: str, source: Path) -> Image.Image:
    raster, _ = prepare_brand_raster(source)
    alpha, report = ingest(raster)
    print(f"  {describe(filename, report)}")
    if report.upscales:
        raise SourceError(
            f"{filename}: {source.name} would be enlarged {report.fit_scale:.2f}x to fill "
            f"the content box - supply larger artwork rather than upscaling again"
        )
    return normalise(raster, alpha=alpha)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    expected = set(OFFICIAL_FILES) | set(PROFILE_FILES)
    if len(expected) != 49:
        raise RuntimeError(f"Expected 49 unique logos, found {len(expected)}")
    if "al-eiman.png" in expected:
        raise RuntimeError("The false Al Eiman split must not enter the authoritative logo pack")

    replaced: set[str] = set()
    for filename in OFFICIAL_FILES + PROFILE_FILES:
        brand = resolve_brand_source(filename)
        if brand is not None:
            output = build_from_brand_source(filename, brand)
            replaced.add(Path(filename).stem)
        elif filename in OFFICIAL_FILES:
            output = normalise(
                OFFICIAL_DIR / filename, alpha_floor=OFFICIAL_ALPHA_FLOORS.get(filename, 7)
            )
        else:
            trim_right = 0.86 if filename == "top-grill.png" else 1.0
            output = normalise(PROFILE_DIR / filename, trim_right=trim_right)
        output.save(OUTPUT_DIR / filename, optimize=True)

    # Fail closed. A misspelt source filename would otherwise fall through to the
    # legacy path, keep the blurry mark, and still report success.
    stems = {Path(name).stem for name in expected}
    stray = {path.stem for path in BRAND_DIR.glob("*") if path.suffix in BRAND_EXTS} - stems
    if stray:
        raise RuntimeError(
            f"Brand sources whose stem matches no output: {sorted(stray)}; "
            f"rename them to match the target PNG exactly"
        )
    outstanding = BRAND_EXPECTED - replaced
    if outstanding and os.environ.get("LOGO_PACK_PARTIAL") != "1":
        raise RuntimeError(
            f"Official artwork still missing for {len(outstanding)} mark(s): "
            f"{sorted(outstanding)}. Set LOGO_PACK_PARTIAL=1 to build anyway while sourcing."
        )

    produced = {path.name for path in OUTPUT_DIR.glob("*.png")}
    missing = expected - produced
    unexpected = produced - expected
    if missing or unexpected:
        raise RuntimeError(f"Logo pack mismatch; missing={sorted(missing)}, unexpected={sorted(unexpected)}")
    note = f", {len(replaced)} from official brand artwork" if replaced else ""
    print(f"Created {len(produced)} monochrome client logos in {OUTPUT_DIR}{note}")
    if outstanding:
        print(f"WARNING: {len(outstanding)} mark(s) still on legacy sources: {sorted(outstanding)}")


if __name__ == "__main__":
    main()
