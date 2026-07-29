"""Locate each client logo on profile pages 7-10 and propose a crop box.

The pages are flat 1650x928 JPEGs. Detection finds ink blobs against the dark
plate; a human then confirms each box, because adjacent marks can merge.
"""

from __future__ import annotations

import io
from pathlib import Path

import cv2
import fitz
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PDF = Path.home() / "Downloads" / "Divani" / "divani profile.pdf"
PAGES = (7, 8, 9, 10)
PAD = 8


def page_image(doc: fitz.Document, number: int) -> Image.Image:
    xref = doc[number - 1].get_images(full=True)[0][0]
    return Image.open(io.BytesIO(doc.extract_image(xref)["image"])).convert("RGB")


def detect(image: Image.Image) -> list[tuple[int, int, int, int]]:
    grey = cv2.cvtColor(np.asarray(image), cv2.COLOR_RGB2GRAY)
    plate = float(np.median(grey))
    ink = (np.abs(grey.astype(np.int16) - plate) > 38).astype(np.uint8)
    # Join glyphs within a mark without bridging neighbouring marks.
    ink = cv2.morphologyEx(ink, cv2.MORPH_CLOSE, np.ones((9, 25), np.uint8))
    count, _, stats, _ = cv2.connectedComponentsWithStats(ink, 8)
    boxes = []
    for c in range(1, count):
        x, y, w, h, area = stats[c]
        if area < 2500 or w < 40 or h < 18:
            continue
        boxes.append((max(0, x - PAD), max(0, y - PAD),
                      min(image.width, x + w + PAD), min(image.height, y + h + PAD)))
    return sorted(boxes, key=lambda b: (b[1] // 90, b[0]))


def main() -> None:
    doc = fitz.open(PDF)
    out = ROOT / "tasks" / "crop-preview"
    out.mkdir(parents=True, exist_ok=True)
    for number in PAGES:
        image = page_image(doc, number)
        boxes = detect(image)
        print(f"page {number}: {len(boxes)} candidates")
        for index, box in enumerate(boxes):
            print(f"    {index:02d} {box}  {box[2]-box[0]}x{box[3]-box[1]}")
            image.crop(box).save(out / f"p{number}-{index:02d}.png")


if __name__ == "__main__":
    main()
