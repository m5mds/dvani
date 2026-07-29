#!/usr/bin/env node
"use strict";

/**
 * Rasterise an official brand SVG into a high-resolution transparent PNG.
 *
 * The point of replacing the client logos is to get real detail, so this must
 * render the vector natively at the target size. librsvg reports an SVG at 72 DPI
 * by default; rasterising at that and resizing up would reproduce exactly the
 * blur we are removing. So we read the intrinsic size, compute a density, and
 * re-open the file so librsvg renders at full resolution from the start.
 *
 * Live <text>/<tspan> is rejected outright: librsvg substitutes a system font and
 * renders the WRONG wordmark at perfect sharpness, which no downstream numeric
 * check can catch.
 *
 * An embedded <image> is only warned about. It is tempting to reject those as
 * "a bitmap in a vector wrapper", but brand SVGs routinely carry a raster
 * *gradient fill* clipped by vector paths - the geometry is still vector, and the
 * pack discards colour and keeps only the silhouette, so the fill is irrelevant.
 * Whether the mark is genuinely sharp is decided downstream by the blur gate in
 * check-client-logo-pack.py, which measures the real outcome instead of guessing
 * from the markup.
 *
 * Usage: node tasks/rasterise-brand-svg.js <input.svg> <output.png> [targetPx]
 */

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");

// sharp is not a declared dependency of this repo - it comes along with the
// vendored Next.js project. Resolve it explicitly so the failure is legible.
const SHARP_CANDIDATES = [
  path.join(ROOT, "node_modules", "sharp"),
  path.join(ROOT, "deco deployment", "deco-corners-v1-old-main", "node_modules", "sharp"),
];

const DEFAULT_TARGET = 2400;
const MAX_TARGET = 6000;
const MAX_DENSITY = 4000;

function loadSharp() {
  const found = SHARP_CANDIDATES.find((candidate) => fs.existsSync(candidate));
  if (!found) {
    throw new Error(
      `sharp not found. Looked in:\n  ${SHARP_CANDIDATES.join("\n  ")}\n` +
        `Install it, or supply a high-resolution PNG instead of an SVG.`
    );
  }
  return require(found);
}

function intrinsicSize(sharp, svgPath, markup) {
  return sharp(svgPath, { unlimited: true })
    .metadata()
    .then(({ width, height }) => {
      if (width > 4 && height > 4) {
        return { width, height };
      }
      // Percentage-width or viewBox-only SVGs report no usable intrinsic size.
      const match = /viewBox\s*=\s*["']([\d.eE+\-\s,]+)["']/.exec(markup);
      if (!match) {
        throw new Error(`${path.basename(svgPath)}: no usable intrinsic size and no viewBox`);
      }
      const parts = match[1].trim().split(/[\s,]+/).map(Number);
      if (parts.length < 4 || !(parts[2] > 0) || !(parts[3] > 0)) {
        throw new Error(`${path.basename(svgPath)}: unreadable viewBox "${match[1]}"`);
      }
      return { width: parts[2], height: parts[3] };
    });
}

function assertRenderable(svgPath, markup) {
  const name = path.basename(svgPath);
  if (/<text[\s>]|<tspan[\s>]/i.test(markup)) {
    throw new Error(
      `${name}: contains live <text>. librsvg will substitute a system font and ` +
        `render the wrong wordmark at full sharpness. Re-export with text converted to outlines.`
    );
  }
  if (/<image[\s>]/i.test(markup) || /data:image\//i.test(markup)) {
    // Usually a gradient fill behind a vector clip path, which is harmless here.
    // If the raster really does carry the geometry, the blur gate will fail it.
    process.stderr.write(
      `  ! ${name}: embeds a raster image; if it carries the geometry rather than a ` +
        `fill, the sharpness gate will reject the result\n`
    );
  }
  if (/<filter[\s>]/i.test(markup)) {
    process.stderr.write(`  ! ${name}: contains <filter>; check no blur is baked in\n`);
  }
}

async function rasterise(svgPath, outPath, options = {}) {
  const target = Math.min(MAX_TARGET, options.target || DEFAULT_TARGET);
  const sharp = options.sharp || loadSharp();
  const markup = fs.readFileSync(svgPath, "utf8");

  assertRenderable(svgPath, markup);

  const { width, height } = await intrinsicSize(sharp, svgPath, markup);
  const long = Math.max(width, height);
  const density = Math.max(72, Math.min(MAX_DENSITY, Math.ceil(72 * (target / long))));

  await sharp(svgPath, { density, unlimited: true })
    .resize({
      width: Math.round((width * target) / long),
      height: Math.round((height * target) / long),
      fit: "inside",
      withoutEnlargement: true,
      kernel: "lanczos3",
    })
    .png({ compressionLevel: 9, palette: false })
    .toFile(outPath);

  return { width, height, density, target, output: outPath };
}

async function main() {
  const [input, output, target] = process.argv.slice(2);
  if (!input || !output) {
    process.stderr.write("usage: node tasks/rasterise-brand-svg.js <input.svg> <output.png> [targetPx]\n");
    process.exit(2);
  }
  fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
  const result = await rasterise(path.resolve(input), path.resolve(output), {
    target: target ? Number(target) : undefined,
  });
  process.stdout.write(
    `${path.basename(input)} ${result.width}x${result.height} @ ${result.density}dpi ` +
      `-> ${result.target}px long edge\n`
  );
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  });
}

module.exports = { rasterise, loadSharp, assertRenderable, DEFAULT_TARGET, MAX_TARGET };
