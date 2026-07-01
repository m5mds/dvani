const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const browserExe = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
const port = 9400 + Math.floor(Math.random() * 400);
const cwd = path.resolve(__dirname, "..");
const userData = path.join(cwd, "tasks", `chrome-profile-multipage-${Date.now()}`);
const shotsDir = path.join(cwd, "tasks", "screenshots");

const pageFiles = [
  "index.html",
  "about.html",
  "why-us.html",
  "services.html",
  "projects.html",
  "clients.html",
  "certificates.html",
  "quote.html",
  "contact.html",
  "Divani (1).html",
];

fs.mkdirSync(userData, { recursive: true });
fs.mkdirSync(shotsDir, { recursive: true });

const proc = spawn(browserExe, [
  "--headless=new",
  "--disable-gpu",
  "--disable-extensions",
  "--no-first-run",
  "--no-default-browser-check",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${userData}`,
  "about:blank",
], { stdio: "ignore" });

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForEndpoint() {
  for (let i = 0; i < 80; i += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) return await res.json();
    } catch {}
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
        msg.error ? pending.reject(new Error(JSON.stringify(msg.error))) : pending.resolve(msg.result || {});
      } else if (msg.method) {
        this.events.push(msg);
      }
    };
  }

  send(method, params = {}, sessionId) {
    const id = ++this.id;
    const payload = sessionId ? { id, method, params, sessionId } : { id, method, params };
    this.ws.send(JSON.stringify(payload));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`CDP timeout: ${method}`));
        }
      }, 90000);
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

async function createPage(cdp, file, viewport) {
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
    mobile: !!viewport.mobile,
  }, sessionId);
  await cdp.send("Page.navigate", { url: pathToFileURL(path.join(cwd, file)).href }, sessionId);
  await sleep(1800);
  return { sessionId, targetId: target.targetId };
}

async function evalPage(cdp, sessionId, expression) {
  const result = await cdp.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  }, sessionId);
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}

async function screenshot(cdp, sessionId, name, viewportWidth, mobile) {
  const metrics = await cdp.send("Page.getLayoutMetrics", {}, sessionId);
  const contentHeight = Math.ceil(metrics.cssContentSize.height);
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: viewportWidth,
    height: Math.min(contentHeight, 12000),
    deviceScaleFactor: 1,
    mobile: !!mobile,
  }, sessionId);
  await sleep(250);
  const shot = await cdp.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
    fromSurface: true,
  }, sessionId);
  const outfile = path.join(shotsDir, name);
  fs.writeFileSync(outfile, Buffer.from(shot.data, "base64"));
  return { outfile, contentHeight };
}

async function collect(cdp, sessionId) {
  return evalPage(cdp, sessionId, `(() => {
    const rect = el => {
      const r = el.getBoundingClientRect();
      return {x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height)};
    };
    const imgs = [...document.images].map(img => ({
      src: img.getAttribute("src"),
      alt: img.getAttribute("alt"),
      ok: img.complete && img.naturalWidth > 0,
      visible: !!(img.offsetWidth || img.offsetHeight)
    }));
    return {
      title: document.title,
      page: document.body.dataset.page,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollHeight: document.documentElement.scrollHeight,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      brokenImages: imgs.filter(i => !i.ok),
      missingAlt: imgs.filter(i => i.visible && i.alt === null),
      currentNav: document.querySelectorAll('[aria-current="page"]').length,
      forms: document.querySelectorAll("form").length,
      h1: document.querySelector("h1")?.textContent.trim(),
      topbar: rect(document.querySelector(".topbar")),
      unrevealed: document.querySelectorAll(".reveal:not(.in)").length
    };
  })()`);
}

async function main() {
  const version = await waitForEndpoint();
  const cdp = await connect(version.webSocketDebuggerUrl);

  const pages = [];
  for (const file of pageFiles) {
    const desktop = await createPage(cdp, file, { width: 1440, height: 950, mobile: false });
    const desktopData = await collect(cdp, desktop.sessionId);
    await cdp.send("Target.closeTarget", { targetId: desktop.targetId }).catch(() => {});
    const mobile = await createPage(cdp, file, { width: 390, height: 844, mobile: true });
    const mobileData = await collect(cdp, mobile.sessionId);
    await cdp.send("Target.closeTarget", { targetId: mobile.targetId }).catch(() => {});
    pages.push({ file, desktopData, mobileData });
  }

  const homeDesktop = await createPage(cdp, "index.html", { width: 1440, height: 950, mobile: false });
  const homeMobile = await createPage(cdp, "index.html", { width: 390, height: 844, mobile: true });
  const projectsDesktop = await createPage(cdp, "projects.html", { width: 1440, height: 950, mobile: false });
  const clientsDesktop = await createPage(cdp, "clients.html", { width: 1440, height: 950, mobile: false });
  const certsDesktop = await createPage(cdp, "certificates.html", { width: 1440, height: 950, mobile: false });
  const quoteMobile = await createPage(cdp, "quote.html", { width: 390, height: 844, mobile: true });

  const projectSwitch = await evalPage(cdp, projectsDesktop.sessionId, `(() => {
    document.querySelectorAll(".project-pick")[2].click();
    return new Promise(resolve => setTimeout(() => resolve({
      title: document.getElementById("projectPanelTitle").textContent.trim(),
      img: document.getElementById("projectImage").getAttribute("src"),
      pressed: [...document.querySelectorAll(".project-pick")].map(b => b.getAttribute("aria-pressed"))
    }), 260));
  })()`);

  const menu = await createPage(cdp, "index.html", { width: 390, height: 844, mobile: true });
  await evalPage(cdp, menu.sessionId, `document.querySelector(".menu-button").click(); true`);
  await sleep(250);
  const menuData = await evalPage(cdp, menu.sessionId, `(() => ({
    open: document.querySelector(".mobile-drawer").classList.contains("open"),
    ariaHidden: document.querySelector(".mobile-drawer").getAttribute("aria-hidden"),
    expanded: document.querySelector(".menu-button").getAttribute("aria-expanded"),
    activeClass: document.activeElement && document.activeElement.className,
    button: (() => { const r = document.querySelector(".menu-button").getBoundingClientRect(); return {w:Math.round(r.width), h:Math.round(r.height)}; })()
  }))()`);

  const quoteForm = await evalPage(cdp, quoteMobile.sessionId, `(() => {
    let opened = "";
    window.open = url => { opened = url; return null; };
    const form = document.querySelector("form");
    form.querySelector('[name="الاسم"]').value = "عميل تجريبي";
    form.querySelector('[name="الجوال"]').value = "0550000000";
    form.querySelector('[name="نوع المشروع"]').value = "فندقي";
    form.querySelector('[name="المدينة"]').value = "تبوك";
    form.querySelector('[name="التفاصيل"]').value = "اختبار نموذج عرض السعر";
    form.requestSubmit();
    return opened;
  })()`);

  fs.writeFileSync(path.join(cwd, "tasks", "browser-audit-multipage-pre-screenshots.json"), JSON.stringify({
    pages,
    projectSwitch,
    menuData,
    quoteForm,
  }, null, 2), "utf8");

  const screenshots = process.env.SKIP_SCREENSHOTS ? {} : {
    homeDesktop: await screenshot(cdp, homeDesktop.sessionId, "multipage-home-desktop.png", 1440, false),
    homeMobile: await screenshot(cdp, homeMobile.sessionId, "multipage-home-mobile.png", 390, true),
    projectsDesktop: await screenshot(cdp, projectsDesktop.sessionId, "multipage-projects-desktop.png", 1440, false),
    clientsDesktop: await screenshot(cdp, clientsDesktop.sessionId, "multipage-clients-desktop.png", 1440, false),
    certsDesktop: await screenshot(cdp, certsDesktop.sessionId, "multipage-certificates-desktop.png", 1440, false),
    quoteMobile: await screenshot(cdp, quoteMobile.sessionId, "multipage-quote-mobile.png", 390, true),
  };
  for (const page of [homeDesktop, homeMobile, projectsDesktop, clientsDesktop, certsDesktop, quoteMobile, menu]) {
    await cdp.send("Target.closeTarget", { targetId: page.targetId }).catch(() => {});
  }

  const errors = cdp.events.filter((event) => (
    event.method === "Runtime.exceptionThrown" ||
    event.method === "Log.entryAdded" ||
    (event.method === "Runtime.consoleAPICalled" && event.params && event.params.type === "error")
  ));

  const summary = {
    pages,
    projectSwitch,
    menuData,
    quoteForm,
    screenshots,
    errorCount: errors.length,
    errors: errors.slice(0, 8),
    profile: userData,
  };

  fs.writeFileSync(path.join(cwd, "tasks", "browser-audit-multipage.json"), JSON.stringify(summary, null, 2), "utf8");
  console.log(JSON.stringify(summary, null, 2));
  try { await cdp.send("Browser.close"); } catch {}
  try { cdp.ws.close(); } catch {}
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
}).finally(() => {
  try { proc.kill(); } catch {}
  setTimeout(() => process.exit(process.exitCode || 0), 300);
});
