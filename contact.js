const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".main-nav a");
const inquiryForms = [...document.querySelectorAll(".inquiry-form")];

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

inquiryForms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const series = String(formData.get("product-series") || "Folding Tables").trim();
    const quantity = String(formData.get("quantity") || "").trim();
    const requirements = String(formData.get("requirements") || "").trim();
    const message = [
      `Product series: ${series}`,
      `Quantity: ${quantity || "Please confirm"}`,
      `Requirements: ${requirements || "Please confirm"}`,
    ].join("\n");
    const submitButton = form.querySelector(".inquiry-submit");

    navigator.clipboard?.writeText(message)?.catch(() => {});

    if (submitButton) {
      submitButton.textContent = "Inquiry Prepared";

      window.setTimeout(() => {
        submitButton.textContent = "Prepare Inquiry";
      }, 1600);
    }
  });
});
