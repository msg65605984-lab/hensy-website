const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".main-nav a");
const storyTrack = document.querySelector(".story-track");
const storyPrev = document.querySelector(".story-prev");
const storyNext = document.querySelector(".story-next");
const advantageCards = document.querySelector(".about-cards .about-page-inner");
const heroVideo = document.querySelector(".about-hero-media video");
const statNumbers = [...document.querySelectorAll(".about-stats strong[data-count]")];
let storyScrollLocked = false;
let storyAutoPaused = false;
let lastStoryAutoTime = 0;
const storyAutoSpeed = 0.018;
const revealItems = [
  ...document.querySelectorAll(
    ".living-section h2, .living-copy article, .living-photo, .about-card, .solutions-top, .solutions-media, .stories-head, .story-card",
  ),
];

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

if (heroVideo) {
  heroVideo.playbackRate = 0.5;
  heroVideo.defaultPlaybackRate = 0.5;
}

function scrollStories(direction) {
  if (!storyTrack || storyScrollLocked) return;

  storyScrollLocked = true;
  const activeButton = direction > 0 ? storyNext : storyPrev;
  const amount = Math.max(320, storyTrack.clientWidth * 0.55);

  activeButton?.classList.add("is-active");
  window.setTimeout(() => activeButton?.classList.remove("is-active"), 260);

  if (direction > 0) {
    const firstCard = storyTrack.querySelector(".story-card");
    if (firstCard) {
      storyTrack.append(firstCard);
      storyTrack.scrollLeft = Math.max(0, storyTrack.scrollLeft - firstCard.offsetWidth - 20);
    }
  }

  if (direction < 0) {
    const storyCards = storyTrack.querySelectorAll(".story-card");
    const lastCard = storyCards[storyCards.length - 1];
    if (lastCard) {
      storyTrack.prepend(lastCard);
      storyTrack.scrollLeft = lastCard.offsetWidth + 20;
    }
  }

  storyTrack.scrollBy({ left: amount * direction, behavior: "smooth" });
  window.setTimeout(() => {
    storyScrollLocked = false;
    updateOperableStories();
  }, 520);
}

function updateOperableStories() {
  if (!storyTrack) return;

  const storyCards = [...storyTrack.querySelectorAll(".story-card")];
  const trackBox = storyTrack.getBoundingClientRect();
  const safeLeft = trackBox.left + 28;
  const safeRight = trackBox.right - 28;

  storyCards.forEach((card) => {
    const box = card.getBoundingClientRect();
    const isFullyInside = box.left >= safeLeft && box.right <= safeRight;

    card.classList.toggle("is-operable", isFullyInside);
    card.setAttribute("tabindex", isFullyInside ? "0" : "-1");
  });
}

storyPrev?.addEventListener("click", () => scrollStories(-1));
storyNext?.addEventListener("click", () => scrollStories(1));
storyTrack?.addEventListener(
  "scroll",
  () => window.requestAnimationFrame(() => {
    updateOperableStories();
  }),
  { passive: true },
);
window.addEventListener("resize", () => {
  updateOperableStories();
});
updateOperableStories();

function autoScrollStories(time) {
  if (!storyTrack) return;

  if (!lastStoryAutoTime) {
    lastStoryAutoTime = time;
  }

  const delta = Math.min(time - lastStoryAutoTime, 32);
  lastStoryAutoTime = time;

  if (!storyAutoPaused && storyTrack.scrollWidth > storyTrack.clientWidth) {
    storyTrack.scrollLeft += delta * storyAutoSpeed;

    const firstCard = storyTrack.querySelector(".story-card");
    if (firstCard) {
      const gap = Number.parseFloat(getComputedStyle(storyTrack).columnGap || "20") || 20;
      const cardWidth = firstCard.offsetWidth + gap;

      if (storyTrack.scrollLeft >= cardWidth) {
        storyTrack.append(firstCard);
        storyTrack.scrollLeft -= cardWidth;
      }
    }

    updateOperableStories();
  }

  window.requestAnimationFrame(autoScrollStories);
}

if (storyTrack) {
  storyTrack.addEventListener("pointerenter", () => {
    storyAutoPaused = true;
  });
  storyTrack.addEventListener("pointerleave", () => {
    storyAutoPaused = false;
  });
  window.requestAnimationFrame(autoScrollStories);
}

function animateStatNumber(number) {
  if (number.dataset.counted === "true") return;

  const target = Number(number.dataset.count);
  const suffix = number.dataset.suffix || "";
  const duration = 1300;
  const start = performance.now();

  number.dataset.counted = "true";

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);

    number.textContent = `${value}${suffix}`;

    if (progress < 1) {
      window.requestAnimationFrame(tick);
      return;
    }

    number.textContent = `${target}${suffix}`;
  }

  window.requestAnimationFrame(tick);
}

if (advantageCards) {
  const cards = [...advantageCards.querySelectorAll(".about-card")];
  advantageCards.classList.add("is-first-active");

  function setActiveAdvantage(index) {
    advantageCards.classList.toggle("is-first-active", index === 0);
    advantageCards.classList.toggle("is-second-active", index === 1);
  }

  cards.forEach((card, index) => {
    card.addEventListener("pointerenter", () => setActiveAdvantage(index));
    card.addEventListener("click", () => setActiveAdvantage(index));
    card.addEventListener("focus", () => setActiveAdvantage(index));
  });
}

if ("IntersectionObserver" in window) {
  document.body.classList.add("js-reveal");
  revealItems.forEach((item) => item.classList.add("reveal-item"));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px 160px 0px", threshold: 0.05 },
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  if (statNumbers.length) {
    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          statNumbers.forEach(animateStatNumber);
          statsObserver.disconnect();
        });
      },
      { threshold: 0.35 },
    );

    statsObserver.observe(document.querySelector(".about-stats"));
  }
} else {
  statNumbers.forEach(animateStatNumber);
}
