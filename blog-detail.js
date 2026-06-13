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

function renderBlog(blog) {
  document.title = `${blog.title || "Blog"} | HENSY`;

  document.querySelector("[data-blog-category]").textContent = blog.category || "";
  document.querySelector("[data-blog-title]").textContent = blog.title || "";

  const date = document.querySelector("[data-blog-date]");
  date.dateTime = blog.date || "";
  date.textContent = HensyContent.formatDate(blog.date);

  const cover = document.querySelector("[data-blog-cover]");
  cover.src = blog.cover || "";
  cover.alt = blog.alt || blog.title || "";

  const content = [blog.excerpt, blog.content]
    .filter(Boolean)
    .join("\n\n")
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");

  document.querySelector("[data-blog-content]").innerHTML = content;
}

HensyContent.getContent()
  .then((content) => {
    const blogs = content.blogs || [];
    const requestedId = HensyContent.getParam("id");
    const blog = blogs.find((item) => item.id === requestedId) || blogs[0];
    if (blog) renderBlog(blog);
  })
  .catch(() => {});
