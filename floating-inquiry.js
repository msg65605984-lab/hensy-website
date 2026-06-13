const existingFloatingInquiry = document.querySelector(".floating-inquiry");

if (!existingFloatingInquiry) {
  const floatingInquiry = document.createElement("aside");
  floatingInquiry.className = "floating-inquiry is-visible is-collapsed";
  floatingInquiry.setAttribute("aria-label", "Quick inquiry");
  floatingInquiry.innerHTML = `
    <div class="quick-inquiry-card">
      <button class="quick-inquiry-toggle" type="button" aria-expanded="false">
        <span>Quickly Inquiry</span>
        <img src="tu/xuanfu/Group 236.svg" alt="" aria-hidden="true">
      </button>
      <div class="quick-inquiry-body">
        <img class="quick-inquiry-image" src="tu/xuanfu/Mask group.png" alt="">
        <form class="quick-inquiry-form" action="#" method="post">
          <label>
            <span>Your Name</span>
            <input type="text" name="name" placeholder="*Your Name (required)" required>
          </label>
          <label>
            <span>Your Email</span>
            <input type="email" name="email" placeholder="*Your Email (required)" required>
          </label>
          <label>
            <span>Phone / WhatsApp / WeChat</span>
            <input type="text" name="contact" placeholder="Phone/WhatsApp/WeChat">
          </label>
          <label>
            <span>Your Message</span>
            <textarea name="message" placeholder="Your Message"></textarea>
          </label>
          <button type="submit">Send A Message</button>
        </form>
      </div>
    </div>
    <nav class="floating-contact-icons" aria-label="Floating contact links">
      <a href="https://wa.me/8613616508089" aria-label="WhatsApp">
        <img src="tu/xuanfu/Group 137.svg" alt="">
      </a>
      <a href="#footer" aria-label="WeChat">
        <img src="tu/xuanfu/Group 130.svg" alt="">
      </a>
      <a href="tel:+8613616508089" aria-label="Phone">
        <img src="tu/xuanfu/Group 131.svg" alt="">
      </a>
      <a href="mailto:contact@sloan-safety.com" aria-label="Email">
        <img src="tu/xuanfu/Group 132.svg" alt="">
      </a>
      <a class="is-back-top" href="#top" aria-label="Back to top">
        <img src="tu/xuanfu/Group 1437254516.svg" alt="">
      </a>
    </nav>
  `;
  document.body.append(floatingInquiry);

  const inquiryToggle = floatingInquiry.querySelector(".quick-inquiry-toggle");
  const inquiryCard = floatingInquiry.querySelector(".quick-inquiry-card");
  let inquiryCloseTimer;

  inquiryToggle?.addEventListener("click", () => {
    const isCollapsed = floatingInquiry.classList.contains("is-collapsed");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    window.clearTimeout(inquiryCloseTimer);

    if (isCollapsed) {
      if (inquiryCard) inquiryCard.style.removeProperty("height");
      floatingInquiry.classList.remove("is-collapsed", "is-closing");
      inquiryToggle.setAttribute("aria-expanded", "true");
      return;
    }

    if (inquiryCard && !prefersReducedMotion) {
      inquiryCard.style.height = `${inquiryCard.getBoundingClientRect().height}px`;
      inquiryCard.offsetHeight;
      inquiryCard.style.height = `${inquiryToggle.offsetHeight}px`;
    }

    floatingInquiry.classList.add("is-closing");
    inquiryToggle.setAttribute("aria-expanded", "false");

    if (prefersReducedMotion) {
      floatingInquiry.classList.add("is-collapsed");
      floatingInquiry.classList.remove("is-closing");
      if (inquiryCard) inquiryCard.style.removeProperty("height");
      return;
    }

    inquiryCloseTimer = window.setTimeout(() => {
      floatingInquiry.classList.add("is-collapsed");
      floatingInquiry.classList.remove("is-closing");
      if (inquiryCard) inquiryCard.style.removeProperty("height");
    }, 620);
  });

  function updateFloatingInquiryState() {
    floatingInquiry.classList.toggle("show-back-top", window.scrollY > 200);
  }

  updateFloatingInquiryState();
  window.addEventListener("scroll", updateFloatingInquiryState, { passive: true });
}
