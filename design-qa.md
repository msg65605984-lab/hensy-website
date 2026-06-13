**Implementation Checklist**
- Source visual truth: Figma file `CSnZSb0AYl2jdTlTDz6Nc8`, nodes `1:5`, `26:123`, `32:173`, `40:104`, `41:326`, `75:4`, `78:2712`, `78:2761`, and `78:2834`.
- Implemented files: `index.html`, `styles.css`, `script.js`.
- First screen: full-viewport hero with three-image carousel and progress bars.
- Second screen: HENSY company introduction, brand-wall image, line-pattern background, and application icons.
- Third screen: Folding Table Series product section with four product cards, optional color swatches, SKU labels, and View More control.
- Fourth screen: Outdoor Tents Series product section with four tent cards, 12 optional color swatches, SKU labels, and View More control.
- Fifth screen: Export service process section with four service cards, numbered steps, illustrations, and a green progress line.
- Sixth screen: FAQ section with centered title, FAQ pill, one default expanded answer, four collapsible questions, and chevron controls.
- Seventh screen: Inquiry section with left-side copy, direct contact block, white form panel, select/input/textarea fields, and Prepare Inquiry interaction.
- Footer: dark HENSY footer with logo, description, email and phone contact buttons, quick links, product category links, copyright strip, and Back To Top control.
- Navigation: updated to `Home`, `Products`, `News`, `About Us`, `FAQ`, `Contact Us`.
- Interactions: mobile menu toggle, carousel controls, hover pause/resume, repeat-on-scroll entrance animations, product-card hover motion, selectable color swatches, smooth FAQ accordion, inquiry prepared feedback, and footer entrance animation.
- Second page: `products.html` product listing page with `tu/chanpin/Frame 54.png` hero banner, 12 product cards from `tu/chanpin`, category filters, inquiry strip, and reused footer/navigation styling.

**Static Checks**
- `node --check script.js`: passed.
- Duplicate HTML ID scan: passed, 20 unique IDs.
- Local asset reference scan: passed, 27 referenced `tu/` assets found.
- Renamed SVG assets: `tu/footer-email-icon.svg`, `tu/footer-phone-icon.svg`.
- Product page JavaScript syntax check: passed.
- Product page duplicate HTML ID scan: passed, 9 unique IDs.
- Combined local asset reference scan for home and product pages: passed, 40 referenced `tu/` assets found.

**Visual Smoke Check**
- Preview method: temporary local server at `http://127.0.0.1:8765/index.html` and `http://127.0.0.1:8765/products.html`.
- Browser automation: Playwright using local Google Chrome.
- Desktop inquiry screenshot: `tmp/hensy-check/inquiry-desktop.png`.
- Desktop footer screenshot: `tmp/hensy-check/footer-desktop.png`.
- Mobile inquiry screenshot: `tmp/hensy-check/inquiry-mobile.png`.
- Console/page errors: none.
- Desktop inquiry metrics: form `x=612 y=197 w=728 h=528`, direct contact block `x=100 y=594 w=290 h=120`.
- Mobile check: viewport width `390`, document width `390`, no horizontal overflow.
- Desktop product page screenshot: `tmp/hensy-check/products-desktop.png`.
- Mobile product page screenshot: `tmp/hensy-check/products-mobile.png`.
- Product page visual smoke check: no console/page errors, 12 catalog cards rendered, desktop document width matches viewport width `1440`, mobile document width matches viewport width `390`.
- Product page filter check: All `12`, Chairs `2`, Outdoor Tents `4`, All again `12`.

final result: passed
