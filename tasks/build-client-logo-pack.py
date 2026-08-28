from __future__ import annotations

import io
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
PROFILE_PDF = Path.home() / "Downloads" / "Divani" / "divani profile.pdf"
CANVAS_SIZE = (1200, 448)
CONTENT_SIZE = (1080, 320)
MOBILE_DIR = OUTPUT_DIR / "640"
MOBILE_SIZE = (640, 239)   # covers the 546 device px a DPR-3 phone paints at 182 CSS px

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

# Fresh crops from divani profile.pdf pages 7-10, in 1650x928 page coordinates.
# These replace the legacy double-upscaled sources: the old path was
# ~300px crop -> 4x GDI+ bicubic -> LANCZOS rescale, and the second resample is
# why marks like astra-construction render with holes in the wordmark.
PROFILE_PAGE_CROPS: dict[str, tuple[int, int, int, int, int]] = {
    # stem: (page, left, top, right, bottom)
    "astra-construction": (8, 52, 188, 272, 342),
    "hayyak": (8, 1325, 210, 1605, 345),
    "kidana": (8, 645, 450, 895, 545),
    "albaddad-engineering": (8, 970, 270, 1265, 335),
    "siac": (7, 56, 274, 370, 362),
    "jedco-jeddah-airports": (7, 425, 273, 741, 361),
    "alsharif-group-holding": (7, 416, 482, 703, 601),
    "elegancia-arabia": (7, 1105, 500, 1390, 620),
    "abdul-mohsen-al-tamimi-group": (8, 296, 447, 628, 540),
    "ministry-civil-service": (8, 950, 409, 1189, 540),
    "six-senses": (9, 69, 159, 327, 342),
    "house-express": (9, 835, 205, 1105, 372),
    "swiss-inn-hotels-resorts": (9, 822, 488, 1100, 579),
    "swiss-inn-tabuk": (9, 1202, 455, 1594, 579),
}

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

# Narrows the soft antialiasing fringe left by PDF-derived sources while keeping
# some antialiasing. Per mark, never global: gain 4 sharpens hayyak and kidana but
# erodes astra-construction's thin strokes. See tasks/lessons.md:249.
HARDEN_GAINS: dict[str, float] = {
    "astra-construction": 1.5,
    "elegancia-arabia": 1.5,
    "jedco-jeddah-airports": 1.5,
}

# Gains tried for the mobile variant, strongest first.
MOBILE_GAIN_SEARCH = (4.0, 3.5, 3.0, 2.5, 2.0, 1.5)


def harden_alpha(alpha: np.ndarray, gain: float) -> np.ndarray:
    if gain <= 1.0:
        return alpha
    scaled = alpha.astype(np.float32) / 255.0
    return (np.clip((scaled - 0.5) * gain + 0.5, 0.0, 1.0) * 255.0).astype(np.uint8)


def solidify_alpha(alpha: np.ndarray, ink_threshold: int = 26, band: int = 1) -> np.ndarray:
    """Raise flat translucent interiors to opaque, leaving the antialias fringe alone.

    Some official artwork carries a symbol as a flat mid-opacity plate rather than
    solid ink - astra-construction's aperture sits at alpha 110/255 with a standard
    deviation of 13.9, i.e. deliberately half transparent. `ingest()` keys shape
    correctly but preserves that opacity, so the symbol paints mid-grey next to a
    solid-white wordmark and the mark reads as two-tone on the dark marquee.

    Hardening cannot fix it: harden_alpha pivots about 0.5, so a 0.43 plate is
    pushed *down*, not up. Multiplying the channel would saturate the plate but
    also fatten every antialiased edge.

    So solidify by position instead of by value: erode the ink mask by one pixel
    and set everything that survives - the interior - to opaque, leaving the
    single-pixel boundary band at whatever alpha it had. Counters are unaffected
    because a counter is alpha 0 and never enters the mask.
    """
    mask = (alpha > ink_threshold).astype(np.uint8)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * band + 1, 2 * band + 1))
    interior = cv2.erode(mask, kernel, iterations=1).astype(bool)
    solid = alpha.copy()
    solid[interior] = 255
    return solid


# Marks whose artwork carries a translucent plate rather than solid ink. Measured,
# not guessed: every other mark in the pack is >= 97% opaque over its interior.
SOLIDIFY_STEMS = frozenset({"cce", "astra-construction", "diriyah-company"})


def ink_components(alpha: np.ndarray) -> int:
    count, _ = cv2.connectedComponents((alpha > 10).astype(np.uint8), 8)
    return count - 1


def mobile_gain(alpha: np.ndarray) -> float:
    """Strongest hardening the downscaled mark survives without losing ink.

    The mobile variant is what phones are actually served, so it needs the same
    detail-preservation rule the masters get - not a flat gain. A hardcoded 4.0
    destroyed ink components on 16 of 49 marks, including neom-mono-v3 (pristine
    vector art) and jedco-jeddah-airports, whose master was deliberately capped at
    1.5 because higher gains broke its subtext. Hardening compresses far better, so
    take the most it tolerates rather than skipping it: per-mark search lands the
    pack at ~630 KB against 1109 KB unhardened and 365 KB for the damaging flat 4.0.
    """
    baseline = ink_components(alpha)
    for gain in MOBILE_GAIN_SEARCH:
        if ink_components(harden_alpha(alpha, gain)) >= baseline:
            return gain
    return 1.0


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


