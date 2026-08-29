#!/usr/bin/env node
"use strict";

/**
 * Verify the mobile client-logo and projects behaviour in a real compositing browser.
 *
 * The in-app browser pane used during development does not composite - its
 * `visibilityState` is "hidden" and `requestAnimationFrame` never ticks - so no
 * IntersectionObserver on the page ever fires. That makes it useless for checking
 * anything observer-driven: the deferred marquee build, and the projects entrance
 * motion, both look broken there even when they are correct. Headless Chrome with
 * `--headless=new` composites properly and does fire observers.
 *
 * Checks, per locale:
 *   1. Cold load, no scroll  -> zero client-logo requests (the marquee is deferred)
 *   2. Scroll to #relationships -> marquee builds, 50 marks, served from /640/
 *   3. Scroll to #selected-work -> project chapters receive .is-entered
 *
 * Usage: node tasks/verify-mobile.js [port]
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const { startStaticServer } = require("./serve-static");

const CHROME_CANDIDATES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
];
// The list above is Windows-only, so this harness could not run on Linux or in
// CI. CHROME_PATH takes precedence; the Linux fallbacks below cover a container
// (including the Playwright browser bundle) without needing it set.
const LINUX_CANDIDATES = [
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
];
const CHROME_EXE = [process.env.CHROME_PATH, ...CHROME_CANDIDATES, ...LINUX_CANDIDATES]
  .find((candidate) => candidate && fs.existsSync(candidate));

const PROJECT_CHAPTERS = 8;
// Cold load was 3164 KB before this work; budget guards the win, not a hard target.
const COLD_BUDGET_KB = 800;
const VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 3 };
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class CDP {
  constructor(socket) {
    this.socket = socket;
    this.id = 0;
    this.pending = new Map();
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      const entry = this.pending.get(message.id);
      if (!entry) return;
      this.pending.delete(message.id);
      if (message.error) entry.reject(new Error(`${entry.method}: ${message.error.message}`));
      else entry.resolve(message.result);
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    this.socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { method, resolve, reject });
      setTimeout(() => {
        if (!this.pending.has(id)) return;
        this.pending.delete(id);
        reject(new Error(`CDP timeout: ${method}`));
      }, 30000);
    });
  }
  async evaluate(expression) {
    const response = await this.send("Runtime.evaluate", {
      expression, returnByValue: true, awaitPromise: true,
    });
    if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails));
    return response.result.value;
  }
}

async function waitForChrome(port, child) {
  for (let attempt = 0; attempt < 150; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`Chrome exited early (${child.exitCode})`);
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return response.json();
    } catch {}
    await sleep(100);
  }
  throw new Error("Chrome DevTools endpoint did not start");
}

const PROBE = `(async () => {
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const logoReqs = () => performance.getEntriesByType('resource').filter(r => r.name.includes('client-logos'));
  const totalKB = () => Math.round(performance.getEntriesByType('resource')
    .reduce((a, r) => a + (r.transferSize || r.encodedBodySize || 0), 0) / 1024);

  await wait(2500);
  const cold = {
    scrollY: window.scrollY,
    visibilityState: document.visibilityState,
    logoRequests: logoReqs().length,
    totalKB: totalKB(),
    marqueeBuilt: document.querySelector('.relationship-marks')?.dataset?.marqueeReady === 'true'
  };

  document.getElementById('relationships').scrollIntoView();
  await wait(3000);
  const imgs = [...document.querySelectorAll('.relationship-marks img')];
  const originals = [...document.querySelectorAll('.relationship-marks figure')]
    .filter(f => !f.closest('.client-marquee__set--duplicate'));
  const marquee = {
    marqueeBuilt: document.querySelector('.relationship-marks')?.dataset?.marqueeReady === 'true',
    lanes: document.querySelectorAll('.client-marquee__lane').length,
    originalFigures: originals.length,
    uniqueSrcs: new Set(originals.map(f => f.querySelector('img')?.getAttribute('src'))).size,
    imgsLoaded: imgs.filter(i => i.complete && i.naturalWidth > 0).length + '/' + imgs.length,
    imgsLoadedCount: imgs.filter(i => i.complete && i.naturalWidth > 0).length,
    imgsTotal: imgs.length,
    logoRequests: logoReqs().length,
    allFrom640: logoReqs().length > 0 && logoReqs().every(r => r.name.includes('/640/')),
    altMatchesCaption: originals.every(f => {
      const a = f.querySelector('img')?.alt?.trim(), c = f.querySelector('figcaption')?.textContent?.trim();
      return a && a === c;
    }),
    toggleShown: !!document.querySelector('[data-client-marquee-controls]:not([hidden])'),
    laneDirection: getComputedStyle(document.querySelector('.client-marquee__track')).direction,
    worstLaneGapPx: (() => {
      let worst = 0;
      for (const lane of document.querySelectorAll('.client-marquee__lane')) {
        const lr = lane.getBoundingClientRect();
        const spans = [...lane.querySelectorAll('figure')].map(f => f.getBoundingClientRect())
          .filter(r => r.right > lr.left && r.left < lr.right)
          .map(r => [Math.max(r.left, lr.left), Math.min(r.right, lr.right)])
          .sort((a, b) => a[0] - b[0]);
        let cursor = lr.left, gap = 0;
        for (const [a, b] of spans) { if (a > cursor) gap = Math.max(gap, a - cursor); cursor = Math.max(cursor, b); }
        if (lr.right > cursor) gap = Math.max(gap, lr.right - cursor);
        worst = Math.max(worst, Math.round(gap));
      }
      return worst;
    })()
  };

  // Step through the section rather than jumping to its top. Each chapter is
  // ~400px tall against an 844px viewport, so a single scrollIntoView() can only
  // ever reveal one or two of them - which reads as broken motion when it is not.
  const work = document.getElementById('selected-work');
  work.scrollIntoView();
  await wait(600);
  const end = work.getBoundingClientRect().bottom + window.scrollY;
  for (let y = window.scrollY; y < end + innerHeight; y += Math.round(innerHeight * 0.5)) {
    window.scrollTo(0, y);
    await wait(320);
  }
  await wait(1200);
  const media = [...document.querySelectorAll('[data-motion-enter="project-chapter-media"]')];
  // A class landing is not motion: if the CSS media query stopped matching, .is-entered
  // would still be added and a class-only check would pass while nothing animated.
  const probeEl = document.querySelector('[data-motion-enter="project-chapter-media"]');
  const probeAfter = probeEl ? parseFloat(getComputedStyle(probeEl).opacity) : null;
  const fresh = probeEl ? probeEl.cloneNode(true) : null;
  let probeBefore = null;
  if (fresh) {
    fresh.classList.remove('is-entered');
    probeEl.parentNode.appendChild(fresh);
    probeBefore = parseFloat(getComputedStyle(fresh).opacity);
    fresh.remove();
  }
  const copy = [...document.querySelectorAll('[data-motion-enter="project-chapter-copy"]')];
  const projects = {
    mediaHooks: media.length,
    mediaEntered: media.filter(e => e.classList.contains('is-entered')).length,
    copyHooks: copy.length,
    copyEntered: copy.filter(e => e.classList.contains('is-entered')).length,
    mediaOpacityBefore: probeBefore,
    mediaOpacityAfter: probeAfter,
    siteMotionEntered: document.querySelectorAll('[data-motion-enter].is-entered').length,
    siteMotionTotal: document.querySelectorAll('[data-motion-enter]').length
  };

  return { cold, marquee, projects,
           finalTotalKB: totalKB(),
           horizontalScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth };
})()`;

async function run(port) {
  if (!CHROME_EXE) throw new Error(`No Chrome/Edge found in: ${CHROME_CANDIDATES.join(", ")}`);
  const server = await startStaticServer({ root: ROOT, port });
  const debugPort = 9200 + Math.floor(Math.random() * 500);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "divani-verify-"));
  const child = spawn(CHROME_EXE, [
    "--headless=new", `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`,
    "--no-first-run", "--no-default-browser-check", "--disable-extensions",
    // Chrome's sandbox cannot initialise as uid 0, which is the normal case in a
    // CI container. Only dropped when actually running as root.
    ...(process.getuid && process.getuid() === 0 ? ["--no-sandbox"] : []),
    `--window-size=${VIEWPORT.width},${VIEWPORT.height}`, "about:blank",
  ], { stdio: "ignore" });

  const results = {};
  try {
    await waitForChrome(debugPort, child);
    for (const locale of ["index.html", "ar.html"]) {
      const created = await (await fetch(
        `http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent("about:blank")}`,
        { method: "PUT" })).json();
      const socket = new WebSocket(created.webSocketDebuggerUrl);
      await new Promise((resolve, reject) => {
        socket.addEventListener("open", resolve, { once: true });
        socket.addEventListener("error", reject, { once: true });
      });
      const cdp = new CDP(socket);
      await cdp.send("Runtime.enable");
      await cdp.send("Page.enable");
      await cdp.send("Network.enable");
      await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
      await cdp.send("Emulation.setDeviceMetricsOverride", { ...VIEWPORT, mobile: true });
      await cdp.send("Page.navigate", { url: `${server.url}/${locale}` });
      await sleep(1500);
      results[locale] = await cdp.evaluate(PROBE);
      socket.close();
      await fetch(`http://127.0.0.1:${debugPort}/json/close/${created.id}`);
    }
  } finally {
    // Teardown must never discard results: Chrome holds a lock on its profile
    // directory for a moment after kill(), and on Windows rmSync then throws EPERM.
    child.kill();
    await server.close().catch(() => {});
    await sleep(500);
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
  }
  return results;
}

function report(results) {
  let failures = 0;
  for (const [locale, r] of Object.entries(results)) {
    console.log(`\n=== ${locale} @ ${VIEWPORT.width}x${VIEWPORT.height} DPR ${VIEWPORT.deviceScaleFactor} ===`);
    console.log(`  compositing        : ${r.cold.visibilityState} (must be "visible" for observers to fire)`);
    console.log(`  cold: logo requests: ${r.cold.logoRequests}  total ${r.cold.totalKB} KB  marqueeBuilt=${r.cold.marqueeBuilt}`);
    console.log(`  after scroll       : built=${r.marquee.marqueeBuilt} lanes=${r.marquee.lanes} figures=${r.marquee.originalFigures} imgs=${r.marquee.imgsLoaded}`);
    console.log(`  logos from /640/   : ${r.marquee.allFrom640}   requests=${r.marquee.logoRequests}`);
    console.log(`  alt === figcaption : ${r.marquee.altMatchesCaption}   toggle shown=${r.marquee.toggleShown}`);
    console.log(`  projects motion    : media ${r.projects.mediaEntered}/${r.projects.mediaHooks} entered, copy ${r.projects.copyEntered}/${r.projects.copyHooks}`);
    console.log(`  site motion overall: ${r.projects.siteMotionEntered}/${r.projects.siteMotionTotal} entered`);
    console.log(`  final total        : ${r.finalTotalKB} KB   horizontalScroll=${r.horizontalScroll}`);

    const checks = [
      ["cold load fetches no logos", r.cold.logoRequests === 0],
      ["marquee deferred on cold load", r.cold.marqueeBuilt === false],
      ["marquee builds after scroll", r.marquee.marqueeBuilt === true],
      ["50 original figures", r.marquee.originalFigures === 50],
      ["50 unique srcs", r.marquee.uniqueSrcs === 50],
      ["logos served from /640/", r.marquee.allFrom640 === true],
      // The lanes scroll marks in by transform, which does not reliably re-run
      // lazy loading - unloaded marks appear as blanks mid-scroll. This shipped
      // once because the count was printed but never asserted.
      // Under dir=rtl the flex track lays out from the right edge, so the negative
      // scroll translate walked the whole strip off-screen and the Arabic marquee
      // rendered empty. Every other check passed throughout: the marks existed, were
      // loaded and were the right count - they simply were not on screen.
      ["lane is covered by marks (no empty stretch)", r.marquee.worstLaneGapPx <= 40],
      ["marquee track forced to ltr geometry", r.marquee.laneDirection === "ltr"],
      ["every marquee image loaded (no blanks mid-scroll)",
        r.marquee.imgsTotal > 0 && r.marquee.imgsLoadedCount === r.marquee.imgsTotal],
      ["alt matches figcaption", r.marquee.altMatchesCaption === true],
      ["no horizontal scroll", r.horizontalScroll === false],
      ["all 8 project chapters have motion hooks", r.projects.mediaHooks === PROJECT_CHAPTERS && r.projects.copyHooks === PROJECT_CHAPTERS],
      ["every project image entered", r.projects.mediaEntered === PROJECT_CHAPTERS],
      ["every project copy block entered", r.projects.copyEntered === PROJECT_CHAPTERS],
      ["project motion actually animates (not just the class)", r.projects.mediaOpacityBefore < 0.5 && r.projects.mediaOpacityAfter > 0.9],
      ["browser is compositing (else no observer fires)", r.cold.visibilityState === "visible"],
      [`cold load under ${COLD_BUDGET_KB} KB`, r.cold.totalKB < COLD_BUDGET_KB],
    ];
    for (const [label, ok] of checks) {
      if (!ok) { console.log(`  FAIL: ${label}`); failures += 1; }
    }
  }
  return failures;
}

run(Number(process.argv[2]) || 8978)
  .then((results) => {
    const failures = report(results);
    console.log(failures ? `\n${failures} check(s) failed.` : "\nAll checks passed.");
    process.exit(failures ? 1 : 0);
  })
  .catch((error) => { console.error(error.stack || error.message); process.exit(1); });
