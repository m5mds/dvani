(() => {
  "use strict";

  const root = document.documentElement;
  const renderLocks = [
    "brief-render-pending", "capabilities-render-pending", "hero-text-render-pending",
    "threshold-render-pending", "design-copy-render-pending",
  ];
  const formReadyAttribute = "data-initial-render-ready";
  let runtimeStarted = false;

  function clearFormMarkers() {
    document.querySelectorAll(`[${formReadyAttribute}]`).forEach((element) => {
      element.removeAttribute(formReadyAttribute);
    });
  }

  function releaseRenderLocks() {
    root.classList.remove(...renderLocks);
    clearFormMarkers();
  }

  function releaseFormProgressively() {
    const form = document.querySelector("form[data-project-brief-form]");
    const mobile = window.matchMedia && window.matchMedia("(max-width: 47.9375rem)").matches;
    if (!mobile || !(form instanceof HTMLFormElement)) {
      root.classList.remove("brief-render-pending");
      return;
    }
    const children = [...form.children];
    let index = 0;
    const revealNext = () => {
      if (!root.classList.contains("brief-render-pending")) {
        clearFormMarkers();
        return;
      }
      const child = children[index];
      if (child) {
        index += 1;
        child.setAttribute(formReadyAttribute, "");
        void child.offsetHeight;
        requestAnimationFrame(revealNext);
        return;
      }
      root.classList.remove("brief-render-pending");
      clearFormMarkers();
      void form.offsetHeight;
    };
    requestAnimationFrame(revealNext);
  }

  function loadRuntime() {
    if (runtimeStarted) return;
    runtimeStarted = true;
    const runtime = document.createElement("script");
    runtime.src = "assets/home-monumental.js";
    runtime.async = true;
    runtime.addEventListener("error", () => {
      releaseRenderLocks();
      root.classList.remove("js-pending");
      root.classList.add("no-js", "static-hero", "static-motion");
    }, { once: true });
    document.head.appendChild(runtime);
  }

  document.addEventListener("DOMContentLoaded", () => {
    window.setTimeout(() => {
      const connection = navigator.connection;
      const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const mobile = window.matchMedia && window.matchMedia("(max-width: 47.9375rem)").matches;
      if ((connection && connection.saveData) || reduced || !mobile) {
        releaseRenderLocks();
        loadRuntime();
      } else {
        const stagingFallback = window.setTimeout(() => {
          releaseRenderLocks();
          loadRuntime();
        }, 500);
        releaseFormProgressively();
        requestAnimationFrame(() => {
          root.classList.remove("capabilities-render-pending", "hero-text-render-pending");
          requestAnimationFrame(() => {
            root.classList.remove("threshold-render-pending");
            requestAnimationFrame(() => {
              root.classList.remove("design-copy-render-pending");
              window.clearTimeout(stagingFallback);
              loadRuntime();
            });
          });
        });
      }
    }, 0);
  }, { once: true });
})();
