const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const browserExe = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
const port = 9300 + Math.floor(Math.random() * 400);
const cwd = path.resolve(__dirname, "..");
const fileUrl = pathToFileURL(path.join(cwd, "Divani (1).html")).href;
const suffix = process.env.AUDIT_SUFFIX || "elegant";
const userData = path.join(cwd, "tasks", `chrome-profile-${suffix}-` + Date.now());

fs.mkdirSync(path.join(cwd, "tasks", "screenshots"), { recursive: true });
fs.mkdirSync(userData, { recursive: true });

const proc = spawn(browserExe, [
  "--headless=new",
  "--disable-gpu",
  "--disable-extensions",
  "--no-first-run",
  "--no-default-browser-check",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${userData}`,
  "about:blank"
], { stdio: "ignore" });

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForEndpoint() {
  for (let i = 0; i < 80; i += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) {
        return await res.json();
      }
    } catch (error) {
      // Chrome is still starting.
    }
    await sleep(100);
  }
  throw new Error("Chrome DevTools endpoint did not start");
}

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.events = [];
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const pending = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) {
          pending.reject(new Error(JSON.stringify(msg.error)));
        } else {
          pending.resolve(msg.result || {});
        }
      } else if (msg.method) {
        this.events.push(msg);
      }
    };
  }

  send(method, params = {}, sessionId) {
    const id = ++this.id;
    const payload = { id, method, params };
    if (sessionId) {
      payload.sessionId = sessionId;
    }
    this.ws.send(JSON.stringify(payload));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`CDP timeout: ${method}`));
        }
      }, 60000);
    });
  }
}

async function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
    setTimeout(() => reject(new Error("WebSocket timeout")), 10000);
  });
  return new CDP(ws);
}

async function createPage(cdp, viewport) {
  const target = await cdp.send("Target.createTarget", { url: "about:blank" });
  const attached = await cdp.send("Target.attachToTarget", { targetId: target.targetId, flatten: true });
  const sessionId = attached.sessionId;
  await cdp.send("Page.enable", {}, sessionId);
  await cdp.send("Runtime.enable", {}, sessionId);
  await cdp.send("Log.enable", {}, sessionId).catch(() => {});
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.mobile || false
  }, sessionId);
  await cdp.send("Page.navigate", { url: fileUrl }, sessionId);
  await sleep(2400);
  return sessionId;
}

async function evalPage(cdp, sessionId, expression) {
  const result = await cdp.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true
  }, sessionId);
  if (result.exceptionDetails) {
    throw new Error(JSON.stringify(result.exceptionDetails));
  }
  return result.result.value;
}

async function screenshot(cdp, sessionId, outfile, viewportWidth, mobile, fullPage = true) {
  const metrics = await cdp.send("Page.getLayoutMetrics", {}, sessionId);
  const contentWidth = Math.ceil(metrics.cssContentSize.width || viewportWidth);
  const contentHeight = Math.ceil(metrics.cssContentSize.height);
  if (fullPage) {
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: viewportWidth,
      height: Math.min(contentHeight, 12000),
      deviceScaleFactor: 1,
      mobile: !!mobile
    }, sessionId);
    await sleep(300);
  }
  const shot = await cdp.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: fullPage,
    fromSurface: true
  }, sessionId);
  fs.writeFileSync(outfile, Buffer.from(shot.data, "base64"));
  return { contentWidth, contentHeight, outfile };
}

async function main() {
  const version = await waitForEndpoint();
  const cdp = await connect(version.webSocketDebuggerUrl);

  const desktop = await createPage(cdp, { width: 1440, height: 1000, mobile: false });
  const desktopData = await evalPage(cdp, desktop, `(() => {
    const rect = el => {
      const r = el.getBoundingClientRect();
      return {x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height), top:Math.round(r.top), bottom:Math.round(r.bottom)};
    };
    const imgs = [...document.images].map(img => ({
      src: img.getAttribute('src'),
      alt: img.getAttribute('alt'),
      ok: img.complete && img.naturalWidth > 0,
      visible: !!(img.offsetWidth || img.offsetHeight)
    }));
    const anchors = [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href'));
    return {
      title: document.title,
      compat: document.compatMode,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollHeight: document.documentElement.scrollHeight,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      sections: [...document.querySelectorAll('section, footer')].map(s => ({id:s.id, cls:String(s.className), rect:rect(s)})),
      headings: [...document.querySelectorAll('h1,h2,h3')].map(h => ({tag:h.tagName, text:h.textContent.trim(), font:getComputedStyle(h).fontSize, rect:rect(h)})),
      brokenImages: imgs.filter(i => !i.ok),
      emptyVisibleAlt: imgs.filter(i => i.visible && i.alt === null),
      localMissing: anchors.filter(h => h.startsWith('#') && !document.getElementById(h.slice(1))),
      unrevealed: document.querySelectorAll('.reveal:not(.in)').length,
      activeProject: document.getElementById('projectPanelTitle').textContent.trim(),
      pressedProjects: [...document.querySelectorAll('.project-button[aria-pressed="true"]')].map(b => b.textContent.trim())
    };
  })()`);

  await evalPage(cdp, desktop, `document.querySelectorAll('.project-button')[2].click(); true`);
  await sleep(600);
  const projectSwitch = await evalPage(cdp, desktop, `(() => ({
    title: document.getElementById('projectPanelTitle').textContent.trim(),
    img: document.getElementById('projectImage').getAttribute('src'),
    pressed: [...document.querySelectorAll('.project-button')].map(b => b.getAttribute('aria-pressed'))
  }))()`);

  const desktopShot = await screenshot(cdp, desktop, path.join(cwd, "tasks", "screenshots", `desktop-${suffix}.png`), 1440, false);

  const mobile = await createPage(cdp, { width: 390, height: 844, mobile: true });
  const mobileData = await evalPage(cdp, mobile, `(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    scrollHeight: document.documentElement.scrollHeight,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    menuButton: (() => {
      const r = document.querySelector('.menu-button').getBoundingClientRect();
      return {w:Math.round(r.width), h:Math.round(r.height)};
    })(),
    projectIndexScrolls: document.querySelector('.project-index').scrollWidth > document.querySelector('.project-index').clientWidth,
    unrevealed: document.querySelectorAll('.reveal:not(.in)').length,
    brokenImages: [...document.images].filter(img => !(img.complete && img.naturalWidth > 0)).map(img => img.getAttribute('src'))
  }))()`);
  const mobileShot = await screenshot(cdp, mobile, path.join(cwd, "tasks", "screenshots", `mobile-${suffix}.png`), 390, true);

  const menu = await createPage(cdp, { width: 390, height: 844, mobile: true });
  await evalPage(cdp, menu, `document.querySelector('.menu-button').click(); true`);
  await sleep(500);
  const menuData = await evalPage(cdp, menu, `(() => ({
    open: document.querySelector('.mobile-drawer').classList.contains('open'),
    ariaHidden: document.querySelector('.mobile-drawer').getAttribute('aria-hidden'),
    expanded: document.querySelector('.menu-button').getAttribute('aria-expanded'),
    activeClass: document.activeElement && document.activeElement.className
  }))()`);
  const menuShot = await screenshot(cdp, menu, path.join(cwd, "tasks", "screenshots", `mobile-menu-${suffix}.png`), 390, true, false);

  const errors = cdp.events.filter((event) => (
    event.method === "Runtime.exceptionThrown" ||
    event.method === "Log.entryAdded" ||
    (event.method === "Runtime.consoleAPICalled" && event.params && event.params.type === "error")
  ));
  const summary = {
    desktopData,
    projectSwitch,
    mobileData,
    menuData,
    screenshots: { desktopShot, mobileShot, menuShot },
    errorCount: errors.length,
    errors: errors.slice(0, 5),
    profile: userData
  };
  fs.writeFileSync(path.join(cwd, "tasks", `browser-audit-${suffix}.json`), JSON.stringify(summary, null, 2), "utf8");
  console.log(JSON.stringify(summary, null, 2));
  try { await cdp.send("Browser.close"); } catch (error) {}
  try { cdp.ws.close(); } catch (error) {}
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
}).finally(() => {
  try { proc.kill(); } catch (error) {}
  setTimeout(() => process.exit(process.exitCode || 0), 300);
});
