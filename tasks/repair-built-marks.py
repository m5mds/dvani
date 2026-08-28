"""Apply pack-level repairs to marks already built into assets/client-logos-monochrome.

The source masters (assets/brand-sources, assets/profile-client-logos, and
divani profile.pdf) are gitignored third-party artwork, so a checkout cannot run
build-client-logo-pack.py. This script performs the subset of repairs that need
only the shipped PNGs, using the same transforms the build uses, so a machine
holding the masters and a machine holding only the repo converge on the same pack.

Three repairs:

  solidify  Raise a flat translucent plate to opaque (build.SOLIDIFY_STEMS). See
            build-client-logo-pack.solidify_alpha for why hardening cannot do it.
  artwork   Rebuild one mark from supplied brand artwork, without needing the rest
            of the masters. This is the path for a logo someone hands over: drop it
            at assets/brand-sources/client-logos/<stem>.<ext> and rebuild just that
            mark. logo_ingest keys on colour distance from the background, so the
            artwork can be any polarity or colour - brown on off-white keys as
            cleanly as white on transparent.
  restore   Take a mark back to an earlier commit whose asset is correct. Used for
            lilac-park, whose replacement at 6fa3a10 inverted the mark: the disc
            became a filled light plate with the LP knocked out and the wordmark
            left at ~35% opacity, measuring 3.85 device px of blur against a 0.95
            baseline. The asset at 6510ac5 is the correct white-on-transparent art.

Both paths regenerate the 640px variant with the build's own per-mark gain search,
so the mobile gate stays satisfied.

Usage:
    python tasks/repair-built-marks.py                     # apply, then report
    python tasks/repair-built-marks.py --dry-run           # report only
    python tasks/repair-built-marks.py --artwork <stem>    # rebuild one mark from
                                                           # supplied brand artwork
"""

from __future__ import annotations

import importlib.util
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]


def _load(name: str, filename: str):
    spec = importlib.util.spec_from_file_location(name, ROOT / "tasks" / filename)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


build = _load("_logo_build", "build-client-logo-pack.py")

PACK_DIR = ROOT / "assets" / "client-logos-monochrome"
MOBILE_DIR = PACK_DIR / "640"

# stem -> commit holding the correct artwork.
RESTORE_FROM = {"lilac-park": "6510ac5"}


def write_mobile(stem: str, master: Image.Image) -> float:
    """Regenerate the 640px variant exactly as build-client-logo-pack.main does."""
    MOBILE_DIR.mkdir(parents=True, exist_ok=True)
    small = master.resize(build.MOBILE_SIZE, Image.Resampling.LANCZOS)
    downscaled = np.asarray(small)[:, :, 3]
    gain = build.mobile_gain(downscaled)
    mobile = Image.new("RGBA", build.MOBILE_SIZE, (255, 255, 255, 0))
    mobile.putalpha(Image.fromarray(build.harden_alpha(downscaled, gain)))
    mobile.save(MOBILE_DIR / f"{stem}.png", optimize=True)
    return gain


def restore(stem: str, revision: str, *, dry_run: bool) -> str:
    path = PACK_DIR / f"{stem}.png"
    blob = subprocess.run(
        ["git", "show", f"{revision}:assets/client-logos-monochrome/{stem}.png"],
        capture_output=True,
        cwd=ROOT,
    )
    if blob.returncode != 0:
        raise RuntimeError(f"{stem}: cannot read {revision} ({blob.stderr.decode().strip()})")
    if dry_run:
        return f"{stem}: would restore from {revision}"
    path.write_bytes(blob.stdout)
    gain = write_mobile(stem, Image.open(path).convert("RGBA"))
    return f"{stem}: restored from {revision}, mobile gain {gain}"


def solidify(stem: str, *, dry_run: bool) -> str:
    path = PACK_DIR / f"{stem}.png"
    image = Image.open(path).convert("RGBA")
    alpha = np.asarray(image)[:, :, 3]
    repaired = build.solidify_alpha(alpha)
    ink = alpha > 13
    before = ((alpha >= 38) & (alpha <= 217)).sum() / max(ink.sum(), 1) * 100
    after = ((repaired >= 38) & (repaired <= 217)).sum() / max((repaired > 13).sum(), 1) * 100
    if dry_run:
        return f"{stem}: would solidify, partial alpha {before:.1f}% -> {after:.1f}%"
    image.putalpha(Image.fromarray(repaired, mode="L"))
    image.save(path, optimize=True)
    gain = write_mobile(stem, image)
    return f"{stem}: solidified, partial alpha {before:.1f}% -> {after:.1f}%, mobile gain {gain}"


def from_artwork(stem: str, *, dry_run: bool) -> str:
    """Rebuild a single mark from official artwork dropped into brand-sources."""
    source = build.resolve_brand_source(f"{stem}.png")
    if source is None:
        searched = ", ".join(f"{stem}{ext}" for ext in build.BRAND_EXTS)
        raise SystemExit(
            f"No artwork for {stem!r}. Put the file in "
            f"{build.BRAND_DIR.relative_to(ROOT)}/ named exactly one of: {searched}"
        )
    if stem not in {p.stem for p in PACK_DIR.glob("*.png")}:
        raise SystemExit(f"{stem!r} is not a mark in the pack")
    if dry_run:
        return f"{stem}: would rebuild from {source.name}"

    master = build.build_from_brand_source(f"{stem}.png", source)
    if stem in build.SOLIDIFY_STEMS:
        solid = build.solidify_alpha(np.asarray(master)[:, :, 3])
        master.putalpha(Image.fromarray(solid, mode="L"))
    master.save(PACK_DIR / f"{stem}.png", optimize=True)
    gain = write_mobile(stem, master)
    return f"{stem}: rebuilt from {source.name}, mobile gain {gain}"


def main() -> None:
    dry_run = "--dry-run" in sys.argv
    if "--artwork" in sys.argv:
        stem = sys.argv[sys.argv.index("--artwork") + 1]
        print(f"  {from_artwork(stem, dry_run=dry_run)}")
        print("Dry run - nothing written." if dry_run else "Rebuilt. Now run: "
              "python tasks/check-client-logo-pack.py")
        return
    for stem, revision in sorted(RESTORE_FROM.items()):
        print(f"  {restore(stem, revision, dry_run=dry_run)}")
    for stem in sorted(build.SOLIDIFY_STEMS):
        print(f"  {solidify(stem, dry_run=dry_run)}")
    print("Dry run - nothing written." if dry_run else "Repairs applied.")


if __name__ == "__main__":
    main()
