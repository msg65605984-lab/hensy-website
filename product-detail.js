const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".main-nav a");
let mainImage = document.querySelector("[data-main-image]");
let thumbButtons = [...document.querySelectorAll(".detail-thumbs button")];
const revealItems = [
  ...document.querySelectorAll(".detail-spec-section h2, .spec-table-wrap, .related-products h2, .related-grid a"),
];

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

function bindThumbs() {
  thumbButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const image = button.dataset.image;

      if (!image || !mainImage || mainImage.getAttribute("src") === image) return;

      thumbButtons.forEach((item) => item.classList.toggle("is-active", item === button));
      mainImage.classList.add("is-switching");

      window.setTimeout(() => {
        mainImage.setAttribute("src", image);
        mainImage.classList.remove("is-switching");
      }, 140);
    });
  });
}

function renderDetail(product, relatedProducts) {
  document.title = `${product.model || product.name} | HENSY`;

  const breadcrumbTitle = document.querySelector(".detail-breadcrumb strong");
  if (breadcrumbTitle) breadcrumbTitle.textContent = product.name || "";

  const title = document.querySelector("#detail-title");
  if (title) title.textContent = product.name || "";

  const model = document.querySelector(".detail-model span");
  if (model) model.textContent = product.model || "";

  const images = product.gallery?.length ? product.gallery : [product.cover].filter(Boolean);
  const gallery = document.querySelector(".detail-gallery");
  if (gallery && images.length) {
    gallery.innerHTML = `
      <div class="detail-thumbs" aria-label="Product images">
        ${images
          .map(
            (image, index) => `
              <button class="${index === 0 ? "is-active" : ""}" type="button" aria-label="View image ${index + 1}" data-image="${escapeHtml(image)}">
                <img src="${escapeHtml(image)}" alt="">
              </button>
            `,
          )
          .join("")}
      </div>
      <figure class="detail-main-image">
        <img src="${escapeHtml(images[0])}" alt="${escapeHtml(product.alt || product.name || "")}" data-main-image>
      </figure>
    `;

    mainImage = document.querySelector("[data-main-image]");
    thumbButtons = [...document.querySelectorAll(".detail-thumbs button")];
    bindThumbs();
  }

  const colors = document.querySelector(".detail-colors div");
  if (colors) {
    colors.innerHTML = (product.colors || []).map((color) => `<span style="--swatch:${escapeHtml(color)}"></span>`).join("");
  }

  const features = document.querySelector(".detail-features");
  if (features) {
    features.innerHTML = (product.features || []).map((feature) => `<li>${escapeHtml(feature)}</li>`).join("");
  }

  const specWrap = document.querySelector(".spec-table-wrap");
  if (specWrap && product.specs?.length) {
    specWrap.innerHTML = `
      <table class="spec-table">
        <tbody>
          ${product.specs
            .map((row) => {
              const values = row.values || [];
              if (values.length <= 1) {
                return `<tr><th>${escapeHtml(row.label)}</th><td colspan="8">${escapeHtml(values[0] || "")}</td></tr>`;
              }

              return `<tr><th>${escapeHtml(row.label)}</th>${values.map((value) => `<td>${escapeHtml(value)}</td>`).join("")}</tr>`;
            })
            .join("")}
        </tbody>
      </table>
    `;
  }

  const relatedGrid = document.querySelector(".related-grid");
  if (relatedGrid && relatedProducts.length) {
    relatedGrid.innerHTML = relatedProducts
      .map(
        (item) => `
          <a class="catalog-card" href="${productUrl(item)}">
            <figure>
              <img src="${escapeHtml(item.cover || "")}" alt="${escapeHtml(item.alt || item.name || "")}">
              <figcaption>
                <img src="tu/series-leaf-icon.svg" alt="" aria-hidden="true">
                <span>${escapeHtml(item.model || "")}</span>
              </figcaption>
            </figure>
            <h3>${escapeHtml(item.name || "")}</h3>
            <span class="product-mark" aria-hidden="true"></span>
          </a>
        `,
      )
      .join("");
  }
}

bindThumbs();

if ("IntersectionObserver" in window) {
  document.body.classList.add("js-detail-reveal");
  revealItems.forEach((item) => item.classList.add("detail-reveal-item"));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px 140px 0px", threshold: 0.05 },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

if (window.HensyContent) {
  HensyContent.getContent()
    .then((content) => {
      const products = content.products || [];
      const requestedId = HensyContent.getParam("id");
      const product = products.find((item) => item.id === requestedId) || products[0];
      if (!product) return;

      const relatedProducts = products.filter((item) => item.id !== product.id && item.category === product.category).slice(0, 4);
      renderDetail(product, relatedProducts);
    })
    .catch(() => {});
}
