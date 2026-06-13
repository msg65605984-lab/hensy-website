const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".main-nav a");

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function blogUrl(blog) {
  return `blog-detail.html?id=${encodeURIComponent(blog.id)}`;
}

function renderBlogCard(blog, headingTag = "h3", extraClass = "") {
  return `
    <article class="blog-card ${extraClass}">
      <a href="${blogUrl(blog)}" aria-label="Read ${escapeHtml(blog.title || "")}">
        <figure>
          <img src="${escapeHtml(blog.cover || "")}" alt="${escapeHtml(blog.alt || blog.title || "")}">
        </figure>
        <div class="blog-card-body">
          <${headingTag}>${escapeHtml(blog.title || "")}</${headingTag}>
          ${extraClass.includes("blog-card-latest") || extraClass.includes("blog-card-side") ? '<div class="blog-card-divider" aria-hidden="true"></div>' : ""}
          <div class="blog-card-meta">
            <span>${escapeHtml(blog.category || "")}</span>
            <time datetime="${escapeHtml(blog.date || "")}">${escapeHtml(window.HensyContent?.formatDate(blog.date) || blog.date || "")}</time>
            ${extraClass.includes("blog-card-featured") ? '<span class="view-more">View More</span>' : ""}
          </div>
        </div>
      </a>
    </article>
  `;
}

function renderBlogs(blogs) {
  const featuredGrid = document.querySelector(".featured-grid");
  const latestGrid = document.querySelector(".latest-grid");
  if (!featuredGrid || !latestGrid || !blogs.length) return;

  const featured = blogs.filter((blog) => blog.featured).slice(0, 2);
  const latest = blogs.filter((blog) => !blog.featured).slice(0, 6);

  featuredGrid.innerHTML = [
    featured[0] ? renderBlogCard(featured[0], "h2", "blog-card-featured") : "",
    featured[1] ? renderBlogCard(featured[1], "h2", "blog-card-side") : "",
  ].join("");

  latestGrid.innerHTML = latest.map((blog) => renderBlogCard(blog, "h3", "blog-card-latest")).join("");
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

if (window.HensyContent) {
  HensyContent.getContent()
    .then((content) => renderBlogs(content.blogs || []))
    .catch(() => {});
}
