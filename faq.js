const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".main-nav a");
const faqItems = [...document.querySelectorAll(".faq-item")];

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

faqItems.forEach((item) => {
  const button = item.querySelector(".faq-question");

  button?.addEventListener("click", () => {
    const shouldOpen = !item.classList.contains("is-open");

    faqItems.forEach((target) => {
      const targetButton = target.querySelector(".faq-question");
      const isOpen = target === item && shouldOpen;

      target.classList.toggle("is-open", isOpen);
      targetButton?.setAttribute("aria-expanded", String(isOpen));
    });
  });
});
