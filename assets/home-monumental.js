(() => {
  "use strict";

  const root = document.documentElement;
  root.classList.remove("no-js");
  root.classList.add("js");

  const LANGUAGE_ANCHOR_ALLOWLIST = new Set(["proof", "about", "why-divani", "capabilities", "relationships", "selected-work", "project-brief", "contact"]);
  const MOBILE_QUERY = "(max-width: 767px)";
  const NAV_COLLAPSED_QUERY = "(max-width: 63.9375rem)";
  // 75 frames at 18fps is a ~4.2s opening title. The hold is timed so the film
  // begins exactly as the intro curtain starts lifting, rather than running
  // behind it - together they reach the composed frame in about 5.4s.
  const FILM_FRAME_RATE = 18;
  const FILM_INTRO_HOLD_MS = 1200;
  const WHATSAPP_NUMBER = "966531100366";
  const INITIAL_RENDER_LOCKS = [
    "brief-render-pending", "readiness-render-pending", "delivery-render-pending",
    "capabilities-render-pending", "hero-text-render-pending", "threshold-render-pending",
    "design-copy-render-pending",
  ];
  const INITIAL_RENDER_READY_ATTRIBUTE = "data-initial-render-ready";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const saveData = Boolean(navigator.connection?.saveData);
  const supportsSiteMotion = "fetch" in window &&
    "requestAnimationFrame" in window &&
    "IntersectionObserver" in window &&
    "CSS" in window &&
    typeof CSS.supports === "function" &&
    CSS.supports("height", "100svh");
  let motionLockedStatic = prefersReducedMotion.matches || saveData || !supportsSiteMotion;

  function clamp(value, minimum = 0, maximum = 1) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function lerp(start, end, progress) {
    return start + ((end - start) * progress);
  }

  function smoothstep(start, end, value) {
    if (start === end) return value < start ? 0 : 1;
    const progress = clamp((value - start) / (end - start));
    return progress * progress * (3 - (2 * progress));
  }

  function motionAllowed() {
    return !motionLockedStatic && !prefersReducedMotion.matches && !saveData && supportsSiteMotion;
  }

  function lockStaticMotion() {
    motionLockedStatic = true;
    motionDirector?.disable();
    root.classList.remove(...INITIAL_RENDER_LOCKS);
    for (const element of document.querySelectorAll(`[${INITIAL_RENDER_READY_ATTRIBUTE}]`)) {
      element.removeAttribute(INITIAL_RENDER_READY_ATTRIBUTE);
    }
    root.classList.add("static-motion", "static-hero");
    root.classList.remove("motion-ready");
    for (const element of document.querySelectorAll("[data-motion-stage], [data-motion-enter]")) {
      if (!(element instanceof HTMLElement)) continue;
      element.classList.add("is-entered");
      element.style.removeProperty("--motion-progress");
      element.style.removeProperty("--scene-scale");
      element.style.removeProperty("--scene-veil");
      element.style.removeProperty("--scene-exposure");
      element.classList.remove("is-motion-active");
    }
    revealSiteNav();
    for (const portal of document.querySelectorAll("[data-threshold-portal]")) {
      if (!(portal instanceof HTMLElement)) continue;
      portal.style.removeProperty("clip-path");
      portal.style.removeProperty("opacity");
    }
    for (const ident of document.querySelectorAll("[data-hero-ident]")) {
      if (!(ident instanceof HTMLAnchorElement)) continue;
      ident.removeAttribute("data-ident-hidden");
      ident.removeAttribute("aria-hidden");
      ident.removeAttribute("tabindex");
    }
    for (const threshold of document.querySelectorAll("[data-threshold-stage]")) {
      if (!(threshold instanceof HTMLElement)) continue;
      threshold.removeAttribute("data-motion-progress");
      threshold.style.removeProperty("--threshold-copy-opacity");
      threshold.style.removeProperty("--threshold-copy-shift");
      threshold.style.removeProperty("--threshold-design-scale");
    }
    for (const video of document.querySelectorAll("video[data-capability-film]")) {
      if (!(video instanceof HTMLVideoElement)) continue;
      video.pause();
      for (const source of video.querySelectorAll("source")) source.removeAttribute("src");
      video.removeAttribute("src");
      video.dataset.videoActivated = "false";
      video.dataset.playback = "poster";
      video.dataset.playable = "false";
      video.load();
    }
  }

  // The opening film owns the first screen, so the bar is held back until the
  // film settles. Any path that gives up on the film has to release it too.
  function revealSiteNav() {
    for (const nav of document.querySelectorAll("[data-site-nav]")) {
      if (!(nav instanceof HTMLElement) || nav.dataset.navState === "page") continue;
      nav.dataset.navState = "page";
    }
  }

  function createMotionDirector() {
    const subscribers = new Set();
    let animationFrame = 0;
    let enabled = true;

    function flush() {
      animationFrame = 0;
      for (const subscriber of subscribers) subscriber();
    }

    function schedule() {
      if (!enabled) return;
      if (animationFrame) return;
      animationFrame = requestAnimationFrame(flush);
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("pageshow", schedule, { passive: true });
    window.addEventListener("pagehide", () => {
      if (!animationFrame) return;
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    });

    return {
      disable() {
        enabled = false;
        if (!animationFrame) return;
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      },
      schedule,
      subscribe(subscriber) {
        subscribers.add(subscriber);
        schedule();
        return () => subscribers.delete(subscriber);
      },
    };
  }

  const motionDirector = createMotionDirector();
  root.classList.toggle("static-motion", motionLockedStatic);

  function localAssetUrl(reference, manifestUrl) {
    const resolved = /^\/?assets\//iu.test(reference)
      ? new URL(reference.replace(/^\//u, ""), document.baseURI)
      : new URL(reference, manifestUrl);
    if (resolved.origin !== window.location.origin) throw new Error("Cross-origin hero frame rejected");
    return resolved.href;
  }

  function syncLanguageSwitch() {
    const anchor = window.location.hash.slice(1);
    for (const switcher of document.querySelectorAll("[data-language-switch], [data-footer-language-switch]")) {
      if (!(switcher instanceof HTMLAnchorElement)) continue;
      const destination = new URL(switcher.getAttribute("href") || "", document.baseURI);
      destination.hash = LANGUAGE_ANCHOR_ALLOWLIST.has(anchor) ? anchor : "";
      switcher.href = destination.href;
    }
  }

  syncLanguageSwitch();
  window.addEventListener("hashchange", syncLanguageSwitch, { passive: true });

  function scrollToCapabilitiesIntro(target) {
    const threshold = document.querySelector(".threshold-stage");
    if (motionAllowed() && root.classList.contains("portal-clip-supported") && threshold instanceof HTMLElement) {
      const thresholdTop = window.scrollY + threshold.getBoundingClientRect().top;
      const destination = thresholdTop + Math.max(0, threshold.offsetHeight - window.innerHeight);
      window.scrollTo(0, destination);
    } else {
      target.scrollIntoView({ block: "start" });
    }
  }

  function initialiseSkipLink() {
    const link = document.querySelector("a.skip-link[href='#about-title']");
    const target = document.querySelector("#about-title[tabindex='-1']");
    if (!(link instanceof HTMLAnchorElement) || !(target instanceof HTMLElement)) return;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      try {
        window.history.pushState(null, "", "#about");
      } catch {
        window.location.hash = "about";
      }
      syncLanguageSwitch();
      try {
        target.focus({ preventScroll: true });
      } catch {
        target.focus();
      }
      const section = target.closest("#about");
      (section instanceof HTMLElement ? section : target).scrollIntoView({ block: "start" });
    });
  }

  function initialiseHeroSequence() {
    const hero = document.querySelector("#proof[data-hero-sequence]");
    const canvas = hero?.querySelector("#hero-canvas[data-hero-canvas]");
    const heroStage = hero?.querySelector(".hero-stage");
    const ident = hero?.querySelector("a[data-hero-ident]");
    const identDock = hero?.querySelector("[data-hero-ident-dock]");
    if (!(hero instanceof HTMLElement) || !(canvas instanceof HTMLCanvasElement)) return;

    hero.dataset.currentFrame = "0";
    hero.dataset.frameCount = "75";
    hero.dataset.variant = window.matchMedia(MOBILE_QUERY).matches ? "mobile" : "desktop";
    hero.dataset.mode = "poster";
    hero.dataset.ready = "false";

    let context = null;
    let manifest = null;
    let manifestUrl = "";
    let variant = hero.dataset.variant;
    let variantWidth = 0;
    let variantHeight = 0;
    let frameUrls = [];
    let frameCount = 75;
    let loadGeneration = 0;
    let requestedFrame = 0;
    let renderedFrame = -1;
    let frameQueue = [];
    let schedulerEnabled = false;
    let designPosterPrewarmed = false;
    let unsubscribeFramePump = null;
    let destroyed = false;
    let identMetrics = null;
    let reflectedAct = "";
    let playhead = 0;
    let filmClock = 0;
    let filmFrame = 0;
    let filmSettled = false;
    let bytesWarming = false;
    const cache = new Map();
    const inflight = new Map();
    const reflectedVariables = new Map();

    function fallback() {
      schedulerEnabled = false;
      stopFilm();
      unsubscribeFramePump?.();
      unsubscribeFramePump = null;
      resetFrameLoads();
      clearCache();
      hero.dataset.currentFrame = "0";
      hero.dataset.frameCount = String(frameCount || 75);
      hero.dataset.variant = window.matchMedia(MOBILE_QUERY).matches ? "mobile" : "desktop";
      hero.dataset.mode = "poster";
      hero.dataset.ready = "true";
      hero.dataset.act = "poster";
      hero.dataset.film = "static";
      hero.style.setProperty("--hero-camera-scale", "1");
      hero.style.setProperty("--hero-exposure", "0");
      hero.style.setProperty("--hero-copy-progress", "1");
      hero.style.setProperty("--hero-copy-shift", "0px");
      hero.style.setProperty("--hero-work-opacity", "0");
      hero.style.setProperty("--hero-work-scale", "1");
      hero.style.setProperty("--hero-logo-opacity", "0");
      hero.style.setProperty("--hero-logo-scale", "1");
      hero.style.removeProperty("--hero-ident-x");
      hero.style.removeProperty("--hero-ident-y");
      hero.style.removeProperty("--hero-ident-scale");
      hero.style.removeProperty("--hero-ident-opacity");
      if (ident instanceof HTMLAnchorElement) {
        ident.removeAttribute("data-ident-hidden");
        ident.removeAttribute("aria-hidden");
        ident.removeAttribute("tabindex");
      }
      hero.classList.remove("is-sequence");
      hero.classList.add("is-poster");
      lockStaticMotion();
      root.classList.remove("js-pending");
      window.dispatchEvent(new CustomEvent("divani:hero-ready", { detail: { interactive: false } }));
    }

    function startupCancelled() {
      if (destroyed) return true;
      if (motionAllowed()) return false;
      if (hero.dataset.ready !== "true") fallback();
      return true;
    }

    function resetFrameLoads() {
      loadGeneration += 1;
      frameQueue = [];
      for (const entry of inflight.values()) entry.controller?.abort();
      inflight.clear();
    }

    function releaseFrame(frame) {
      if (typeof ImageBitmap !== "undefined" && frame instanceof ImageBitmap) frame.close();
    }

    function clearCache() {
      for (const frame of cache.values()) releaseFrame(frame);
      cache.clear();
    }

    function touchCache(index, frame) {
      if (cache.has(index)) cache.delete(index);
      cache.set(index, frame);
      const limit = cacheLimit();
      while (cache.size > limit) {
        const oldest = cache.keys().next().value;
        const discarded = cache.get(oldest);
        cache.delete(oldest);
        releaseFrame(discarded);
      }
    }

    function cacheLimit() {
      const limit = variant === "mobile" ? 5 : 7;
      return limit;
    }

    async function decodeImage(url) {
      const image = new Image();
      image.decoding = "async";
      image.src = url;
      if (typeof image.decode === "function") await image.decode();
      else await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });
      return image;
    }

    async function decodeFrame(url, signal) {
      if ("createImageBitmap" in window) {
        try {
          const response = await fetch(url, { cache: "force-cache", signal });
          if (!response.ok) throw new Error(`Frame request failed: ${response.status}`);
          return await createImageBitmap(await response.blob());
        } catch (error) {
          if (signal?.aborted) throw error;
        }
      }
      return decodeImage(url);
    }

    function drawFrame(frame, index) {
      if (!context || destroyed) return;
      const sourceWidth = frame.width || frame.naturalWidth;
      const sourceHeight = frame.height || frame.naturalHeight;
      if (!sourceWidth || !sourceHeight) return;
      if (canvas.width !== variantWidth || canvas.height !== variantHeight) {
        canvas.width = variantWidth;
        canvas.height = variantHeight;
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
      }
      const canvasRatio = canvas.width / canvas.height;
      const sourceRatio = sourceWidth / sourceHeight;
      let sourceX = 0;
      let sourceY = 0;
      let cropWidth = sourceWidth;
      let cropHeight = sourceHeight;
      if (sourceRatio > canvasRatio) {
        cropWidth = sourceHeight * canvasRatio;
        sourceX = (sourceWidth - cropWidth) / 2;
      } else if (sourceRatio < canvasRatio) {
        cropHeight = sourceWidth / canvasRatio;
        sourceY = (sourceHeight - cropHeight) / 2;
      }
      if (sourceWidth === canvas.width && sourceHeight === canvas.height) {
        context.drawImage(frame, 0, 0);
      } else {
        context.drawImage(frame, sourceX, sourceY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);
      }
      renderedFrame = index;
      hero.dataset.currentFrame = String(index);
      hero.dataset.variant = variant;
      hero.classList.add("is-sequence");
      hero.classList.remove("is-poster");
    }

    function safeFrameIndex(index) {
      return Math.round(clamp(index, 0, frameCount - 1));
    }

    // Playback only ever runs forward now, so the decode window is simply the
    // frames immediately ahead of the playhead.
    function forwardFrameWindow(target) {
      const desired = [];
      const limit = cacheLimit();
      for (let index = target; index < frameCount && desired.length < limit; index += 1) desired.push(index);
      return desired;
    }

    function beginFrameLoad(index) {
      const existing = inflight.get(index);
      if (existing) return existing;
      const generation = loadGeneration;
      const requestedVariant = variant;
      const controller = "AbortController" in window ? new AbortController() : null;
      const entry = { controller, generation, index, requestedVariant, promise: null };
      entry.promise = (async () => {
        try {
          const frame = await decodeFrame(frameUrls[index], controller?.signal);
          if (destroyed || generation !== loadGeneration || requestedVariant !== variant) {
            releaseFrame(frame);
            return false;
          }
          touchCache(index, frame);
          const liveTarget = hero.dataset.mode === "sequence" ? filmState().target : requestedFrame;
          if (requestedFrame === index && liveTarget === index) drawFrame(frame, index);
          return true;
        } catch {
          const aborted = Boolean(controller?.signal.aborted);
          const liveTarget = hero.dataset.mode === "sequence" ? filmState().target : requestedFrame;
          if (!aborted && generation === loadGeneration && requestedVariant === variant && requestedFrame === index && liveTarget === index) fallback();
          return false;
        } finally {
          if (inflight.get(index) === entry) inflight.delete(index);
          if (schedulerEnabled) motionDirector.schedule();
        }
      })();
      inflight.set(index, entry);
      return entry;
    }

    function pumpFrameQueue() {
      if (!schedulerEnabled || destroyed || !frameUrls.length || !frameQueue.length) return;
      const concurrency = variant === "mobile" ? 2 : 3;
      while (inflight.size < concurrency && frameQueue.length) {
        const index = frameQueue.shift();
        if (cache.has(index) || inflight.has(index)) continue;
        beginFrameLoad(index);
        break;
      }
      if (inflight.size < concurrency && frameQueue.length) motionDirector.schedule();
    }

    function requestScheduledFrame(index) {
      if (!frameUrls.length) return;
      const safeIndex = safeFrameIndex(index);
      requestedFrame = safeIndex;

      if (cache.has(safeIndex)) {
        const frame = cache.get(safeIndex);
        touchCache(safeIndex, frame);
        drawFrame(frame, safeIndex);
      }

      frameQueue = forwardFrameWindow(safeIndex)
        .filter((candidate) => !cache.has(candidate) && !inflight.has(candidate));
      motionDirector.schedule();
    }

    async function loadInitialFrame(index) {
      const safeIndex = safeFrameIndex(index);
      requestedFrame = safeIndex;
      if (cache.has(safeIndex)) {
        drawFrame(cache.get(safeIndex), safeIndex);
        return true;
      }
      return beginFrameLoad(safeIndex).promise;
    }

    function progressState(progress) {
      if (progress < 0.08) return "drawing";
      if (progress < 0.68) return "materialising";
      if (progress < 0.9) return "space";
      return "hold";
    }

    function filmState() {
      const span = Math.max(1, frameCount - 1);
      return { progress: clamp(playhead / span), target: safeFrameIndex(Math.round(playhead)) };
    }

    function reflectVariable(name, value) {
      if (reflectedVariables.get(name) === value) return;
      reflectedVariables.set(name, value);
      hero.style.setProperty(name, value);
    }

    function heroIdentGeometry() {
      const stageRect = heroStage instanceof HTMLElement ? heroStage.getBoundingClientRect() : null;
      const width = stageRect?.width || document.documentElement.clientWidth || window.innerWidth;
      const height = stageRect?.height || window.innerHeight;
      const left = stageRect?.left || 0;
      const top = stageRect?.top || 0;
      if (identMetrics && identMetrics.width === width && identMetrics.height === height &&
          identMetrics.left === left && identMetrics.top === top && identMetrics.variant === variant) {
        return identMetrics;
      }
      if (!(identDock instanceof HTMLElement)) {
        identMetrics = { width, height, left, top, variant, x: 0, y: 0, scale: 1 };
        return identMetrics;
      }
      const dockRect = identDock.getBoundingClientRect();
      identMetrics = {
        width,
        height,
        left,
        top,
        variant,
        x: (dockRect.left + (dockRect.width / 2)) - (left + (width / 2)),
        y: (dockRect.top + (dockRect.height / 2)) - (top + (height / 2)),
        scale: variant === "mobile" ? 0.56 : 0.64,
      };
      return identMetrics;
    }

    function reflectHeroIdent(progress) {
      if (!(ident instanceof HTMLAnchorElement)) return;
      const geometry = heroIdentGeometry();
      const dockProgress = smoothstep(0.04, 0.12, progress);
      const opacity = 1 - smoothstep(0.62, 0.7, progress);
      reflectVariable("--hero-ident-x", `${lerp(0, geometry.x, dockProgress).toFixed(2)}px`);
      reflectVariable("--hero-ident-y", `${lerp(0, geometry.y, dockProgress).toFixed(2)}px`);
      reflectVariable("--hero-ident-scale", lerp(1, geometry.scale, dockProgress).toFixed(5));
      reflectVariable("--hero-ident-opacity", opacity.toFixed(4));
      const hidden = opacity <= 0.001 && document.activeElement !== ident;
      ident.dataset.identHidden = String(hidden);
      if (hidden) {
        ident.tabIndex = -1;
        ident.setAttribute("aria-hidden", "true");
      } else {
        ident.removeAttribute("tabindex");
        ident.removeAttribute("aria-hidden");
      }
    }

    ident?.addEventListener("focusout", () => {
      requestAnimationFrame(() => reflectHeroIdent(filmState().progress));
    });

    function reflectFilmState(state) {
      const { progress } = state;
      const cameraProgress = smoothstep(0.68, 0.9, progress);
      const cameraAmplitude = variant === "mobile" ? 0.025 : 0.045;
      const exposureIn = smoothstep(0.68, 0.77, progress);
      const exposureOut = smoothstep(0.79, 0.9, progress);
      const exposure = Math.max(0, exposureIn - exposureOut) * 0.14;
      reflectVariable("--hero-camera-scale", (1 + (cameraAmplitude * cameraProgress)).toFixed(5));
      reflectVariable("--hero-exposure", exposure.toFixed(4));
      const copyProgress = smoothstep(0.88, 0.98, progress);
      reflectVariable("--hero-copy-progress", copyProgress.toFixed(4));
      reflectVariable("--hero-copy-shift", `${lerp(16, 0, copyProgress).toFixed(2)}px`);
      const workIn = smoothstep(0.69, 0.78, progress);
      const workOut = smoothstep(0.87, 0.95, progress);
      const workOpacity = Math.max(0, workIn - workOut);
      reflectVariable("--hero-work-opacity", workOpacity.toFixed(4));
      reflectVariable("--hero-work-scale", lerp(0.96, 1, workIn).toFixed(5));
      const logoProgress = smoothstep(0.94, 0.985, progress);
      reflectVariable("--hero-logo-opacity", logoProgress.toFixed(4));
      reflectVariable("--hero-logo-scale", lerp(0.965, 1, logoProgress).toFixed(5));
      reflectHeroIdent(progress);
      const act = progressState(progress);
      if (act !== reflectedAct) {
        reflectedAct = act;
        hero.dataset.act = act;
      }
    }

    function renderFilm() {
      if (hero.dataset.mode !== "sequence") return;
      const state = filmState();
      reflectFilmState(state);
      prewarmPortal(state.progress);
      if (state.target !== requestedFrame || renderedFrame < 0) requestScheduledFrame(state.target);
    }

    // Frames are decoded just ahead of the playhead and the cache stays small -
    // 75 decoded 1600x900 bitmaps would cost hundreds of megabytes. Pulling the
    // bytes into the HTTP cache up front is what keeps that decode cheap enough
    // to hold a steady rate.
    function warmFrameBytes() {
      if (bytesWarming || !frameUrls.length) return;
      bytesWarming = true;
      const queue = frameUrls.slice();
      const lanes = variant === "mobile" ? 3 : 5;
      const drain = async () => {
        while (queue.length && !destroyed) {
          const url = queue.shift();
          try {
            const response = await fetch(url, { cache: "force-cache" });
            await response.blob();
          } catch {
            // A cold frame simply decodes on demand instead; nothing to recover.
          }
        }
      };
      for (let lane = 0; lane < lanes; lane += 1) drain();
    }

    function stopFilm() {
      if (!filmFrame) return;
      cancelAnimationFrame(filmFrame);
      filmFrame = 0;
    }

    function settleFilm() {
      if (filmSettled) return;
      filmSettled = true;
      stopFilm();
      playhead = frameCount - 1;
      renderFilm();
      hero.dataset.film = "settled";
      revealSiteNav();
      window.dispatchEvent(new CustomEvent("divani:hero-film-complete"));
    }

    function advanceFilm(now) {
      filmFrame = 0;
      if (destroyed || filmSettled || hero.dataset.mode !== "sequence") return;
      if (!motionAllowed()) {
        settleFilm();
        return;
      }
      // Somebody who scrolls on does not want to come back to a half-drawn
      // frame, so leaving the opening screen finishes the film.
      if (window.scrollY > window.innerHeight * 0.25) {
        settleFilm();
        return;
      }
      // The playhead never runs more than one frame past what has been drawn, so
      // a slow decode slows the film down instead of making it skip frames.
      const elapsed = filmClock ? Math.min(120, now - filmClock) : 0;
      filmClock = now;
      const ceiling = Math.max(renderedFrame, 0) + 1;
      const advanced = Math.min(playhead + ((elapsed / 1000) * FILM_FRAME_RATE), ceiling, frameCount - 1);
      // Never let the ceiling pull the playhead backwards - swapping variants
      // resets renderedFrame, and the film must not rewind because of it.
      playhead = Math.max(playhead, advanced);
      renderFilm();
      if (playhead >= frameCount - 1) {
        settleFilm();
        return;
      }
      filmFrame = requestAnimationFrame(advanceFilm);
    }

    function startFilm() {
      if (destroyed || filmSettled || filmFrame || hero.dataset.mode !== "sequence") return;
      // A restored scroll position means the opening has already been seen.
      if (!motionAllowed() || window.scrollY > 24) {
        settleFilm();
        return;
      }
      hero.dataset.film = "playing";
      filmClock = 0;
      filmFrame = requestAnimationFrame(advanceFilm);
    }

    function prewarmDesignPoster() {
      if (designPosterPrewarmed) return;
      const poster = document.querySelector("img[data-threshold-design-poster]");
      if (!(poster instanceof HTMLImageElement)) return;
      designPosterPrewarmed = true;
      poster.loading = "eager";
      if (typeof poster.decode === "function") poster.decode().catch(() => {});
    }

    function prewarmPortal(progress) {
      if (!designPosterPrewarmed && progress >= 0.55) prewarmDesignPoster();
    }

    function applyVariant(nextVariant) {
      const record = manifest?.variants?.[nextVariant];
      if (!record || !Array.isArray(record.frames) || record.frames.length !== frameCount) throw new Error("Invalid hero variant");
      const nextWidth = Number(record.width);
      const nextHeight = Number(record.height);
      if (!nextWidth || !nextHeight || nextWidth * nextHeight > 2_000_000) throw new Error("Invalid canvas dimensions");
      const nextFrameUrls = record.frames.map((reference) => localAssetUrl(reference, manifestUrl));
      resetFrameLoads();
      variant = nextVariant;
      variantWidth = nextWidth;
      variantHeight = nextHeight;
      frameUrls = nextFrameUrls;
      clearCache();
      renderedFrame = -1;
      requestedFrame = -1;
      identMetrics = null;
      bytesWarming = false;
      if (!hero.classList.contains("is-sequence")) hero.classList.add("is-poster");
    }

    async function start() {
      if (startupCancelled()) return;
      try {
        context = canvas.getContext("2d", { alpha: false, desynchronized: true });
        if (!context) throw new Error("Canvas unavailable");
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        manifestUrl = new URL(hero.dataset.heroManifest, document.baseURI).href;
        const response = await fetch(manifestUrl, { cache: "no-cache" });
        if (startupCancelled()) return;
        if (!response.ok) throw new Error(`Manifest request failed: ${response.status}`);
        manifest = await response.json();
        if (startupCancelled()) return;
        frameCount = Number(manifest.frameCount);
        if (manifest.version !== "hero-v1" || frameCount !== 75) throw new Error("Invalid hero manifest");
        applyVariant(window.matchMedia(MOBILE_QUERY).matches ? "mobile" : "desktop");
        const initialState = filmState();
        reflectFilmState(initialState);
        await loadInitialFrame(initialState.target);
        if (startupCancelled()) return;
        if (renderedFrame !== initialState.target) throw new Error("Initial target frame did not render");
        hero.dataset.frameCount = String(frameCount);
        hero.dataset.mode = "sequence";
        schedulerEnabled = true;
        unsubscribeFramePump = motionDirector.subscribe(pumpFrameQueue);
        window.addEventListener("resize", () => {
          identMetrics = null;
        }, { passive: true });
        window.matchMedia(MOBILE_QUERY).addEventListener("change", (event) => {
          try {
            applyVariant(event.matches ? "mobile" : "desktop");
            warmFrameBytes();
            renderFilm();
          } catch {
            fallback();
          }
        });
        renderFilm();
        hero.dataset.ready = "true";
        hero.dataset.film = "pending";
        window.dispatchEvent(new CustomEvent("divani:hero-ready", { detail: { interactive: true } }));
        root.classList.remove("js-pending");
        warmFrameBytes();
        window.setTimeout(startFilm, Math.max(0, FILM_INTRO_HOLD_MS - performance.now()));
      } catch {
        fallback();
      }
    }

    start();
    prefersReducedMotion.addEventListener("change", (event) => {
      if (event.matches) fallback();
    });
    window.addEventListener("pagehide", (event) => {
      if (!event.persisted) {
        stopFilm();
        unsubscribeFramePump?.();
        unsubscribeFramePump = null;
        resetFrameLoads();
        clearCache();
        destroyed = true;
      }
    });
    window.addEventListener("pageshow", (event) => {
      if (!event.persisted || destroyed || hero.dataset.mode !== "sequence") return;
      identMetrics = null;
      renderedFrame = -1;
      filmClock = 0;
      renderFilm();
      if (!filmSettled && !filmFrame) filmFrame = requestAnimationFrame(advanceFilm);
    });
  }

  function initialiseMotionSystem() {
    const hero = document.querySelector("#proof[data-hero-sequence]");
    if (hero instanceof HTMLElement && hero.dataset.ready !== "true") {
      window.addEventListener("divani:hero-ready", initialiseMotionSystem, { once: true });
      return;
    }
    if (!(hero instanceof HTMLElement) || hero.dataset.mode !== "sequence") {
      lockStaticMotion();
      return;
    }
    const threshold = document.querySelector(".threshold-stage");
    const portal = threshold?.querySelector(".threshold-portal");
    const thresholdDesignVideo = threshold?.querySelector("video[data-film-gate='threshold']");
    const thresholdDesignPoster = threshold?.querySelector("img[data-threshold-design-poster]");
    const scrubbedStages = [...document.querySelectorAll("[data-motion-stage]")]
      .filter((stage) => stage !== threshold && !stage.matches("[data-motion-stage='threshold']"));
    const enterElements = [...document.querySelectorAll("[data-motion-enter]")];
    const activeStages = new Set();
    let thresholdArmed = false;
    let portalSupported = typeof CSS.supports === "function" && CSS.supports("clip-path", "inset(10%)");

    if (!motionAllowed() || !(threshold instanceof HTMLElement) || !(portal instanceof HTMLElement) || !("IntersectionObserver" in window)) {
      lockStaticMotion();
      return;
    }

    root.classList.toggle("portal-clip-supported", portalSupported);
    root.classList.toggle("portal-clip-fallback", !portalSupported);

    function settleThresholdWithoutPortal() {
      if (!motionAllowed()) return;
      threshold.dataset.motionProgress = "1.0000";
      threshold.classList.remove("is-motion-active");
      threshold.style.setProperty("--motion-progress", "1");
      threshold.style.setProperty("--threshold-copy-opacity", "1");
      threshold.style.setProperty("--threshold-copy-shift", "0px");
      threshold.style.setProperty("--threshold-design-scale", "1");
      portal.style.clipPath = "none";
      portal.style.opacity = "1";
    }

    function disablePortal() {
      portalSupported = false;
      root.classList.remove("portal-clip-supported");
      root.classList.add("portal-clip-fallback");
      settleThresholdWithoutPortal();
    }

    if (thresholdDesignPoster instanceof HTMLImageElement) {
      thresholdDesignPoster.addEventListener("error", () => {
        threshold.classList.add("is-portal-media-failed");
        disablePortal();
      }, { once: true });
    }

    function stickyProgress(element) {
      const rect = element.getBoundingClientRect();
      const travel = Math.max(1, element.offsetHeight - window.innerHeight);
      return clamp(-rect.top / travel);
    }

    function entryProgress(element) {
      const rect = element.getBoundingClientRect();
      const travel = Math.max(1, window.innerHeight * 0.82);
      return clamp((window.innerHeight - rect.top) / travel);
    }

    function applyThresholdProgress() {
      if (!motionAllowed()) return;
      if (!portalSupported) {
        settleThresholdWithoutPortal();
        return;
      }
      const progress = stickyProgress(threshold);
      const copyProgress = smoothstep(0.52, 0.92, progress);
      const designScaleProgress = smoothstep(0.14, 0.76, progress);

      threshold.dataset.motionProgress = progress.toFixed(4);
      threshold.classList.toggle("is-motion-active", progress > 0 && progress < 1);
      threshold.style.setProperty("--motion-progress", progress.toFixed(4));
      threshold.style.setProperty("--threshold-copy-opacity", copyProgress.toFixed(4));
      threshold.style.setProperty("--threshold-copy-shift", "0px");
      threshold.style.setProperty("--threshold-design-scale", lerp(1.06, 1, designScaleProgress).toFixed(5));
      portal.style.opacity = "1";

      if (thresholdDesignVideo instanceof HTMLVideoElement) {
        const eligible = progress >= 0.135;
        if (thresholdDesignVideo.dataset.filmEligible !== String(eligible)) {
          thresholdDesignVideo.dataset.filmEligible = String(eligible);
          thresholdDesignVideo.dispatchEvent(new CustomEvent("divani:film-eligibility"));
        }
      }

      portal.style.clipPath = "inset(0% 0% 0% 0%)";
    }

    function applyStageProgress(stage, progress) {
      if (!(stage instanceof HTMLElement)) return;
      const type = stage.dataset.motionStage || "";
      const variant = stage.dataset.motionVariant || "";
      let startScale = 1;
      if (type === "capability") {
        startScale = variant === "design" ? 1.06 : variant === "fitout" ? 1.035 : 1.015;
      } else if (type === "selected-work") {
        startScale = 1.06;
      } else if (type === "readiness") {
        startScale = 1.04;
      }

      stage.dataset.motionProgress = progress.toFixed(4);
      stage.style.setProperty("--motion-progress", progress.toFixed(4));
      stage.style.setProperty("--scene-scale", lerp(startScale, 1, smoothstep(0, 0.9, progress)).toFixed(5));
      // The veil panels used to wipe sideways out of frame; they cross-fade now,
      // so data-motion-direction no longer feeds the reveal at all.
      const veilProgress = smoothstep(0.05, 0.92, progress);
      stage.style.setProperty("--scene-veil", (1 - veilProgress).toFixed(4));
      stage.style.setProperty("--scene-exposure", (variant === "development"
        ? Math.max(0, smoothstep(0.08, 0.28, progress) - smoothstep(0.35, 0.72, progress)) * 0.16
        : 0).toFixed(4));
      if (type === "capability" && progress >= 0.34 && stage.dataset.motionCopyEntered !== "true") {
        stage.querySelector("[data-motion-enter='capability-copy']")?.classList.add("is-entered");
        stage.dataset.motionCopyEntered = "true";
      }
      // The division photo fades in off its own observer so the reveal lands
      // when the photo is on screen. This is only a failsafe against a photo
      // stranded at opacity 0, and it has to measure the photo rather than the
      // chapter: the design chapter runs 2.4 viewports tall, so chapter progress
      // is already 1 long before its photo reaches the fold, and keying off that
      // marked the photo entered before it was ever visible.
      if (type === "capability" && stage.dataset.motionMediaEntered !== "true") {
        const media = stage.querySelector("[data-motion-enter='capability-media']");
        if (media instanceof HTMLElement) {
          const rect = media.getBoundingClientRect();
          if (rect.bottom > 0 && rect.top < window.innerHeight * 0.45) {
            media.classList.add("is-entered");
            stage.dataset.motionMediaEntered = "true";
          }
        }
      }
      if (type === "relationships" && progress >= 0.44 && stage.dataset.motionMarksEntered !== "true") {
        for (const mark of stage.querySelectorAll("[data-motion-enter='relationship-mark']")) mark.classList.add("is-entered");
        stage.dataset.motionMarksEntered = "true";
      }
    }

    function updateMotion() {
      if (!motionAllowed()) return;
      if (thresholdArmed) applyThresholdProgress();
      for (const stage of activeStages) applyStageProgress(stage, entryProgress(stage));
    }

    const restoringScroll = window.scrollY > 1;
    if (restoringScroll) applyThresholdProgress();
    const thresholdObserver = new IntersectionObserver((entries) => {
      if (!motionAllowed()) return;
      for (const entry of entries) {
        if (entry.target !== threshold) continue;
        thresholdArmed = entry.isIntersecting;
        if (!thresholdArmed) applyThresholdProgress();
      }
      motionDirector.schedule();
    }, { rootMargin: "20% 0px", threshold: 0 });
    thresholdObserver.observe(threshold);

    const stageObserver = new IntersectionObserver((entries) => {
      if (!motionAllowed()) return;
      for (const entry of entries) {
        const stage = entry.target;
        if (!(stage instanceof HTMLElement)) continue;
        if (entry.isIntersecting) {
          activeStages.add(stage);
          stage.classList.add("is-motion-active");
        } else {
          applyStageProgress(stage, stage.getBoundingClientRect().top < 0 ? 1 : 0);
          activeStages.delete(stage);
          stage.classList.remove("is-motion-active");
        }
      }
      motionDirector.schedule();
    }, { rootMargin: "85% 0px", threshold: 0 });
    scrubbedStages.forEach((stage) => stageObserver.observe(stage));

    const enterObserver = new IntersectionObserver((entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || !(entry.target instanceof HTMLElement)) continue;
        entry.target.classList.add("is-entered");
        observer.unobserve(entry.target);
      }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

    for (const element of enterElements) {
      const motionIndex = Number(element.getAttribute("data-motion-index"));
      if (Number.isInteger(motionIndex) && motionIndex >= 0) {
        const delayIndex = element.matches("[data-motion-enter='relationship-mark']")
          ? Math.min(motionIndex, 7)
          : motionIndex;
        element.style.setProperty("--motion-delay", `${delayIndex * 60}ms`);
      }
      if (!restoringScroll) {
        if (!element.matches("[data-motion-enter='capability-copy'], [data-motion-enter='relationship-mark']")) {
          enterObserver.observe(element);
        }
        continue;
      }
      const rect = element.getBoundingClientRect();
      const capabilityStage = element.closest("[data-motion-stage='capability']");
      if (element.matches("[data-motion-enter='capability-copy']") && capabilityStage instanceof HTMLElement) {
        const stageRect = capabilityStage.getBoundingClientRect();
        if (stageRect.bottom <= 0 || entryProgress(capabilityStage) >= 0.34) element.classList.add("is-entered");
        continue;
      }
      const relationshipStage = element.closest("[data-motion-stage='relationships']");
      if (element.matches("[data-motion-enter='relationship-mark']") && relationshipStage instanceof HTMLElement) {
        const stageRect = relationshipStage.getBoundingClientRect();
        if (stageRect.bottom <= 0 || entryProgress(relationshipStage) >= 0.44) element.classList.add("is-entered");
        continue;
      }
      if (rect.bottom <= 0 || rect.top <= window.innerHeight * 0.92) element.classList.add("is-entered");
      else enterObserver.observe(element);
    }

    const revealFocusedContent = (event) => {
      if (!(event.target instanceof Element)) return;
      event.target.closest("[data-motion-enter]")?.classList.add("is-entered");
    };
    document.addEventListener("focusin", revealFocusedContent, { capture: true });

    if (restoringScroll) {
      for (const stage of scrubbedStages) {
        if (!(stage instanceof HTMLElement)) continue;
        const rect = stage.getBoundingClientRect();
        const progress = rect.bottom <= 0 ? 1 : rect.top >= window.innerHeight ? 0 : entryProgress(stage);
        applyStageProgress(stage, progress);
      }
    }
    root.classList.add("motion-ready");
    updateMotion();
    const unsubscribe = motionDirector.subscribe(updateMotion);
    const handleMotionPreference = (event) => {
      if (!event.matches) return;
      thresholdObserver.disconnect();
      stageObserver.disconnect();
      enterObserver.disconnect();
      lockStaticMotion();
    };
    prefersReducedMotion.addEventListener("change", handleMotionPreference);

    function alignCapabilitiesHash() {
      if (window.location.hash !== "#capabilities" && window.location.hash !== "#capabilities-title") return;
      const title = document.querySelector("#capabilities-title");
      if (!(title instanceof HTMLElement)) return;
      requestAnimationFrame(() => scrollToCapabilitiesIntro(title));
    }

    alignCapabilitiesHash();
    window.addEventListener("hashchange", alignCapabilitiesHash, { passive: true });
    window.addEventListener("pagehide", (event) => {
      if (event.persisted) return;
      unsubscribe();
      thresholdObserver.disconnect();
      stageObserver.disconnect();
      enterObserver.disconnect();
      prefersReducedMotion.removeEventListener("change", handleMotionPreference);
      document.removeEventListener("focusin", revealFocusedContent, { capture: true });
    });
  }

  function initialiseCapabilityMedia() {
    const videos = [...document.querySelectorAll("video[data-capability-film]")];
    const visibleVideos = new Set();

    function activate(video, includeVideo) {
      if (video.dataset.posterActivated !== "true") {
        const poster = video.dataset.poster;
        if (poster) video.poster = poster;
        video.dataset.posterActivated = "true";
      }

      const gateEligible = !video.dataset.filmGate || video.dataset.filmEligible === "true";
      if (!includeVideo || !gateEligible || video.dataset.videoActivated === "true") return;
      let hasSource = false;
      for (const source of video.querySelectorAll("source[data-src]")) {
        if (!(source instanceof HTMLSourceElement) || !source.dataset.src) continue;
        source.src = source.dataset.src;
        hasSource = true;
      }
      if (!hasSource) return;
      video.preload = "auto";
      video.dataset.videoActivated = "true";
      video.load();
    }

    function restorePoster(video) {
      video.pause();
      for (const source of video.querySelectorAll("source")) source.removeAttribute("src");
      video.removeAttribute("src");
      video.dataset.videoActivated = "false";
      video.dataset.playback = "poster";
      video.dataset.playable = "false";
      video.load();
    }

    function refreshVisibleVideo(video) {
      const rect = video.getBoundingClientRect();
      const visibleWidth = Math.max(0, Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0));
      const visibleHeight = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
      const area = Math.max(1, rect.width * rect.height);
      if ((visibleWidth * visibleHeight) / area >= 0.35) visibleVideos.add(video);
      else visibleVideos.delete(video);
    }

    function syncPlayback(video) {
      if (!motionAllowed()) {
        if (video.dataset.videoActivated === "true") restorePoster(video);
        else video.pause();
        return;
      }
      if (video.dataset.filmGate && video.dataset.filmEligible !== "true") {
        video.pause();
        return;
      }
      if (video.dataset.playback === "failed") {
        video.pause();
        return;
      }
      if (!document.hidden && visibleVideos.has(video) && video.dataset.playback !== "ended") {
        activate(video, true);
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }

    for (const video of videos) {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.loop = false;
      video.dataset.playback = "idle";
      video.dataset.playable = "false";
      video.addEventListener("canplay", () => {
        video.dataset.playable = "true";
        refreshVisibleVideo(video);
        syncPlayback(video);
      });
      video.addEventListener("ended", () => {
        video.dataset.playback = "ended";
        video.pause();
      });
      video.addEventListener("error", () => {
        if (video.dataset.playback === "failed") return;
        video.dataset.playback = "failed";
        video.pause();
        for (const source of video.querySelectorAll("source")) source.removeAttribute("src");
        video.removeAttribute("src");
        video.dataset.videoActivated = "false";
        video.dataset.playable = "false";
      });
      video.addEventListener("divani:film-eligibility", () => syncPlayback(video));
    }

    if (!("IntersectionObserver" in window)) {
      videos.forEach((video) => activate(video, false));
      return;
    }

    let observersStarted = false;
    function startObservers() {
      if (observersStarted) return;
      observersStarted = true;
      const loadObserver = new IntersectionObserver((entries, observer) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || !(entry.target instanceof HTMLVideoElement)) continue;
          activate(entry.target, motionAllowed());
          observer.unobserve(entry.target);
        }
      }, { rootMargin: "25% 0px", threshold: 0 });
      videos.forEach((video) => loadObserver.observe(video));

      const playbackObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          const video = entry.target;
          if (!(video instanceof HTMLVideoElement)) continue;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.35) visibleVideos.add(video);
          else visibleVideos.delete(video);
          syncPlayback(video);
        }
      }, { threshold: [0, 0.35, 0.75] });
      videos.forEach((video) => playbackObserver.observe(video));
      const syncAll = () => videos.forEach(syncPlayback);
      prefersReducedMotion.addEventListener("change", (event) => {
        if (event.matches) lockStaticMotion();
        syncAll();
      });
      document.addEventListener("visibilitychange", syncAll);
    }

    startObservers();
    window.addEventListener("pagehide", () => videos.forEach((video) => video.pause()));
  }

  function initialiseProjectRunway() {
    const runway = document.querySelector("[data-project-runway]");
    if (!(runway instanceof HTMLElement)) return;
    const viewport = runway.querySelector("[data-runway-viewport]");
    const slides = [...runway.querySelectorAll("[data-runway-slide]")];
    const ticks = [...runway.querySelectorAll("[data-runway-jump]")];
    const counter = runway.querySelector("[data-runway-counter]");
    if (!(viewport instanceof HTMLElement) || !slides.length) return;

    const stickyQuery = window.matchMedia("(min-width: 56.25rem)");
    const total = String(slides.length).padStart(2, "0");
    const ofLabel = counter?.dataset.ofLabel || "of";
    let index = -1;

    function stickyMode() {
      return stickyQuery.matches && motionAllowed() && root.classList.contains("motion-ready");
    }

    function setIndex(next) {
      const clamped = Math.min(slides.length - 1, Math.max(0, next));
      if (clamped === index) return;
      index = clamped;
      for (const [position, slide] of slides.entries()) {
        slide.dataset.runwayActive = String(position === index);
      }
      for (const [position, tick] of ticks.entries()) {
        if (position === index) tick.setAttribute("aria-current", "true");
        else tick.removeAttribute("aria-current");
      }
      if (counter) counter.textContent = `${String(index + 1).padStart(2, "0")} ${ofLabel} ${total}`;
    }

    // Desktop: the runway is taller than the viewport it sticks inside, and that
    // travel is what selects the frame.
    function updateFromScroll() {
      if (!stickyMode()) return;
      const rect = runway.getBoundingClientRect();
      const travel = Math.max(1, runway.offsetHeight - window.innerHeight);
      const progress = clamp(-rect.top / travel);
      const position = progress * slides.length;
      setIndex(Math.min(slides.length - 1, Math.floor(position)));

      // How far through the current frame we are, which is what fills the
      // active segment of the control.
      runway.style.setProperty("--frame-progress", clamp(position - Math.floor(position)).toFixed(4));

      // The opening frame holds the whole screen for the first half of its own
      // band, then the stage zooms back into the window the rest play inside.
      const openingBand = clamp(progress * slides.length);
      const shrink = smoothstep(0.5, 1, openingBand);
      runway.style.setProperty("--runway-shrink", shrink.toFixed(4));
      runway.dataset.runwayChrome = shrink > 0.02 ? "on" : "off";

      // The stage sits at its 3:2 size in layout, so full bleed is that box
      // scaled up until it covers the viewport. CSS cannot divide one length by
      // another, so the cover factor has to be measured here.
      const frameWidth = slides[0].offsetWidth || 1;
      const frameHeight = slides[0].offsetHeight || 1;
      const cover = Math.max(window.innerWidth / frameWidth, window.innerHeight / frameHeight);
      runway.style.setProperty("--runway-cover", lerp(cover, 1, shrink).toFixed(4));
    }

    // Phones: the native snap scroller is the source of truth, so the counter
    // follows the finger rather than a scroll calculation.
    function updateFromSwipe() {
      if (stickyMode()) return;
      const centre = viewport.scrollLeft + (viewport.clientWidth / 2);
      let nearest = 0;
      let best = Number.POSITIVE_INFINITY;
      for (const [position, slide] of slides.entries()) {
        const distance = Math.abs((slide.offsetLeft + (slide.offsetWidth / 2)) - centre);
        if (distance < best) {
          best = distance;
          nearest = position;
        }
      }
      setIndex(nearest);
    }

    function goTo(position) {
      const clamped = Math.min(slides.length - 1, Math.max(0, position));
      if (stickyMode()) {
        const travel = Math.max(1, runway.offsetHeight - window.innerHeight);
        const top = window.scrollY + runway.getBoundingClientRect().top;
        // Aim at the middle of that frame's band so it is unambiguously selected.
        window.scrollTo({ top: top + (travel * ((clamped + 0.5) / slides.length)), behavior: "smooth" });
      } else {
        slides[clamped]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
      setIndex(clamped);
    }

    for (const [position, tick] of ticks.entries()) {
      tick.addEventListener("click", () => goTo(position));
    }
    viewport.addEventListener("scroll", () => {
      updateFromSwipe();
      // Once they have swiped they know they can; the cue stops asking.
      if (!stickyMode()) runway.dataset.runwaySwiped = "true";
    }, { passive: true });
    viewport.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const forward = document.documentElement.dir === "rtl" ? "ArrowLeft" : "ArrowRight";
      goTo(index + (event.key === forward ? 1 : -1));
    });
    motionDirector.subscribe(updateFromScroll);
    stickyQuery.addEventListener("change", () => {
      index = -1;
      if (stickyMode()) updateFromScroll();
      else updateFromSwipe();
    });

    // Each slide spills its own colour behind the frame. Taken from the tile
    // already on the page, so it costs no extra request.
    for (const slide of slides) {
      const source = slide.querySelector("img");
      if (source instanceof HTMLImageElement) {
        slide.style.setProperty("--photo", `url("${source.currentSrc || source.src}")`);
      }
    }

    setIndex(0);
    if (stickyMode()) updateFromScroll();

    initialiseProjectLightbox(runway);
  }

  function initialiseProjectLightbox(scope) {
    const lightbox = document.querySelector("dialog[data-project-lightbox]");
    const triggers = [...scope.querySelectorAll("[data-project-open]")];
    if (!triggers.length) return;
    // Each frame is a real link to the full photograph, so without JS - or
    // without dialog support - it still opens.
    if (!(lightbox instanceof HTMLElement) || typeof lightbox.showModal !== "function") return;

    const image = lightbox.querySelector("[data-lightbox-image]");
    const counter = lightbox.querySelector("[data-lightbox-counter]");
    const slides = triggers.map((trigger) => ({
      full: trigger.getAttribute("href") || "",
      alt: trigger.querySelector("img")?.alt || "",
    }));
    const total = String(slides.length).padStart(2, "0");
    const ofLabel = counter?.dataset.ofLabel || "of";
    let index = 0;
    let opener = null;

    function preload(position) {
      const slide = slides[(position + slides.length) % slides.length];
      if (!slide) return;
      const warm = new Image();
      warm.decoding = "async";
      warm.src = slide.full;
    }

    function show(position) {
      index = (position + slides.length) % slides.length;
      const slide = slides[index];
      if (image instanceof HTMLImageElement) {
        image.src = slide.full;
        image.alt = slide.alt;
      }
      if (counter) counter.textContent = `${String(index + 1).padStart(2, "0")} ${ofLabel} ${total}`;
      preload(index + 1);
      preload(index - 1);
    }

    // Idempotent, and driven from every close path rather than from the dialog
    // close event alone - if that event is ever missed the page would be left
    // permanently unscrollable, which is a far worse failure than running twice.
    function restore() {
      document.body.style.removeProperty("overflow");
      if (image instanceof HTMLImageElement) image.removeAttribute("src");
      const trigger = opener;
      opener = null;
      trigger?.focus({ preventScroll: true });
    }

    function close() {
      if (lightbox.open) lightbox.close();
      restore();
    }

    lightbox.addEventListener("close", restore);
    lightbox.addEventListener("cancel", restore);
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) close();
    });
    lightbox.querySelector("[data-lightbox-close]")?.addEventListener("click", close);
    lightbox.querySelector("[data-lightbox-prev]")?.addEventListener("click", () => show(index - 1));
    lightbox.querySelector("[data-lightbox-next]")?.addEventListener("click", () => show(index + 1));
    lightbox.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const forward = document.documentElement.dir === "rtl" ? "ArrowLeft" : "ArrowRight";
      show(index + (event.key === forward ? 1 : -1));
    });

    let touchX = null;
    lightbox.addEventListener("touchstart", (event) => {
      touchX = event.changedTouches[0]?.clientX ?? null;
    }, { passive: true });
    lightbox.addEventListener("touchend", (event) => {
      if (touchX === null) return;
      const delta = (event.changedTouches[0]?.clientX ?? touchX) - touchX;
      touchX = null;
      if (Math.abs(delta) < 45) return;
      const rtl = document.documentElement.dir === "rtl";
      show(index + ((delta < 0) === rtl ? -1 : 1));
    }, { passive: true });

    for (const [position, trigger] of triggers.entries()) {
      trigger.addEventListener("click", (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        event.preventDefault();
        opener = trigger;
        show(position);
        lightbox.showModal();
        // showModal alone leaves the page behind scrollable on iOS.
        document.body.style.overflow = "hidden";
      });
    }
  }

  function initialiseProjectBrief() {
    const form = document.querySelector("form[data-project-brief-form]");
    const nativeForm = document.querySelector("form[data-project-brief-native]");
    if (!(form instanceof HTMLFormElement)) return;
    const nativeText = nativeForm instanceof HTMLFormElement
      ? nativeForm.elements.namedItem("text")
      : null;
    const directWhatsAppLink = document.querySelector(".project-brief__intro a[href*='wa.me']");
    if (directWhatsAppLink instanceof HTMLAnchorElement) {
      directWhatsAppLink.addEventListener("focus", () => {
        const keepVisible = () => directWhatsAppLink.scrollIntoView({ block: "center", inline: "nearest" });
        keepVisible();
        requestAnimationFrame(keepVisible);
      });
    }
    const fallbackLink = form.querySelector("[data-whatsapp-fallback]");
    const status = form.querySelector("[data-brief-status]");
    const division = form.elements.namedItem("division");
    const fieldOrder = ["name", "contact", "city", "division", "stage", "brief"];
    for (const field of fieldOrder) {
      const control = form.elements.namedItem(field);
      if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement || control instanceof HTMLTextAreaElement)) continue;
      const clearCustomValidity = () => {
        control.setCustomValidity("");
        if (fallbackLink instanceof HTMLAnchorElement) fallbackLink.hidden = true;
        if (status) status.textContent = "";
      };
      control.addEventListener("input", clearCustomValidity);
      control.addEventListener("change", clearCustomValidity);
    }
    for (const link of document.querySelectorAll("[data-brief-division]")) {
      link.addEventListener("click", () => {
        if (!(division instanceof HTMLSelectElement)) return;
        const requested = link.getAttribute("data-brief-division") || "";
        if ([...division.options].some((option) => option.value === requested || option.text === requested)) {
          division.value = requested;
        }
      });
    }
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const arabic = document.body.dataset.locale === "ar";
      const labels = arabic
        ? { name: "الاسم", contact: "التواصل", city: "المدينة", division: "المجال", stage: "مرحلة المشروع", brief: "الملخص" }
        : { name: "Name", contact: "Contact", city: "City", division: "Division", stage: "Project stage", brief: "Brief" };
      const values = {};
      for (const field of fieldOrder) values[field] = String(data.get(field) || "").trim();
      const emptyField = fieldOrder.find((field) => !values[field]);
      if (emptyField) {
        const control = form.elements.namedItem(emptyField);
        if (control instanceof HTMLInputElement || control instanceof HTMLSelectElement || control instanceof HTMLTextAreaElement) {
          control.setCustomValidity(arabic ? "يرجى إدخال قيمة، لا مسافات فقط." : "Enter a value, not spaces only.");
          control.reportValidity();
          control.focus();
        }
        return;
      }
      const lines = [arabic ? "طلب مشروع جديد — ديفاني" : "New project brief — Divani"];
      for (const field of fieldOrder) lines.push(`${labels[field]}: ${values[field]}`);
      const configuredNumber = String(form.dataset.whatsappNumber || "").replace(/\D/gu, "");
      const number = configuredNumber || WHATSAPP_NUMBER;
      const url = `https://wa.me/${number}?text=${encodeURIComponent(lines.join("\n"))}`;
      if (fallbackLink instanceof HTMLAnchorElement) {
        fallbackLink.href = url;
        fallbackLink.hidden = false;
      }
      const popup = window.open(url, "_blank");
      if (popup) popup.opener = null;
      else if (fallbackLink instanceof HTMLAnchorElement) fallbackLink.focus();
      if (status) {
        status.textContent = popup
          ? (arabic ? "فُتحت مسودة واتساب في نافذة جديدة." : "Your WhatsApp draft opened in a new window.")
          : (arabic ? "تعذر فتح النافذة. استخدم رابط المسودة الظاهر أدناه." : "The new window was blocked. Use the prepared draft link below.");
      }
    });

    const nativeFallbackInUse = nativeText instanceof HTMLTextAreaElement &&
      (document.activeElement === nativeText || nativeText.value.length > 0);
    if (!nativeFallbackInUse) {
      form.hidden = false;
      if (nativeForm instanceof HTMLFormElement) nativeForm.hidden = true;
    }
  }

  function initialiseClientMarquee() {
    const marquee = document.querySelector(".relationship-marks");
    if (!(marquee instanceof HTMLElement) || marquee.dataset.marqueeReady === "true") return;
    const controls = document.querySelector("[data-client-marquee-controls]");
    const toggle = controls?.querySelector("[data-client-marquee-toggle]");

    const clients = Array.from(marquee.querySelectorAll(":scope > figure"));
    if (clients.length < 2) return;

    const logoClients = clients.filter((client) => !client.classList.contains("relationship-mark--profile"));
    const nameClients = clients.filter((client) => client.classList.contains("relationship-mark--profile"));
    const interleaved = [];
    let nameIndex = 0;

    logoClients.forEach((client, logoIndex) => {
      interleaved.push(client);
      const nextNameIndex = Math.round(((logoIndex + 1) * nameClients.length) / logoClients.length);
      while (nameIndex < nextNameIndex) {
        interleaved.push(nameClients[nameIndex]);
        nameIndex += 1;
      }
    });
    while (nameIndex < nameClients.length) {
      interleaved.push(nameClients[nameIndex]);
      nameIndex += 1;
    }

    const lanes = [[], []];
    interleaved.forEach((client, index) => lanes[index % lanes.length].push(client));
    marquee.replaceChildren();

    lanes.forEach((laneClients, laneIndex) => {
      const lane = document.createElement("div");
      const track = document.createElement("div");
      const originalSet = document.createElement("div");
      const duplicateSet = document.createElement("div");
      lane.className = "client-marquee__lane";
      lane.dataset.marqueeLane = String(laneIndex + 1);
      track.className = "client-marquee__track";
      originalSet.className = "client-marquee__set";
      duplicateSet.className = "client-marquee__set client-marquee__set--duplicate";
      duplicateSet.setAttribute("aria-hidden", "true");

      laneClients.forEach((client) => {
        const originalImage = client.querySelector("img");
        if (originalImage instanceof HTMLImageElement) {
          originalImage.width = 1200;
          originalImage.height = 448;
          // The lanes bring marks into view by transform, and a transform does not
          // reliably re-run lazy-load evaluation - so marks scrolled in blank and
          // filled a beat later, which reads as logos disappearing. deferClientMarquee
          // already holds this build until the section is two viewports away, so the
          // whole strip can load now: nothing is fetched on first paint either way.
          originalImage.loading = "eager";
        }
        originalSet.append(client);
        const duplicate = client.cloneNode(true);
        if (!(duplicate instanceof HTMLElement)) return;
        duplicate.removeAttribute("data-motion-enter");
        duplicate.removeAttribute("data-motion-index");
        duplicate.querySelectorAll("img").forEach((image) => image.setAttribute("alt", ""));
        duplicateSet.append(duplicate);
      });

      track.append(originalSet, duplicateSet);
      lane.append(track);
      marquee.append(lane);
    });

    marquee.dataset.marqueeReady = "true";
    if (controls instanceof HTMLElement && toggle instanceof HTMLButtonElement && motionAllowed()) {
      const pauseLabel = toggle.dataset.pauseLabel || "Pause client logo motion";
      const resumeLabel = toggle.dataset.resumeLabel || "Resume client logo motion";
      const togglePaused = () => {
        const paused = toggle.getAttribute("aria-pressed") !== "true";
        toggle.setAttribute("aria-pressed", String(paused));
        toggle.textContent = paused ? resumeLabel : pauseLabel;
        marquee.dataset.marqueePaused = String(paused);
      };
      toggle.addEventListener("click", togglePaused);
      toggle.addEventListener("keydown", (event) => {
        if (event.repeat || (event.key !== "Enter" && event.key !== " ")) return;
        event.preventDefault();
        togglePaused();
      });
      controls.hidden = false;
    }
  }

  function deferClientMarquee() {
    const section = document.querySelector("#relationships");
    if (!(section instanceof HTMLElement) || !("IntersectionObserver" in window)) {
      initialiseClientMarquee();
      return;
    }
    // Building the marquee makes the browser fetch all 49 logos regardless of
    // loading="lazy" - measured at 2621 KB on a cold mobile load, for a section
    // that sits 7800px below the fold. Holding the build until the section is
    // approached keeps the static markup's lazy behaviour intact on first paint.
    const observer = new IntersectionObserver((entries, self) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        self.disconnect();
        initialiseClientMarquee();
      }
    }, { rootMargin: "200% 0px" });
    observer.observe(section);
  }

  function initialiseSiteNav() {
    const nav = document.querySelector("[data-site-nav]");
    if (!(nav instanceof HTMLElement)) return;
    const toggle = nav.querySelector("[data-site-nav-toggle]");
    const toggleLabel = toggle?.querySelector(".site-nav__toggle-label");
    const collapsedQuery = window.matchMedia(NAV_COLLAPSED_QUERY);
    const entries = [...nav.querySelectorAll("[data-nav-link]")]
      .map((link) => ({ link, section: document.getElementById(link.getAttribute("data-nav-link") || "") }))
      .filter((entry) => entry.link instanceof HTMLAnchorElement && entry.section instanceof HTMLElement);

    function setOpen(open) {
      nav.dataset.navOpen = String(open);
      if (!(toggle instanceof HTMLButtonElement)) return;
      toggle.setAttribute("aria-expanded", String(open));
      if (!(toggleLabel instanceof HTMLElement)) return;
      const next = open ? toggleLabel.dataset.closeLabel : toggleLabel.dataset.openLabel;
      if (next) toggleLabel.textContent = next;
    }

    setOpen(false);
    toggle?.addEventListener("click", () => setOpen(nav.dataset.navOpen !== "true"));
    for (const link of nav.querySelectorAll("a")) {
      link.addEventListener("click", () => setOpen(false));
    }
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || nav.dataset.navOpen !== "true") return;
      setOpen(false);
      if (toggle instanceof HTMLButtonElement) toggle.focus();
    });
    document.addEventListener("pointerdown", (event) => {
      if (nav.dataset.navOpen !== "true") return;
      if (event.target instanceof Node && nav.contains(event.target)) return;
      setOpen(false);
    });
    collapsedQuery.addEventListener("change", () => setOpen(false));

    // Sections here are tall and several of them are sticky, so intersection
    // ratios read badly. The section crossing the reading line is the honest one.
    function markCurrentSection() {
      if (!entries.length) return;
      const line = window.innerHeight * 0.34;
      let current = null;
      for (const entry of entries) {
        if (entry.section.getBoundingClientRect().top - line <= 0) current = entry;
      }
      const documentEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
      if (documentEnd) current = entries[entries.length - 1];
      for (const entry of entries) {
        if (entry === current) entry.link.setAttribute("aria-current", "true");
        else entry.link.removeAttribute("aria-current");
      }
    }

    motionDirector.subscribe(markCurrentSection);

    const hero = document.querySelector("#proof[data-hero-sequence]");
    if (!(hero instanceof HTMLElement) || !motionAllowed()) {
      revealSiteNav();
      return;
    }
    window.addEventListener("divani:hero-film-complete", revealSiteNav, { once: true });
    window.addEventListener("scroll", () => {
      if (window.scrollY > 24) revealSiteNav();
    }, { passive: true });
    // Nothing is worth hiding the navigation permanently for, so a stalled film
    // still releases it.
    window.setTimeout(revealSiteNav, 14000);
  }

  function initialiseSite() {
    initialiseSkipLink();
    initialiseSiteNav();
    deferClientMarquee();
    window.setTimeout(initialiseHeroSequence, 0);
    window.setTimeout(initialiseMotionSystem, 0);
    window.setTimeout(initialiseCapabilityMedia, 0);
    window.setTimeout(initialiseProjectRunway, 0);
    window.setTimeout(initialiseProjectBrief, 0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialiseSite, { once: true });
  } else {
    initialiseSite();
  }
})();
