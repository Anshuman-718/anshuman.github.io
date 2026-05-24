(function () {
  document.getElementById("year").textContent = new Date().getFullYear();

  const header = document.querySelector(".header");
  window.addEventListener(
    "scroll",
    () => header?.classList.toggle("scrolled", window.scrollY > 40),
    { passive: true }
  );

  const urlEl = document.getElementById("portfolio-url");
  const copyBtn = document.getElementById("copy-link");
  if (urlEl) urlEl.textContent = window.location.href;
  copyBtn?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      copyBtn.textContent = "Copied!";
      setTimeout(() => { copyBtn.textContent = "Copy"; }, 2000);
    } catch {
      copyBtn.textContent = "Failed";
    }
  });

  /* Mobile nav */
  const navBtn = document.querySelector(".nav-btn");
  const navLinks = document.getElementById("nav-links");
  if (navBtn && navLinks) {
    navBtn.addEventListener("click", () => {
      const open = navBtn.getAttribute("aria-expanded") === "true";
      navBtn.setAttribute("aria-expanded", String(!open));
      navLinks.classList.toggle("open", !open);
    });
    navLinks.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        navBtn.setAttribute("aria-expanded", "false");
        navLinks.classList.remove("open");
      });
    });
  }

  /* Scroll reveal */
  const reveals = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
  );
  reveals.forEach((el) => io.observe(el));

  document.querySelectorAll(".reveal-stagger").forEach((el) => io.observe(el));

  /* Scroll progress */
  const progress = document.getElementById("scroll-progress");
  window.addEventListener(
    "scroll",
    () => {
      if (!progress) return;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = h > 0 ? `${(window.scrollY / h) * 100}%` : "0%";
    },
    { passive: true }
  );

  /* Cursor glow (desktop) */
  const glow = document.getElementById("cursor-glow");
  if (glow && window.matchMedia("(hover: hover)").matches) {
    document.addEventListener(
      "mousemove",
      (e) => {
        glow.style.left = `${e.clientX}px`;
        glow.style.top = `${e.clientY}px`;
      },
      { passive: true }
    );
  }

  /* Project metadata */
  const PROJECT_META = {
    "line-follower": {
      title: "PCB for Line Follower Robot",
      tag: "Arduino Nano · 8× IR · L293D · EAGLE",
      tpl: "tpl-line-follower",
    },
    "arduino-pcb": {
      title: "Arduino UNO–Style Controller PCB",
      tag: "ATmega328 · L293D · 7-Seg · RGB",
      tpl: "tpl-arduino-pcb",
    },
    "smart-home": {
      title: "IoT-Based Smart Home Automation System",
      tag: "3× Arduino UNO · HC-05 · C++",
      tpl: "tpl-smart-home",
    },
    cozmoclench: {
      title: "CozmoClench Bot",
      tag: "IIT Techfest · Robotics · Gripper",
      tpl: "tpl-cozmoclench",
    },
  };

  const modal = document.getElementById("project-modal");
  const modalBody = document.getElementById("modal-body");
  const modalTitle = document.getElementById("modal-title");
  const modalTag = document.getElementById("modal-tag");

  let activeGallery = null;
  let galleryIndex = 0;

  function openProject(id) {
    const meta = PROJECT_META[id];
    const tpl = document.getElementById(meta?.tpl);
    if (!meta || !tpl || !modal) return;

    modalTitle.textContent = meta.title;
    modalTag.textContent = meta.tag;
    modalBody.innerHTML = "";
    modalBody.appendChild(tpl.content.cloneNode(true));

    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    initGalleries(modalBody);
  }

  function closeProject() {
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    modalBody.innerHTML = "";
    activeGallery = null;
  }

  document.querySelectorAll("[data-open-project]").forEach((btn) => {
    btn.addEventListener("click", () => openProject(btn.dataset.openProject));
  });

  document.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", closeProject);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!document.getElementById("lightbox")?.hidden) closeLightbox();
      else if (!modal?.hidden) closeProject();
    }
  });

  /* Galleries */
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightbox-img");
  const lbCap = document.getElementById("lightbox-cap");
  const lbClose = document.querySelector(".lightbox-close");
  const lbPrev = document.querySelector(".lightbox-prev");
  const lbNext = document.querySelector(".lightbox-next");

  function getThumbs(gallery) {
    return [...gallery.querySelectorAll(".thumb")];
  }

  function setMain(gallery, index) {
    const thumbs = getThumbs(gallery);
    const thumb = thumbs[index];
    if (!thumb) return;

    const img = thumb.querySelector("img");
    const mainImg = gallery.querySelector(".gallery-main img");
    const caption = gallery.querySelector(".gallery-caption");

    mainImg.src = img.dataset.full || img.src;
    if (caption) caption.textContent = img.dataset.caption || "";
    const zoomBtn = gallery.querySelector(".gallery-zoom");
    if (zoomBtn) zoomBtn.dataset.index = String(index);

    thumbs.forEach((t, i) => t.classList.toggle("active", i === index));
    galleryIndex = index;
    activeGallery = gallery;
  }

  function initGalleries(root) {
    root.querySelectorAll(".gallery").forEach((gallery) => {
      gallery.querySelectorAll(".thumb").forEach((thumb, index) => {
        thumb.addEventListener("click", () => setMain(gallery, index));
      });
      const zoomBtn = gallery.querySelector(".gallery-zoom");
      zoomBtn?.addEventListener("click", () => {
        activeGallery = gallery;
        galleryIndex = parseInt(zoomBtn.dataset.index || "0", 10);
        openLightbox();
      });
      const activeIdx = [...gallery.querySelectorAll(".thumb")].findIndex((t) =>
        t.classList.contains("active")
      );
      setMain(gallery, activeIdx >= 0 ? activeIdx : 0);
    });
  }

  function openLightbox() {
    if (!activeGallery) return;
    const thumb = getThumbs(activeGallery)[galleryIndex];
    const img = thumb?.querySelector("img");
    if (!img || !lightbox) return;

    lbImg.src = img.dataset.full || img.src;
    lbCap.textContent = img.dataset.caption || "";
    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = modal?.hidden ? "" : "hidden";
  }

  function stepLightbox(dir) {
    if (!activeGallery) return;
    const thumbs = getThumbs(activeGallery);
    galleryIndex = (galleryIndex + dir + thumbs.length) % thumbs.length;
    setMain(activeGallery, galleryIndex);
    openLightbox();
  }

  lbClose?.addEventListener("click", closeLightbox);
  lbPrev?.addEventListener("click", () => stepLightbox(-1));
  lbNext?.addEventListener("click", () => stepLightbox(1));
  lightbox?.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (lightbox?.hidden) return;
    if (e.key === "ArrowLeft") stepLightbox(-1);
    if (e.key === "ArrowRight") stepLightbox(1);
  });
})();
// ==========================================
// IMAGE FULLSCREEN ZOOM
// ==========================================
document.addEventListener("click", function (e) {

  const image = e.target.closest(".zoomable-image");

  if (!image) return;

  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCap = document.getElementById("lightbox-cap");

  lightbox.hidden = false;
  lightbox.setAttribute("aria-hidden", "false");

  lightboxImg.src = image.src;
  lightboxCap.textContent = image.alt || "";
});

// CLOSE LIGHTBOX
document.querySelector(".lightbox-close")
?.addEventListener("click", () => {

  const lightbox = document.getElementById("lightbox");

  lightbox.hidden = true;
  lightbox.setAttribute("aria-hidden", "true");
});

// CLOSE ON BACKGROUND CLICK
document.getElementById("lightbox")
?.addEventListener("click", function (e) {

  if (e.target.id === "lightbox") {
    this.hidden = true;
    this.setAttribute("aria-hidden", "true");
  }
});
