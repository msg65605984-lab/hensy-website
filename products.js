const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".main-nav a");
const catalogCards = document.querySelectorAll(".catalog-card");
const categoryStrip = document.querySelector(".product-category-strip");
const catalogSection = document.querySelector(".catalog-section");
let categoryStickPoint = 0;

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getPageCategory() {
  const path = window.location.pathname;
  if (path.includes("folding-table-series")) return "tables";
  if (path.includes("outdoor-tents-series")) return "tents";
  if (path.includes("other-products")) return "other";
  return "all";
}

function productUrl(product) {
  return `product-detail.html?id=${encodeURIComponent(product.id)}`;
}

function renderProducts(products) {
  const grid = document.querySelector(".product-list-grid");
  if (!grid || !products.length) return;

  const pageCategory = getPageCategory();
  const visibleProducts = pageCategory === "all" ? products : products.filter((product) => product.category === pageCategory);

  grid.innerHTML = visibleProducts
    .map(
      (product) => `
        <article class="catalog-card" data-category="${escapeHtml(product.category || "")}" data-url="${productUrl(product)}">
          <figure>
            <img src="${escapeHtml(product.cover || "")}" alt="${escapeHtml(product.alt || product.name || "")}">
            <figcaption>
              <img src="tu/series-leaf-icon.svg" alt="" aria-hidden="true">
              <span>${escapeHtml(product.model || "")}</span>
            </figcaption>
          </figure>
          <h3>${escapeHtml(product.name || "")}</h3>
          <span class="product-mark" aria-hidden="true"></span>
        </article>
      `,
    )
    .join("");

  bindCatalogCards([...grid.querySelectorAll(".catalog-card")]);
}

function bindCatalogCards(cards) {
  cards.forEach((card) => {
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "link");

    const goDetail = () => {
      window.location.href = card.dataset.url || "product-detail.html";
    };

    card.addEventListener("click", goDetail);

    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;

      event.preventDefault();
      goDetail();
    });
  });
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

bindCatalogCards([...catalogCards]);

function updateCategoryStickPoint() {
  if (!categoryStrip) return;

  categoryStrip.classList.remove("is-stuck");
  categoryStickPoint = categoryStrip.getBoundingClientRect().top + window.scrollY - (header?.offsetHeight || 80);
}

function updateCategoryStickState() {
  if (!categoryStrip) return;

  const headerHeight = header?.offsetHeight || 80;
  const shouldStick = categoryStrip.getBoundingClientRect().top <= headerHeight || window.scrollY >= categoryStickPoint;

  categoryStrip.classList.toggle("is-stuck", shouldStick);
}

updateCategoryStickPoint();
updateCategoryStickState();

window.addEventListener(
  "scroll",
  () => {
    updateCategoryStickState();
  },
  { passive: true },
);
window.addEventListener("resize", () => {
  updateCategoryStickPoint();
  updateCategoryStickState();
});

if (window.HensyContent) {
  HensyContent.getContent()
    .then((content) => {
      renderProducts(content.products || []);
      updateCategoryStickPoint();
      updateCategoryStickState();
    })
    .catch(() => {});
}
