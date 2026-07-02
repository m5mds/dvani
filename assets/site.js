(() => {
  const drawer = document.getElementById("mobileDrawer");
  const menuButton = document.querySelector(".menu-button");
  const closeButton = document.querySelector(".mobile-close");
  const drawerLinks = drawer ? Array.from(drawer.querySelectorAll("a")) : [];
  const focusables = [closeButton].concat(drawerLinks).filter(Boolean);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supportsViewTransitions = "startViewTransition" in document;

  function openDrawer(){
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden","false");
    drawer.removeAttribute("inert");
    document.body.classList.add("menu-open");
    menuButton.setAttribute("aria-expanded","true");
    window.setTimeout(() => closeButton.focus({preventScroll:true}), 120);
  }

  function closeDrawer(){
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden","true");
    drawer.setAttribute("inert","");
    document.body.classList.remove("menu-open");
    menuButton.setAttribute("aria-expanded","false");
    menuButton.focus({preventScroll:true});
  }

  if(drawer && menuButton && closeButton){
    menuButton.addEventListener("click", openDrawer);
    closeButton.addEventListener("click", closeDrawer);
    drawer.addEventListener("click", event => { if(event.target === drawer) closeDrawer(); });
    drawerLinks.forEach(link => link.addEventListener("click", closeDrawer));
    document.addEventListener("keydown", event => {
      if(event.key === "Escape" && drawer.classList.contains("open")) closeDrawer();
      if(event.key === "Tab" && drawer.classList.contains("open") && focusables.length){
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if(event.shiftKey && document.activeElement === first){ event.preventDefault(); last.focus(); }
        else if(!event.shiftKey && document.activeElement === last){ event.preventDefault(); first.focus(); }
      }
    });
  }

  function isTransitionableLink(link){
    if(!link || (link.target && link.target !== "_self")) return false;
    if(link.hasAttribute("download")) return false;
    const raw = link.getAttribute("href") || "";
    if(!raw || raw.startsWith("#")) return false;
    let url;
    try { url = new URL(raw, window.location.href); }
    catch { return false; }
    if(url.origin !== window.location.origin) return false;
    if(url.protocol !== "http:" && url.protocol !== "https:" && url.protocol !== "file:") return false;
    if(/\.pdf($|[?#])/i.test(url.pathname)) return false;
    if(url.pathname === window.location.pathname && url.hash) return false;
    return true;
  }

  if(!supportsViewTransitions && !reduced){
    document.addEventListener("click", event => {
      const target = event.target instanceof Element ? event.target : null;
      const link = target ? target.closest("a[href]") : null;
      if(!isTransitionableLink(link)) return;
      event.preventDefault();
      document.documentElement.classList.add("is-leaving");
      window.setTimeout(() => { window.location.href = link.href; }, 260);
    });
  }

  const stage = document.querySelector(".project-stage");
  const pageMain = document.querySelector("main");
  const heroMedia = document.querySelector(".home-hero-media,.page-hero-media");
  const projectImage = document.getElementById("projectImage");
  const projectTitle = document.getElementById("projectTitle");
  const projectMeta = document.getElementById("projectMeta");
  const panelTitle = document.getElementById("projectPanelTitle");
  const projectDescription = document.getElementById("projectDescription");
  let projectTimer = 0;
  let projectToken = 0;

  function preloadProjectImage(src){
    return new Promise(resolve => {
      if(!src){ resolve(); return; }
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve;
      img.src = src;
    });
  }

  function applyProject(button){
    if(projectImage){ projectImage.src = button.dataset.src; projectImage.alt = button.dataset.alt; }
    if(projectTitle) projectTitle.textContent = button.dataset.title;
    if(projectMeta) projectMeta.textContent = button.dataset.meta;
    if(panelTitle) panelTitle.textContent = button.dataset.title;
    if(projectDescription) projectDescription.textContent = button.dataset.text;
    stage && stage.classList.remove("is-switching");
  }

  document.querySelectorAll(".project-pick").forEach(button => {
    button.addEventListener("click", async () => {
      if(button.getAttribute("aria-pressed") === "true") return;
      const token = ++projectToken;
      window.clearTimeout(projectTimer);
      document.querySelectorAll(".project-pick").forEach(item => item.setAttribute("aria-pressed","false"));
      button.setAttribute("aria-pressed","true");
      await preloadProjectImage(button.dataset.src);
      if(token !== projectToken) return;
      if(supportsViewTransitions && !reduced){
        const suspendedTransitions = [pageMain, heroMedia].filter(Boolean).map(element => ({
          element,
          value: element.style.getPropertyValue("view-transition-name")
        }));
        suspendedTransitions.forEach(({ element }) => element.style.setProperty("view-transition-name","none"));
        let transition;
        try {
          transition = document.startViewTransition(() => applyProject(button));
        } catch {
          suspendedTransitions.forEach(({ element, value }) => element.style.setProperty("view-transition-name", value));
          applyProject(button);
          return;
        }
        const restorePageTransition = () => {
          suspendedTransitions.forEach(({ element, value }) => element.style.setProperty("view-transition-name", value));
        };
        transition.ready.catch(() => {}).finally(restorePageTransition);
        transition.updateCallbackDone.catch(() => {});
        transition.finished.catch(() => {}).finally(() => stage && stage.classList.remove("is-switching"));
        return;
      }
      stage && stage.classList.add("is-switching");
      projectTimer = window.setTimeout(() => applyProject(button), 220);
    });
  });

  document.querySelectorAll("[data-whatsapp-form]").forEach(form => {
    const fields = Array.from(form.elements).filter(field => "setCustomValidity" in field);

    function fieldLabel(field){
      const label = field.closest("label");
      if(!label) return field.name || "هذا الحقل";
      const text = Array.from(label.childNodes).filter(node => node.nodeType === Node.TEXT_NODE).map(node => node.textContent.trim()).join(" ");
      return text || field.name || "هذا الحقل";
    }

    function validationText(field){
      const label = fieldLabel(field);
      if(field.validity.valueMissing) return "يرجى تعبئة " + label + ".";
      if(field.validity.tooShort) return label + " أقصر من المطلوب.";
      if(field.validity.typeMismatch) return "يرجى إدخال " + label + " بصيغة صحيحة.";
      if(field.validity.patternMismatch) return "يرجى مراجعة " + label + ".";
      return "";
    }

    fields.forEach(field => {
      field.addEventListener("invalid", () => {
        field.setCustomValidity("");
        field.setCustomValidity(validationText(field));
      });
      field.addEventListener("input", () => field.setCustomValidity(""));
      field.addEventListener("change", () => field.setCustomValidity(""));
    });

    form.addEventListener("submit", event => {
      event.preventDefault();
      fields.forEach(field => {
        field.setCustomValidity("");
        if(!field.validity.valid) field.setCustomValidity(validationText(field));
      });
      if(!form.checkValidity()) return;
      const title = form.dataset.formTitle || "رسالة من موقع ديفاني";
      const lines = [title];
      Array.from(form.elements).forEach(field => {
        if(!field.name || field.type === "submit" || !field.value.trim()) return;
        lines.push(field.name + ": " + field.value.trim());
      });
      window.open("https://wa.me/966531100366?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
    });
  });

  const revealItems = Array.from(document.querySelectorAll(".reveal"));
  function sync(){
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    document.documentElement.style.setProperty("--scroll-progress", Math.min(1, Math.max(0, window.scrollY / maxScroll)).toFixed(4));
    if(reduced) return;
    const trigger = window.innerHeight * .9;
    revealItems.forEach((item, index) => {
      if(item.classList.contains("in")) return;
      const delay = Math.min(index % 3, 2) * 60 + "ms";
      item.style.transitionDelay = delay;
      item.style.animationDelay = delay;
      const rect = item.getBoundingClientRect();
      if(rect.top < trigger && rect.bottom > -80) item.classList.add("in");
    });
  }
  if(reduced) revealItems.forEach(item => item.classList.add("in"));
  else {
    window.addEventListener("scroll", sync, {passive:true});
    window.addEventListener("resize", sync);
    requestAnimationFrame(sync);
    window.setTimeout(() => revealItems.forEach(item => item.classList.add("in")), 900);
  }
})();