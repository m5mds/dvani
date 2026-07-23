(() => {
  "use strict";

  const root = document.documentElement;
  root.classList.remove("no-js");
  root.classList.add("js");

  const LANGUAGE_ANCHOR_ALLOWLIST = new Set(["proof", "about", "why-divani", "capabilities", "relationships", "selected-work", "project-brief", "contact"]);
  const MOBILE_QUERY = "(max-width: 767px)";
  const PROJECT_RUNWAY_QUERY = "(min-width: 900px)";
  const WHATSAPP_NUMBER = "966531100366";
  const INITIAL_RENDER_LOCKS = [
    "brief-render-pending", "capabilities-render-pending", "hero-text-render-pending",
    "threshold-render-pending", "design-copy-render-pending",
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
      element.style.removeProperty("--scene-shift");
      element.style.removeProperty("--scene-exposure");
      element.style.removeProperty("--scene-shift-opposite");
      element.classList.remove("is-motion-active");
    }
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
    for (const stage of document.querySelectorAll("[data-project-frame]")) {
      if (!(stage instanceof HTMLElement)) continue;
      stage.removeAttribute("data-cut-phase");
      stage.removeAttribute("aria-busy");
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
    const link = document.querySelector("a.skip-link[href='#capabilities-title']");
    const target = document.querySelector("#capabilities-title[tabindex='-1']");
    if (!(link instanceof HTMLAnchorElement) || !(target instanceof HTMLElement)) return;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      try {
        window.history.pushState(null, "", "#capabilities");
      } catch {
        window.location.hash = "capabilities";
      }
      syncLanguageSwitch();
      try {
        target.focus({ preventScroll: true });
      } catch {
        target.focus();
      }
      scrollToCapabilitiesIntro(target);
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
    let lastScheduledTarget = 0;
    let scrollDirection = 1;
    let frameQueue = [];
    let schedulerEnabled = false;
    let prefetchArmed = false;
    let prefetchWindowTarget = null;
    let prefetchWindowDirection = 0;
    let designPosterPrewarmed = false;
    let unsubscribeScroll = null;
    let unsubscribeFramePump = null;
    let destroyed = false;
    let scrollMetrics = null;
    let identMetrics = null;
    let reflectedAct = "";
    const cache = new Map();
    const inflight = new Map();
    const reflectedVariables = new Map();

    function fallback() {
      schedulerEnabled = false;
      unsubscribeScroll?.();
      unsubscribeScroll = null;
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
      hero.style.setProperty("--hero-progress", "0");
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
      prefetchWindowTarget = null;
      prefetchWindowDirection = 0;
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

    function directionalFrameWindow(target) {
      const desired = [];
      const seen = new Set();
      const limit = cacheLimit();
      const add = (index) => {
        if (index < 0 || index >= frameCount || seen.has(index)) return;
        seen.add(index);
        desired.push(index);
      };
      add(target);
      const aheadBudget = Math.ceil((limit - 1) * 0.67);
      for (let distance = 1; distance <= aheadBudget; distance += 1) add(target + (scrollDirection * distance));
      for (let distance = 1; desired.length < limit && distance < frameCount; distance += 1) add(target - (scrollDirection * distance));
      for (let distance = aheadBudget + 1; desired.length < limit && distance < frameCount; distance += 1) {
        add(target + (scrollDirection * distance));
      }
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
          const liveTarget = hero.dataset.mode === "sequence" ? scrollState().target : requestedFrame;
          if (requestedFrame === index && liveTarget === index) drawFrame(frame, index);
          return true;
        } catch {
          const aborted = Boolean(controller?.signal.aborted);
          const liveTarget = hero.dataset.mode === "sequence" ? scrollState().target : requestedFrame;
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

    function requestScheduledFrame(index, { allowPrefetch = false } = {}) {
      if (!frameUrls.length) return;
      const safeIndex = safeFrameIndex(index);
      const delta = safeIndex - lastScheduledTarget;
      if (delta) scrollDirection = Math.sign(delta);
      lastScheduledTarget = safeIndex;
      requestedFrame = safeIndex;

      if (cache.has(safeIndex)) {
        const frame = cache.get(safeIndex);
        touchCache(safeIndex, frame);
        drawFrame(frame, safeIndex);
      }

      const desired = allowPrefetch ? directionalFrameWindow(safeIndex) : [safeIndex];
      frameQueue = desired.filter((candidate) => !cache.has(candidate) && !inflight.has(candidate));
      prefetchWindowTarget = allowPrefetch ? safeIndex : null;
      prefetchWindowDirection = allowPrefetch ? scrollDirection : 0;
      motionDirector.schedule();
    }

    async function loadInitialFrame(index) {
      const safeIndex = safeFrameIndex(index);
      requestedFrame = safeIndex;
      lastScheduledTarget = safeIndex;
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

    function scrollState() {
      if (!scrollMetrics || scrollMetrics.viewportHeight !== window.innerHeight) {
        const rect = hero.getBoundingClientRect();
        scrollMetrics = {
          start: window.scrollY + rect.top,
          travel: Math.max(1, hero.offsetHeight - window.innerHeight),
          viewportHeight: window.innerHeight,
        };
      }
      const progress = clamp((window.scrollY - scrollMetrics.start) / scrollMetrics.travel);
      return { progress, target: Math.round(progress * (frameCount - 1)) };
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
      requestAnimationFrame(() => reflectHeroIdent(scrollState().progress));
    });

    function reflectScrollState(state) {
      const { progress } = state;
      const cameraProgress = smoothstep(0.68, 0.9, progress);
      const cameraAmplitude = variant === "mobile" ? 0.025 : 0.045;
      const exposureIn = smoothstep(0.68, 0.77, progress);
      const exposureOut = smoothstep(0.79, 0.9, progress);
      const exposure = Math.max(0, exposureIn - exposureOut) * 0.14;
      reflectVariable("--hero-progress", progress.toFixed(4));
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

    function updateFromScroll() {
      if (hero.dataset.mode !== "sequence") return;
      const state = scrollState();
      reflectScrollState(state);
      prewarmPortal(state.progress);
      const needsWindow = prefetchArmed && (
        prefetchWindowTarget !== state.target || prefetchWindowDirection !== scrollDirection
      );
      if (state.target !== requestedFrame || renderedFrame < 0 || needsWindow) {
        requestScheduledFrame(state.target, { allowPrefetch: prefetchArmed });
      }
    }

    function scheduleScrollUpdate() {
      motionDirector.schedule();
    }

    function armFramePrefetch(direction = 0) {
      if (direction) scrollDirection = Math.sign(direction);
      const changed = !prefetchArmed || Boolean(direction);
      prefetchArmed = true;
      if (changed) {
        prefetchWindowTarget = null;
        scheduleScrollUpdate();
      }
    }

    function handleNavigationKey(event) {
      if (event.target instanceof HTMLElement && event.target.matches("input, textarea, select, [contenteditable]")) return;
      const forward = new Set(["ArrowDown", "PageDown", "End"]);
      const backward = new Set(["ArrowUp", "PageUp", "Home"]);
      if (forward.has(event.key)) armFramePrefetch(1);
      else if (backward.has(event.key)) armFramePrefetch(-1);
      else if (event.key === " ") armFramePrefetch(event.shiftKey ? -1 : 1);
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
      scrollMetrics = null;
      identMetrics = null;
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
        const initialState = scrollState();
        reflectScrollState(initialState);
        await loadInitialFrame(initialState.target);
        if (startupCancelled()) return;
        if (renderedFrame !== initialState.target) throw new Error("Initial target frame did not render");
        hero.dataset.frameCount = String(frameCount);
        hero.dataset.mode = "sequence";
        schedulerEnabled = true;
        scrollMetrics = null;
        unsubscribeScroll = motionDirector.subscribe(updateFromScroll);
        unsubscribeFramePump = motionDirector.subscribe(pumpFrameQueue);
        window.addEventListener("wheel", (event) => armFramePrefetch(event.deltaY), { passive: true });
        window.addEventListener("touchstart", () => armFramePrefetch(), { passive: true });
        window.addEventListener("keydown", handleNavigationKey);
        window.addEventListener("resize", () => {
          scrollMetrics = null;
          identMetrics = null;
        }, { passive: true });
        window.matchMedia(MOBILE_QUERY).addEventListener("change", (event) => {
          try {
            applyVariant(event.matches ? "mobile" : "desktop");
            scheduleScrollUpdate();
          } catch {
            fallback();
          }
        });
        scheduleScrollUpdate();
        hero.dataset.ready = "true";
        window.dispatchEvent(new CustomEvent("divani:hero-ready", { detail: { interactive: true } }));
        root.classList.remove("js-pending");
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
        unsubscribeScroll?.();
        unsubscribeScroll = null;
        unsubscribeFramePump?.();
        unsubscribeFramePump = null;
        resetFrameLoads();
        clearCache();
        destroyed = true;
      }
    });
    window.addEventListener("pageshow", (event) => {
      if (!event.persisted || destroyed || hero.dataset.mode !== "sequence") return;
      scrollMetrics = null;
      identMetrics = null;
      renderedFrame = -1;
      scheduleScrollUpdate();
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
      const direction = stage.dataset.motionDirection || "forward";
      const directionSign = direction === "right-to-left" || direction === "reverse" || direction === "rtl" ? -1 : 1;
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
      const shift = directionSign * 105 * smoothstep(0.05, 0.92, progress);
      stage.style.setProperty("--scene-shift", `${shift.toFixed(3)}%`);
      stage.style.setProperty("--scene-shift-opposite", `${(-shift).toFixed(3)}%`);
      stage.style.setProperty("--scene-exposure", (variant === "development"
        ? Math.max(0, smoothstep(0.08, 0.28, progress) - smoothstep(0.35, 0.72, progress)) * 0.16
        : 0).toFixed(4));
      if (type === "capability" && progress >= 0.34 && stage.dataset.motionCopyEntered !== "true") {
        stage.querySelector("[data-motion-enter='capability-copy']")?.classList.add("is-entered");
        stage.dataset.motionCopyEntered = "true";
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

  function initialiseProjectShowcase() {
    const showcase = document.querySelector("[data-project-showcase]");
    if (!(showcase instanceof HTMLElement)) return;
    const stage = showcase.querySelector("[data-project-frame]");
    const image = stage?.querySelector("img[data-project-layer='primary']");
    const secondaryImage = stage?.querySelector("img[data-project-layer='incoming']");
    const occluder = stage?.querySelector("[data-project-occluder]");
    const title = showcase.querySelector("[data-project-title]");
    const counter = showcase.querySelector("[data-project-counter]");
    const navigatorCounter = showcase.querySelector("[data-project-navigator-counter]");
    const captionCopy = showcase.querySelector(".project-runway__caption-copy");
    const chapters = [...showcase.querySelectorAll("[data-project-chapter]")];
    const controls = chapters.map((chapter) => chapter.querySelector("[data-project-select]"));
    const staticControls = [...showcase.querySelectorAll("[data-project-static-select]")];
    const runwayQuery = window.matchMedia(PROJECT_RUNWAY_QUERY);
    if (!(stage instanceof HTMLElement) || !(image instanceof HTMLImageElement) ||
        !(secondaryImage instanceof HTMLImageElement) || !(occluder instanceof HTMLElement) ||
        chapters.length === 0 || controls.some((control) => !(control instanceof HTMLButtonElement))) return;
    const totalLabel = String(chapters.length).padStart(2, "0");
    showcase.style.setProperty("--project-count", String(chapters.length));
    showcase.style.setProperty("--project-runway-height", `${(chapters.length * 68) + 36}svh`);
    let desiredIndex = 0;
    let committedIndex = 0;
    let requestVersion = 0;
    let decodeJob = null;
    let readyJob = null;
    let cutRunning = false;
    let runwayArmed = false;
    let syncWithoutCut = window.scrollY > 1;

    stage.dataset.projectDesired = "0";
    stage.dataset.projectCommitted = "0";
    chapters[0].classList.add("is-active");

    function waitForTransition(element, propertyName, timeout) {
      if (!motionAllowed()) return Promise.resolve();
      return new Promise((resolve) => {
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          element.removeEventListener("transitionend", onTransitionEnd);
          prefersReducedMotion.removeEventListener("change", onMotionChange);
          resolve();
        };
        const onTransitionEnd = (event) => {
          if (event.target === element && event.propertyName === propertyName) finish();
        };
        const onMotionChange = (event) => {
          if (event.matches) finish();
        };
        const timer = window.setTimeout(finish, timeout);
        element.addEventListener("transitionend", onTransitionEnd);
        prefersReducedMotion.addEventListener("change", onMotionChange);
      });
    }

    function clearCutState() {
      stage.removeAttribute("aria-busy");
      stage.removeAttribute("data-cut-phase");
      stage.removeAttribute("data-caption-phase");
    }

    function rebaseProjectLayers() {
      stage.classList.add("is-rebasing");
      secondaryImage.src = image.currentSrc || image.src;
      clearCutState();
      stage.getBoundingClientRect();
      requestAnimationFrame(() => stage.classList.remove("is-rebasing"));
    }

    function recordFor(index) {
      const chapter = chapters[index];
      if (!(chapter instanceof HTMLElement)) return null;
      return {
        index,
        chapter,
        control: controls[index],
        src: chapter.dataset.src || "",
        alt: chapter.dataset.alt || "",
        title: chapter.dataset.title || "",
      };
    }

    function commitSelection(job) {
      const record = job.record;
      committedIndex = record.index;
      image.src = job.decoded.currentSrc || job.decoded.src;
      image.alt = record.alt;
      if (title) title.textContent = record.title;
      if (counter) counter.textContent = `${String(record.index + 1).padStart(2, "0")} / ${totalLabel}`;
      if (navigatorCounter) navigatorCounter.textContent = `${String(record.index + 1).padStart(2, "0")} / ${totalLabel}`;
      chapters.forEach((chapter, index) => chapter.classList.toggle("is-active", index === record.index));
      controls.forEach((control, index) => control?.setAttribute("aria-pressed", String(index === record.index)));
      staticControls.forEach((control, index) => control.setAttribute("aria-pressed", String(index === record.index)));
      stage.dataset.projectCommitted = String(record.index);
    }

    function canAnimateCut() {
      return motionAllowed() && runwayQuery.matches && root.classList.contains("motion-ready");
    }

    async function performCut(job) {
      if (job.version !== requestVersion) return;
      if (!canAnimateCut() || syncWithoutCut) {
        commitSelection(job);
        secondaryImage.src = image.currentSrc || image.src;
        syncWithoutCut = false;
        return;
      }

      secondaryImage.src = job.decoded.currentSrc || job.decoded.src;
      if (job.version !== requestVersion) return;
      stage.setAttribute("aria-busy", "true");
      stage.dataset.cutPhase = "ready";
      stage.dataset.captionPhase = "out";
      secondaryImage.getBoundingClientRect();
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      stage.dataset.cutPhase = "crossfade";
      if (captionCopy instanceof HTMLElement) await waitForTransition(captionCopy, "opacity", 300);

      if (job.version !== requestVersion) {
        stage.dataset.cutPhase = "ready";
        stage.dataset.captionPhase = "in";
        await waitForTransition(secondaryImage, "opacity", 820);
        secondaryImage.src = image.currentSrc || image.src;
        clearCutState();
        return;
      }

      commitSelection(job);
      stage.dataset.captionPhase = "in";

      await waitForTransition(secondaryImage, "opacity", 820);
      rebaseProjectLayers();
    }

    async function drainReadyJobs() {
      if (cutRunning) return;
      cutRunning = true;
      try {
        while (readyJob) {
          const job = readyJob;
          readyJob = null;
          if (job.version !== requestVersion) continue;
          await performCut(job);
        }
      } finally {
        cutRunning = false;
        if (readyJob) drainReadyJobs();
      }
    }

    async function requestProject(index, options = {}) {
      if (!Number.isInteger(index) || index < 0 || index >= chapters.length) return;
      if (index === committedIndex && index !== desiredIndex) {
        requestVersion += 1;
        decodeJob = null;
        readyJob = null;
        desiredIndex = committedIndex;
        stage.dataset.projectDesired = String(committedIndex);
        syncWithoutCut = false;
        return;
      }
      const sameRequestPending = decodeJob?.index === index || readyJob?.record.index === index ||
        (cutRunning && index === desiredIndex);
      if (index === desiredIndex && (index === committedIndex || sameRequestPending)) {
        if (options.immediate || index === committedIndex) syncWithoutCut = false;
        return;
      }
      desiredIndex = index;
      stage.dataset.projectDesired = String(index);
      if (options.immediate) syncWithoutCut = true;
      const version = ++requestVersion;
      const record = recordFor(index);
      if (!record?.src) return;
      const decoded = new Image();
      const pendingDecode = { index, version };
      decodeJob = pendingDecode;
      decoded.decoding = "async";
      decoded.src = record.src;
      try {
        if (typeof decoded.decode === "function") await decoded.decode();
        else if (!decoded.complete) await new Promise((resolve, reject) => {
          decoded.onload = resolve;
          decoded.onerror = reject;
        });
        if (!decoded.naturalWidth) throw new Error("Project image unavailable");
      } catch {
        if (decodeJob === pendingDecode) decodeJob = null;
        if (version === requestVersion) {
          desiredIndex = committedIndex;
          stage.dataset.projectDesired = String(committedIndex);
          clearCutState();
        }
        return;
      }
      if (decodeJob === pendingDecode) decodeJob = null;
      if (version !== requestVersion) return;
      readyJob = { version, record, decoded };
      drainReadyJobs();
    }

    function nearestProjectIndex() {
      const activationLine = window.innerHeight * 0.42;
      let bestIndex = committedIndex;
      let bestDistance = Number.POSITIVE_INFINITY;
      chapters.forEach((chapter, index) => {
        const rect = chapter.getBoundingClientRect();
        const distance = Math.abs((rect.top + (rect.height / 2)) - activationLine);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      });
      return bestIndex;
    }

    function updateRunway() {
      if (!runwayArmed || !canAnimateCut()) return;
      requestProject(nearestProjectIndex());
    }

    controls.forEach((control, index) => {
      control?.addEventListener("click", () => requestProject(index));
    });
    staticControls.forEach((control, index) => {
      control.addEventListener("click", () => requestProject(index));
    });

    const runwayObserver = new IntersectionObserver((entries) => {
      runwayArmed = entries.some((entry) => entry.isIntersecting);
      if (runwayArmed) {
        syncWithoutCut = true;
        requestProject(nearestProjectIndex(), { immediate: true });
        motionDirector.schedule();
      }
    }, { rootMargin: "35% 0px", threshold: 0 });
    runwayObserver.observe(showcase);
    const unsubscribe = motionDirector.subscribe(updateRunway);

    function handleModeChange() {
      requestVersion += 1;
      decodeJob = null;
      readyJob = null;
      clearCutState();
      syncWithoutCut = true;
      desiredIndex = committedIndex;
      stage.dataset.projectDesired = String(committedIndex);
      if (canAnimateCut()) requestProject(nearestProjectIndex(), { immediate: true });
    }

    runwayQuery.addEventListener("change", handleModeChange);
    prefersReducedMotion.addEventListener("change", handleModeChange);
    window.addEventListener("pageshow", handleModeChange, { passive: true });
    window.addEventListener("pagehide", (event) => {
      if (event.persisted) return;
      unsubscribe();
      runwayObserver.disconnect();
      runwayQuery.removeEventListener("change", handleModeChange);
      prefersReducedMotion.removeEventListener("change", handleModeChange);
      window.removeEventListener("pageshow", handleModeChange);
    });

    if (runwayQuery.matches && motionAllowed()) {
      syncWithoutCut = true;
      requestProject(nearestProjectIndex(), { immediate: true });
    }
  }

  function initialiseProjectBrief() {
    const form = document.querySelector("form[data-project-brief-form]");
    if (!(form instanceof HTMLFormElement)) return;
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
  }

  function initialiseClientMarquee() {
    const marquee = document.querySelector(".relationship-marks");
    if (!(marquee instanceof HTMLElement) || marquee.dataset.marqueeReady === "true") return;

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
  }

  function initialiseSite() {
    initialiseSkipLink();
    initialiseClientMarquee();
    window.setTimeout(initialiseHeroSequence, 0);
    window.setTimeout(initialiseMotionSystem, 0);
    window.setTimeout(initialiseCapabilityMedia, 0);
    window.setTimeout(initialiseProjectShowcase, 0);
    window.setTimeout(initialiseProjectBrief, 0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialiseSite, { once: true });
  } else {
    initialiseSite();
  }
})();