def build_from_brand_source(
    filename: str, source: Path, *, allow_upscale: bool = False
) -> Image.Image:
    raster, _ = prepare_brand_raster(source)
    alpha, report = ingest(raster)
    print(f"  {describe(filename, report)}")
    gain = HARDEN_GAINS.get(Path(filename).stem, 1.0)
    if gain > 1.0:
        alpha = harden_alpha(alpha, gain)
    if report.upscales and not allow_upscale:
        raise SourceError(
            f"{filename}: {source.name} would be enlarged {report.fit_scale:.2f}x to fill "
            f"the content box - supply larger artwork rather than upscaling again"
        )
    return normalise(raster, alpha=alpha)


def profile_page_source(stem: str) -> Path | None:
    """Cache a native-resolution colour crop from the profile pages."""
    entry = PROFILE_PAGE_CROPS.get(stem)
    if entry is None:
        return None
    page, *box = entry
    destination = BRAND_CACHE / f"page-crop-{stem}.png"
    if destination.exists():
        return destination
    BRAND_CACHE.mkdir(parents=True, exist_ok=True)
    import fitz
    with fitz.open(PROFILE_PDF) as doc:
        xref = doc[page - 1].get_images(full=True)[0][0]
        image = Image.open(io.BytesIO(doc.extract_image(xref)["image"])).convert("RGB")
    image.crop(tuple(box)).save(destination)
    return destination


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    expected = set(OFFICIAL_FILES) | set(PROFILE_FILES)
    if len(expected) != 49:
        raise RuntimeError(f"Expected 49 unique logos, found {len(expected)}")
    if "al-eiman.png" in expected:
        raise RuntimeError("The false Al Eiman split must not enter the authoritative logo pack")

    replaced: set[str] = set()
    mobile_reduced: list[tuple[str, float]] = []
    for filename in OFFICIAL_FILES + PROFILE_FILES:
        brand = resolve_brand_source(filename)
        from_page_crop = False
        if brand is None:
            brand = profile_page_source(Path(filename).stem)
            from_page_crop = brand is not None
        if brand is not None:
            output = build_from_brand_source(filename, brand, allow_upscale=from_page_crop)
            replaced.add(Path(filename).stem)
        elif filename in OFFICIAL_FILES:
            output = normalise(
                OFFICIAL_DIR / filename, alpha_floor=OFFICIAL_ALPHA_FLOORS.get(filename, 7)
            )
        else:
            # WARNING: this crop is wrong and cannot be fixed from the built PNG.
            # It was added to cut a background box artifact off the right of the
            # top-grill source, but 0.86 also slices the wordmark mid-glyph: the
            # mark ships reading "TOP GRILI" with the final L reduced to a bare
            # stem, and a grey remnant of the box survives anyway. Re-crop the
            # source so the full wordmark is kept, then drop this special case.
            trim_right = 0.86 if filename == "top-grill.png" else 1.0
            output = normalise(PROFILE_DIR / filename, trim_right=trim_right)

        # Applied to the finished canvas, not inside one source branch: the three
        # affected marks arrive by two different routes (astra-construction as a
        # page crop, cce and diriyah-company on the legacy profile path).
        if Path(filename).stem in SOLIDIFY_STEMS:
            solid = solidify_alpha(np.asarray(output)[:, :, 3])
            output.putalpha(Image.fromarray(solid, mode="L"))

        output.save(OUTPUT_DIR / filename, optimize=True)

        # Downscale first, then harden: resampling a hardened mask reintroduces
        # intermediate alpha values that compress worse than hardening after.
        MOBILE_DIR.mkdir(parents=True, exist_ok=True)
        small = output.resize(MOBILE_SIZE, Image.Resampling.LANCZOS)
        downscaled = np.asarray(small)[:, :, 3]
        gain = mobile_gain(downscaled)
        mobile = Image.new("RGBA", MOBILE_SIZE, (255, 255, 255, 0))
        mobile.putalpha(Image.fromarray(harden_alpha(downscaled, gain)))
        mobile.save(MOBILE_DIR / filename, optimize=True)
        if gain < MOBILE_GAIN_SEARCH[0]:
            mobile_reduced.append((Path(filename).stem, gain))

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
    if mobile_reduced:
        print(f"  mobile variant gain reduced to preserve ink on {len(mobile_reduced)} mark(s):")
        for stem, gain in sorted(mobile_reduced):
            print(f"    {stem:32} {gain}")
    note = f", {len(replaced)} from official brand artwork" if replaced else ""
    print(f"Created {len(produced)} monochrome client logos in {OUTPUT_DIR}{note}")
    if outstanding:
        print(f"WARNING: {len(outstanding)} mark(s) still on legacy sources: {sorted(outstanding)}")


if __name__ == "__main__":
    main()
