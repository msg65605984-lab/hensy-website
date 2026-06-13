const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".main-nav a");
let heroVisual = document.querySelector(".hero-visual");
let heroSlides = [...document.querySelectorAll(".hero-slide")];
let slideButtons = [...document.querySelectorAll("[data-slide]")];
const colorPickers = [...document.querySelectorAll(".color-picker")];
const shouldReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const carouselDuration = 4200;
let activeSlide = 0;
let carouselTimer;
let sectionScrollLocked = false;
let activeScreenIndex = -1;
let screenAnimationFrame = 0;

document.documentElement.style.setProperty("--slide-duration", `${carouselDuration}ms`);

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function productUrl(product) {
  return `product-detail.html?id=${encodeURIComponent(product.id)}`;
}

menuToggle?.addEventListener("click", () => {
  const isOpen = header?.classList.toggle("is-open") ?? false;
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    header?.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

function showSlide(index) {
  if (!heroSlides.length) return;

  activeSlide = (index + heroSlides.length) % heroSlides.length;

  heroSlides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === activeSlide);
  });

  slideButtons.forEach((button, buttonIndex) => {
    const isActive = buttonIndex === activeSlide;
    button.classList.remove("is-active");
    button.toggleAttribute("aria-current", false);

    if (isActive) {
      button.offsetWidth;
      button.classList.add("is-active");
      button.setAttribute("aria-current", "true");
    }
  });
}

function stopCarousel() {
  window.clearInterval(carouselTimer);
  heroVisual?.classList.add("is-paused");
}

function startCarousel() {
  stopCarousel();
  heroVisual?.classList.remove("is-paused");

  if (heroSlides.length < 2 || shouldReduceMotion) return;

  carouselTimer = window.setInterval(() => {
    showSlide(activeSlide + 1);
  }, carouselDuration);
}

function resumeCarousel() {
  showSlide(activeSlide);
  startCarousel();
}

function bindSlideButtons() {
  slideButtons.forEach((button) => {
    button.addEventListener("click", () => {
      showSlide(Number(button.dataset.slide));
      startCarousel();
    });
  });
}

colorPickers.forEach((picker) => {
  const buttons = [...picker.querySelectorAll("button")];

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });
    });
  });
});

function bindHeroPauseEvents() {
  heroVisual?.addEventListener("mouseenter", stopCarousel);
  heroVisual?.addEventListener("mouseleave", resumeCarousel);
  heroVisual?.addEventListener("focusin", stopCarousel);
  heroVisual?.addEventListener("focusout", resumeCarousel);
}

