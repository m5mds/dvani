"""Search a hardening gain per mark, then hand the result to human review.

blur_dev must NOT be the objective. Task 3 proved it mismeasures these marks:
elegancia-arabia scored worse (2.80 -> 3.02) while becoming dramatically more
legible, because newly-resolved fine text adds antialiasing perimeter. Minimising
blur_dev would select whichever gain destroys the most detail.

So: reject any gain that loses holes or components against gain 1.0 - that is a
counter closing or a diacritic being swallowed - then prefer the highest surviving
gain, and let the contact sheet make the final call.
"""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("chk", ROOT / "tasks" / "check-client-logo-pack.py")
chk = importlib.util.module_from_spec(spec)
sys.modules["chk"] = chk
spec.loader.exec_module(chk)

TARGETS = sorted(chk.REPLACED)
SEARCH = [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0]
SCRATCH = ROOT / "tasks" / "harden-search"


def harden(alpha: np.ndarray, gain: float) -> np.ndarray:
    if gain <= 1.0:
        return alpha
    scaled = alpha.astype(np.float32) / 255.0
    return (np.clip((scaled - 0.5) * gain + 0.5, 0.0, 1.0) * 255.0).astype(np.uint8)


def main() -> None:
    SCRATCH.mkdir(parents=True, exist_ok=True)
    print(f"{'mark':30} {'gain':>5} {'blur':>6} {'holes':>6} {'parts':>6} {'cover':>6}  note")
    print("-" * 78)
    chosen: dict[str, float] = {}
    for stem in TARGETS:
        source = ROOT / "assets" / "client-logos-monochrome" / f"{stem}.png"
        image = Image.open(source).convert("RGBA")
        alpha = np.asarray(image)[:, :, 3]

        rows = []
        for gain in SEARCH:
            out = Image.new("RGBA", image.size, (255, 255, 255, 0))
            out.putalpha(Image.fromarray(harden(alpha, gain)))
            probe = SCRATCH / f"{stem}@{gain}.png"
            out.save(probe)
            m = chk.measure(probe)
            rows.append((gain, m.blur_dev, m.holes, _components(probe), m.coverage))

        base = rows[0]  # gain 1.0 - the untouched reference
        # Reject any gain that erases structure: a closed counter or a swallowed
        # diacritic. This, not blur_dev, is the failure mode that matters.
        safe = [r for r in rows if r[2] >= base[2] and r[3] >= base[3]]
        gain, blur, holes, parts, cover = (safe[-1] if safe else base)  # highest surviving
        chosen[stem] = gain
        note = "detail preserved" if safe else "NO SAFE GAIN - left unhardened"
        if safe and gain == 1.0:
            note = "no gain survived detail check"
        print(f"{stem:30} {gain:5.1f} {blur:6.2f} {holes:6} {parts:6} {cover:6.2f}  {note}")
        for g, b, h, p, c in rows:
            flag = "  <- chosen" if g == gain else ("  rejected: lost detail" if (h < base[2] or p < base[3]) else "")
            print(f"{'':30} {g:5.1f} {b:6.2f} {h:6} {p:6} {c:6.2f}{flag}")

    print("\nHARDEN_GAINS = {")
    for stem, gain in sorted(chosen.items()):
        if gain > 1.0:
            print(f'    "{stem}": {gain},')
    print("}")
    print("\nblur is REPORTED, not optimised. The contact sheet in Step 5 is the gate.")


def _components(path: Path) -> int:
    import cv2
    alpha = np.asarray(Image.open(path).convert("RGBA"))[:, :, 3]
    count, _ = cv2.connectedComponents((alpha > 10).astype(np.uint8), 8)
    return count - 1


if __name__ == "__main__":
    main()