function renderHomeContent(content) {
  const banners = (content.banners || []).filter((banner) => banner.enabled !== false && banner.image);
  const firstBanner = banners[0];

  if (firstBanner) {
    document.querySelector("#hero-title")?.replaceChildren(
      ...String(firstBanner.title || "")
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => {
          const span = document.createElement("span");
          span.textContent = word;
          return span;
        }),
    );

    const eyebrow = document.querySelector(".eyebrow");
    if (eyebrow) {
      eyebrow.innerHTML = `<span aria-hidden="true"></span>${escapeHtml(firstBanner.eyebrow || "")}`;
    }

    const lead = document.querySelector(".hero-lead");
    if (lead) lead.textContent = firstBanner.description || "";

    const actions = document.querySelector(".hero-actions");
    if (actions) {
      actions.innerHTML = `
        ${firstBanner.primaryText ? `<a class="button button-primary" href="${escapeHtml(firstBanner.primaryUrl || "#")}">${escapeHtml(firstBanner.primaryText)}</a>` : ""}
        ${firstBanner.secondaryText ? `<a class="button button-secondary" href="${escapeHtml(firstBanner.secondaryUrl || "#")}">${escapeHtml(firstBanner.secondaryText)}</a>` : ""}
      `;
    }

    const carousel = document.querySelector(".hero-carousel");
    const bars = document.querySelector(".slide-bars");
    if (carousel && bars) {
      carousel.innerHTML = banners
        .map(
          (banner, index) => `
            <img
              class="hero-slide ${index === 0 ? "is-active" : ""}"
              src="${escapeHtml(banner.image)}"
              alt="${escapeHtml(banner.alt || banner.title || "")}"
            >
          `,
        )
        .join("");
      bars.innerHTML = banners
        .map(
          (_banner, index) => `
            <button
              class="${index === 0 ? "is-active" : ""}"
              type="button"
              data-slide="${index}"
              aria-label="Show image ${index + 1}"
              ${index === 0 ? 'aria-current="true"' : ""}
            ></button>
          `,
        )
        .join("");

      heroVisual = document.querySelector(".hero-visual");
      heroSlides = [...document.querySelectorAll(".hero-slide")];
      slideButtons = [...document.querySelectorAll("[data-slide]")];
      bindSlideButtons();
    }
  }

  renderSeriesGrid("#folding-table-series .product-grid", (content.products || []).filter((item) => item.category === "tables" && item.featured).slice(0, 4));
  renderSeriesGrid("#outdoor-tents-series .product-grid", (content.products || []).filter((item) => item.category === "tents" && item.featured).slice(0, 4));
}

function renderSeriesGrid(selector, products) {
  const grid = document.querySelector(selector);
  if (!grid || !products.length) return;

  grid.innerHTML = products
    .map(
      (product) => `
        <a class="product-card" href="${productUrl(product)}">
          <figure>
            <img src="${escapeHtml(product.cover)}" alt="${escapeHtml(product.alt || product.name)}">
            <figcaption>
              <img src="tu/series-leaf-icon.svg" alt="" aria-hidden="true">
              <span>${escapeHtml(product.model || "")}</span>
            </figcaption>
          </figure>
          <h3>${escapeHtml(product.name || "")}</h3>
          <span class="product-mark" aria-hidden="true"></span>
          <p>${escapeHtml(product.summary || "")}</p>
        </a>
      `,
    )
    .join("");
}

bindSlideButtons();
bindHeroPauseEvents();

if (window.HensyContent) {
  HensyContent.getContent()
    .then((content) => {
      renderHomeContent(content);
      showSlide(0);
      startCarousel();
    })
    .catch(() => {
      showSlide(0);
      startCarousel();
    });
} else {
  showSlide(0);
  startCarousel();
}

function setActiveScreen(index) {
  const sections = getScreenSections();

  if (!sections.length) return;

  sections.forEach((section, sectionIndex) => {
    section.classList.toggle("is-visible", sectionIndex === index);
  });

  activeScreenIndex = index;
}

function updateActiveScreen() {
  const sections = getScreenSections();

  if (!sections.length) return;

  const currentIndex = getCurrentSectionIndex(sections);

  if (currentIndex === activeScreenIndex && sections[currentIndex]?.classList.contains("is-visible")) return;

  setActiveScreen(currentIndex);
}

function scheduleActiveScreenUpdate() {
  window.cancelAnimationFrame(screenAnimationFrame);
  screenAnimationFrame = window.requestAnimationFrame(updateActiveScreen);
}

updateActiveScreen();

window.addEventListener("scroll", scheduleActiveScreenUpdate, { passive: true });
window.addEventListener("resize", scheduleActiveScreenUpdate);
window.addEventListener("hashchange", scheduleActiveScreenUpdate);

function getScreenSections() {
  return [...document.querySelectorAll("main > section")];
}

function getCurrentSectionIndex(sections) {
  const viewportCenter = window.innerHeight / 2;
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  sections.forEach((section, index) => {
    const box = section.getBoundingClientRect();
    const sectionCenter = box.top + box.height / 2;
    const distance = Math.abs(sectionCenter - viewportCenter);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
}

window.addEventListener(
  "wheel",
  (event) => {
    if (event.ctrlKey || Math.abs(event.deltaY) < 8 || sectionScrollLocked) return;

    const sections = getScreenSections();
    if (sections.length < 2) return;

    const currentIndex = getCurrentSectionIndex(sections);
    const nextIndex = event.deltaY > 0 ? currentIndex + 1 : currentIndex - 1;
    const nextSection = sections[nextIndex];

    if (!nextSection) return;

    event.preventDefault();
    sectionScrollLocked = true;
    nextSection.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth", block: "start" });

    window.setTimeout(() => {
      sectionScrollLocked = false;
      scheduleActiveScreenUpdate();
    }, shouldReduceMotion ? 120 : 820);
  },
  { passive: false },
);
