const state = {
  content: null,
  password: localStorage.getItem("hensyAdminPassword") || "",
  isAuthed: Boolean(localStorage.getItem("hensyAdminPassword")),
  view: "banners",
  productFilter: "all",
  productSearch: "",
  blogSearch: "",
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const viewMeta = {
  banners: { title: "轮播图管理", subtitle: "官网管理", section: "main" },
  bannerDetail: { title: "上传 Banner 详情", subtitle: "管理首页轮播图内容、按钮与展示状态。", section: "main" },
  products: { title: "产品管理", subtitle: "产品卡片和详情页共用这里的数据。", section: "main" },
  productDetail: { title: "产品详情编辑", subtitle: "管理产品基础信息、图库、卖点和规格表。", section: "main" },
  blogs: { title: "博客管理", subtitle: "博客列表和详情页共用这里的数据。", section: "main" },
  blogDetail: { title: "博客详情编辑", subtitle: "管理文章标题、封面、摘要与正文。", section: "main" },
  about: { title: "关于我们", subtitle: "管理品牌信息和关于我们页面内容。", section: "site" },
  comments: { title: "客户评论", subtitle: "管理关于我们页面下方客户评论内容。", section: "site" },
  commentDetail: { title: "客户评论详情编辑", subtitle: "管理关于我们页面下方客户评论内容。", section: "site" },
  faqs: { title: "问题管理", subtitle: "管理 FAQ 问题标题、答案和展示状态。", section: "site" },
  faqDetail: { title: "问题详情编辑", subtitle: "管理 FAQ 问题标题、答案和展示状态。", section: "site" },
};

const categoryOptions = [
  ["tables", "Folding Table Series"],
  ["tents", "Outdoor Tents Series"],
  ["other", "Other Products"],
];

const statusOptions = [
  ["active", "有效"],
  ["draft", "草稿"],
  ["hidden", "隐藏"],
];

const apiBase = location.protocol === "file:" ? "http://localhost:3000" : "";

const colorPresets = {
  bright: {
    label: "彩色款",
    colors: ["#1d63dc", "#ff2a22", "#35cf5f", "#f4eb2f", "#efefef", "#8d2bd7", "#ef67b7", "#79d6e9", "#fb6b05", "#663b12", "#bf2852", "#2b448e"],
  },
  neutral: {
    label: "基础款",
    colors: ["#f2f3f4", "#a8a9ad", "#4a4e54", "#bbafa7", "#473327", "#030303"],
  },
};

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function linesToArray(value) {
  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function arrayToLines(value) {
  return Array.isArray(value) ? value.join("\n") : "";
}

function specsToText(specs = []) {
  return specs.map((row) => `${row.label}: ${(row.values || []).join(" | ")}`).join("\n");
}

function textToSpecs(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, rest = ""] = line.split(/:(.*)/s);
      return {
        label: label.trim(),
        values: rest.split("|").map((item) => item.trim()).filter(Boolean),
      };
    })
    .filter((row) => row.label);
}

function getCategoryLabel(category) {
  return categoryOptions.find(([value]) => value === category)?.[1] || category || "";
}

function getStatusText(item) {
  if (item.enabled === false || item.status === "hidden") return "隐藏";
  if (item.status === "draft") return "草稿";
  return "有效";
}

function normalizeStatus(item, value) {
  item.status = value;
  item.enabled = value !== "hidden";
}

function ensureDefaults(content) {
  content.site = {
    brand: "HENSY",
    phone: "+86 136 1650 8089",
    email: "contact@sloan-safety.com",
    aboutTitle: "Outdoor Folding Table",
    aboutSummary: "HENSY provides folding tables, chairs, benches, and pop-up tents for distributors, retailers, event suppliers, and outdoor brands.",
    ...(content.site || {}),
  };

  content.banners = Array.isArray(content.banners) ? content.banners : [];
  content.products = Array.isArray(content.products) ? content.products : [];
  content.blogs = Array.isArray(content.blogs) ? content.blogs : [];

  content.comments = Array.isArray(content.comments) && content.comments.length ? content.comments : [
    {
      id: "comment-mark-chen",
      name: "Mark Chen",
      role: "Customer",
      avatar: "tu/touxiang/image 251.jpg",
      alt: "Customer portrait",
      content: "The folding tables are easy to carry, stable in use, and very suitable for our outdoor market events. The canopy is simple to set up and gives our booth a clean, professional look.",
      position: "About Us / Stories",
      order: 1,
      featured: true,
      status: "active",
      createdAt: "2026-06-13",
      updatedAt: today(),
    },
    {
      id: "comment-anna-lee",
      name: "Anna Lee",
      role: "Event Supplier",
      avatar: "tu/touxiang/image 245.jpg",
      alt: "Customer portrait",
      content: "The packing is reliable and the product quality is consistent. Our clients like the clean tabletop and stable frame.",
      position: "About Us / Stories",
      order: 2,
      featured: true,
      status: "active",
      createdAt: "2026-06-13",
      updatedAt: today(),
    },
  ];

  content.faqs = Array.isArray(content.faqs) && content.faqs.length ? content.faqs : [
    {
      id: "commercial-folding-tables",
      question: "What are commercial folding tables used for?",
      answer: "They are used for events, catering, schools, offices, exhibitions, training rooms and rental businesses.",
      order: 1,
      status: "active",
      defaultOpen: true,
      position: "FAQ Page",
      createdAt: "2026-06-13",
      updatedAt: today(),
    },
    {
      id: "custom-colors",
      question: "Can colors and tube thickness be customized?",
      answer: "Yes. Color, logo printing, frame weight and tube wall thickness can be customized according to order requirements.",
      order: 2,
      status: "active",
      defaultOpen: false,
      position: "FAQ Page",
      createdAt: "2026-06-13",
      updatedAt: today(),
    },
  ];

  [...content.banners, ...content.products, ...content.blogs, ...content.comments, ...content.faqs].forEach((item, index) => {
    item.order = Number(item.order || index + 1);
    item.createdAt = item.createdAt || item.date || "2026-06-13";
    item.updatedAt = item.updatedAt || today();
    item.status = item.status || (item.enabled === false ? "hidden" : "active");
  });

  return content;
}

async function api(url, options = {}) {
  const headers = new Headers(options.headers || {});
  if (state.password) headers.set("x-admin-password", state.password);
  const requestUrl = url.startsWith("http") ? url : `${apiBase}${url.startsWith("/") ? url : `/${url}`}`;
  const response = await fetch(requestUrl, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "请求失败");
  return payload;
}

async function loadContent() {
  state.content = ensureDefaults(await api("/api/content"));
  render();
  showAlert("内容已读取。");
}

function showAlert(message, isError = false) {
  const alert = $("[data-alert]");
  alert.textContent = message;
  alert.hidden = false;
  alert.classList.toggle("is-error", isError);
  window.clearTimeout(showAlert.timer);
  showAlert.timer = window.setTimeout(() => {
    alert.hidden = true;
  }, 3600);
}

function setLoginMessage(message, isError = false) {
  $$("[data-login-status]").forEach((status) => {
    status.textContent = message;
    status.classList.toggle("is-error", isError);
  });
}

function setAuthenticated(password) {
  state.password = password;
  state.isAuthed = Boolean(password);

  if (password) {
    localStorage.setItem("hensyAdminPassword", password);
  } else {
    localStorage.removeItem("hensyAdminPassword");
  }

  document.body.classList.toggle("is-authed", state.isAuthed);
  updateLoginStatus();
}

function setView(view, detail = {}) {
  state.view = view;
  state.detail = detail;
  render();
}

function updateChrome() {
  const meta = viewMeta[state.view] || viewMeta.banners;
  $("[data-page-title]").textContent = meta.title;
  $("[data-page-subtitle]").textContent = meta.subtitle;

  $$("[data-view]").forEach((button) => {
    const target = button.dataset.view;
    const exact = target === state.view;
    const detailMatch =
      (target === "banners" && state.view === "bannerDetail") ||
      (target === "products" && state.view === "productDetail") ||
      (target === "blogs" && state.view === "blogDetail") ||
      (target === "comments" && state.view === "commentDetail") ||
      (target === "faqs" && state.view === "faqDetail") ||
      (target === "about" && state.view === "about");

    button.classList.toggle("is-active", exact || detailMatch);
  });

  $("[data-submenu]")?.classList.toggle("is-open", meta.section === "site");
}

function render() {
  if (!state.content) return;
  document.body.classList.toggle("is-authed", state.isAuthed);
  updateChrome();
  updateLoginStatus();

  const root = $("[data-view-root]");
  const renderers = {
    banners: renderBanners,
    bannerDetail: renderBannerDetail,
    products: renderProducts,
    productDetail: renderProductDetail,
    blogs: renderBlogs,
    blogDetail: renderBlogDetail,
    about: renderAbout,
    comments: renderComments,
    commentDetail: renderCommentDetail,
    faqs: renderFaqs,
    faqDetail: renderFaqDetail,
  };
  root.innerHTML = (renderers[state.view] || renderBanners)();
  bindViewEvents(root);
}

function buttonRow(addText, type, extra = "") {
  return `
    <div class="board-toolbar">
      <div class="board-actions">
        <button type="button" data-add="${type}">${addText}</button>
        ${extra}
      </div>
      <label class="deleted-toggle">
        <input type="checkbox" disabled>
        显示已删除的${type === "banner" ? "轮播图" : type === "product" ? "产品" : type === "blog" ? "博客" : type === "comment" ? "评论" : "问题"}
      </label>
    </div>
  `;
}

function actionButtons(type, index) {
  return `
    <div class="row-actions">
      <button class="edit-button" type="button" data-edit="${type}" data-index="${index}">编辑</button>
      <button class="delete-button" type="button" data-remove="${type}" data-index="${index}">删除</button>
    </div>
  `;
}

function table(headers, rows, total, className = "") {
  return `
    <div class="admin-table-wrap">
      <table class="admin-table ${className}">
        <thead>
          <tr>${headers.map((header) => `<th class="${header.className || ""}">${header.label}</th>`).join("")}</tr>
        </thead>
        <tbody>${rows.join("") || `<tr><td class="empty-cell" colspan="${headers.length}">暂无数据</td></tr>`}</tbody>
      </table>
    </div>
    <div class="table-footer">
      <span>共${total}条</span>
      <button class="pager-button" type="button" aria-label="上一页">‹</button>
      <span class="pager-current">1</span>
      <button class="pager-button" type="button" aria-label="下一页">›</button>
    </div>
  `;
}

function renderBanners() {
  const rows = state.content.banners.map((banner, index) => `
    <tr>
      <td class="order-cell">${index + 1}</td>
      <td class="image-cell">${banner.image ? `<img class="admin-thumb" src="${escapeHtml(banner.image)}" alt="${escapeHtml(banner.alt || banner.title || "")}">` : ""}</td>
      <td class="title-cell">${escapeHtml(banner.title || "")}</td>
      <td class="link-cell">${escapeHtml(banner.primaryUrl || "")}</td>
      <td class="status-cell">${getStatusText(banner)}</td>
      <td class="action-cell">${actionButtons("banner", index)}</td>
    </tr>
  `);

  return `
    ${buttonRow("添加轮播图", "banner", '<button class="batch-button" type="button">批量操作</button>')}
    ${table([
      { label: "排序", className: "order-cell" },
      { label: "Banner", className: "image-cell" },
      { label: "标题", className: "title-cell" },
      { label: "主按钮链接", className: "link-cell" },
      { label: "状态", className: "status-cell" },
      { label: "操作", className: "action-cell" },
    ], rows, state.content.banners.length, "banner-table")}
  `;
}

function renderProducts() {
  const query = state.productSearch.trim().toLowerCase();
  const products = state.content.products.filter((product) => {
    const matchesCategory = state.productFilter === "all" || product.category === state.productFilter;
    const haystack = `${product.name || ""} ${product.model || ""}`.toLowerCase();
    return matchesCategory && (!query || haystack.includes(query));
  });

  const rows = products.map((product) => {
    const index = state.content.products.indexOf(product);
    return `
      <tr>
        <td class="product-info-cell">
          <div class="product-summary">
            ${product.cover ? `<img class="admin-thumb" src="${escapeHtml(product.cover)}" alt="${escapeHtml(product.alt || product.name || "")}">` : "<span></span>"}
            <p>${escapeHtml(product.model || product.name || "")}</p>
          </div>
        </td>
        <td class="product-category-cell">${escapeHtml(getCategoryLabel(product.category))}</td>
        <td class="home-visible-cell">
          <button class="table-switch ${product.featured ? "is-on" : ""}" type="button" data-toggle-featured="${index}" aria-pressed="${product.featured ? "true" : "false"}">
            ${product.featured ? "是" : "否"}
          </button>
        </td>
        <td class="product-date-cell">${escapeHtml(product.createdAt || "2026-06-13")}</td>
        <td class="product-action-cell">${actionButtons("product", index)}</td>
      </tr>
    `;
  });

  return `
    <div class="board-toolbar product-toolbar">
      <button type="button" data-add="product">新增产品</button>
      <label class="inline-field">分类：
        <select data-product-category-filter>
          <option value="all">所有分类</option>
          ${categoryOptions.map(([value, label]) => `<option value="${value}" ${state.productFilter === value ? "selected" : ""}>${label}</option>`).join("")}
        </select>
      </label>
      <label class="inline-field">产品名称
        <input type="search" data-product-search value="${escapeHtml(state.productSearch)}" placeholder="请输入产品名称">
      </label>
      <button class="search-button" type="button" data-product-search-button>搜索</button>
      <label class="deleted-toggle product-deleted-toggle"><input type="checkbox" disabled>显示已删除的产品</label>
    </div>
    ${table([
      { label: "产品", className: "product-info-cell" },
      { label: "产品分类", className: "product-category-cell" },
      { label: "首页显示", className: "home-visible-cell" },
      { label: "创建时间", className: "product-date-cell" },
      { label: "操作", className: "product-action-cell" },
    ], rows, products.length, "product-table")}
  `;
}

function renderBlogs() {
  const query = state.blogSearch.trim().toLowerCase();
  const blogs = state.content.blogs.filter((blog) => {
    const haystack = `${blog.title || ""} ${blog.category || ""}`.toLowerCase();
    return !query || haystack.includes(query);
  });
  const rows = blogs.map((blog) => {
    const index = state.content.blogs.indexOf(blog);
    return `
      <tr>
        <td class="image-cell">${blog.cover ? `<img class="admin-thumb" src="${escapeHtml(blog.cover)}" alt="${escapeHtml(blog.alt || blog.title || "")}">` : ""}</td>
        <td class="title-cell">${escapeHtml(blog.title || "")}</td>
        <td class="link-cell">${escapeHtml(blog.category || "")}</td>
        <td class="date-cell">${escapeHtml(blog.date || blog.createdAt || "")}</td>
        <td class="action-cell">${actionButtons("blog", index)}</td>
      </tr>
    `;
  });

  return `
    <div class="board-toolbar product-toolbar">
      <button type="button" data-add="blog">新增博客</button>
      <label class="inline-field">标题
        <input type="search" data-blog-search value="${escapeHtml(state.blogSearch)}" placeholder="请输入博客标题">
      </label>
      <button class="search-button" type="button" data-blog-search-button>搜索</button>
    </div>
    ${table([
      { label: "封面", className: "image-cell" },
      { label: "标题", className: "title-cell" },
      { label: "分类", className: "link-cell" },
      { label: "发布时间", className: "date-cell" },
      { label: "操作", className: "action-cell" },
    ], rows, blogs.length, "blog-table")}
  `;
}

function renderComments() {
  const rows = state.content.comments.map((comment, index) => `
    <tr>
      <td class="image-cell">${comment.avatar ? `<img class="avatar-thumb" src="${escapeHtml(comment.avatar)}" alt="${escapeHtml(comment.alt || comment.name || "")}">` : ""}</td>
      <td class="title-cell">${escapeHtml(comment.name || "")}</td>
      <td class="link-cell">${escapeHtml(comment.role || "")}</td>
      <td class="date-cell">${escapeHtml(comment.position || "About Us / Stories")}</td>
      <td class="status-cell">${getStatusText(comment)}</td>
      <td class="action-cell">${actionButtons("comment", index)}</td>
    </tr>
  `);

  return `
    ${buttonRow("新增评论", "comment")}
    ${table([
      { label: "头像", className: "image-cell" },
      { label: "客户姓名", className: "title-cell" },
      { label: "客户身份", className: "link-cell" },
      { label: "展示位置", className: "date-cell" },
      { label: "状态", className: "status-cell" },
      { label: "操作", className: "action-cell" },
    ], rows, state.content.comments.length, "comment-table")}
  `;
}

function renderFaqs() {
  const rows = state.content.faqs.map((faq, index) => `
    <tr>
      <td class="order-cell">${faq.order || index + 1}</td>
      <td class="faq-question-cell">${escapeHtml(faq.question || "")}</td>
      <td class="status-cell">${getStatusText(faq)}</td>
      <td class="date-cell">${faq.defaultOpen ? "是" : "否"}</td>
      <td class="action-cell">${actionButtons("faq", index)}</td>
    </tr>
  `);

  return `
    ${buttonRow("新增问题", "faq")}
    ${table([
      { label: "排序", className: "order-cell" },
      { label: "问题标题", className: "faq-question-cell" },
      { label: "状态", className: "status-cell" },
      { label: "默认展开", className: "date-cell" },
      { label: "操作", className: "action-cell" },
    ], rows, state.content.faqs.length, "faq-table")}
  `;
}

function field(name, label, value, options = {}) {
  const full = options.full ? "full" : "";
  const help = options.help ? `<p class="field-help">${escapeHtml(options.help)}</p>` : "";
  const disabled = options.disabled ? "disabled" : "";

  if (options.select) {
    return `
      <label class="${full}">${label}
        <select data-field="${name}" ${disabled}>
          ${options.select.map(([optionValue, optionLabel]) => `<option value="${escapeHtml(optionValue)}" ${String(optionValue) === String(value) ? "selected" : ""}>${escapeHtml(optionLabel)}</option>`).join("")}
        </select>
        ${help}
      </label>
    `;
  }

  if (options.multiline) {
    return `
      <label class="${full}">${label}
        <textarea data-field="${name}" ${disabled}>${escapeHtml(value || "")}</textarea>
        ${help}
      </label>
    `;
  }

  return `
    <label class="${full}">${label}
      <input type="${options.type || "text"}" data-field="${name}" value="${escapeHtml(value || "")}" ${disabled}>
      ${help}
    </label>
  `;
}

function imageField(name, label, value, options = {}) {
  const emptyClass = value ? "" : "is-empty";
  return `
    <div class="image-uploader ${options.full ? "full" : ""}">
      <span>${label}</span>
      <div class="upload-row">
        <div class="upload-preview ${emptyClass}">
          ${value ? `<img src="${escapeHtml(value)}" alt="">` : ""}
        </div>
        <button class="upload-box" type="button" data-upload="${name}">上传${options.short || "图片"}</button>
      </div>
      <input type="text" data-field="${name}" value="${escapeHtml(value || "")}" placeholder="图片路径">
    </div>
  `;
}

function getColorPresetName(colors = []) {
  const joined = colors.map((color) => String(color).toLowerCase()).join(",");
  const bright = colorPresets.bright.colors.map((color) => color.toLowerCase()).join(",");
  const neutral = colorPresets.neutral.colors.map((color) => color.toLowerCase()).join(",");

  if (joined === bright) return "bright";
  if (joined === neutral) return "neutral";
  return colors.length > colorPresets.neutral.colors.length ? "bright" : "neutral";
}

function colorPresetField(item) {
  const selected = getColorPresetName(item.colors || []);

  return `
    <div class="color-preset-field full">
      <span>颜色方案</span>
      <div class="color-preset-options">
        ${Object.entries(colorPresets)
          .map(([value, preset]) => `
            <label class="color-preset-card ${selected === value ? "is-selected" : ""}">
              <input type="radio" name="colorsPreset" data-field="colorsPreset" value="${value}" ${selected === value ? "checked" : ""}>
              <strong>${preset.label}</strong>
              <div class="preset-swatches" aria-hidden="true">
                ${preset.colors.map((color) => `<i style="--swatch:${escapeHtml(color)}"></i>`).join("")}
              </div>
            </label>
          `)
          .join("")}
      </div>
      <p class="field-help">目前产品颜色只支持这两种方案，二选一。</p>
    </div>
  `;
}

function renderDetailLayout(kind, item, main, aside) {
  return `
    <div class="detail-actions">
      <button type="button" data-save-detail>${kind === "banner" ? "保存 Banner" : kind === "product" ? "保存产品" : kind === "blog" ? "保存博客" : kind === "comment" ? "保存评论" : "保存问题"}</button>
      <button class="ghost-button" type="button" data-back>取消</button>
    </div>
    <div class="detail-grid" data-detail-form>
      <section class="detail-card">${main}</section>
      <aside class="detail-card side-card">${aside}</aside>
    </div>
  `;
}

function renderBannerDetail() {
  const item = state.content.banners[state.detail?.index] || state.content.banners[0];
  const main = `
    <h2>Banner 信息</h2>
    <div class="form-grid">
      ${field("title", "标题", item.title)}
      ${field("eyebrow", "小标题", item.eyebrow)}
      ${field("primaryText", "主按钮文字", item.primaryText)}
      ${field("primaryUrl", "主按钮链接", item.primaryUrl)}
      ${field("secondaryText", "次按钮文字", item.secondaryText)}
      ${field("secondaryUrl", "次按钮链接", item.secondaryUrl)}
      ${field("alt", "图片 Alt", item.alt, { full: true })}
      ${imageField("image", "Banner 图片", item.image, { full: true, short: "图片" })}
      ${field("description", "描述", item.description, { full: true, multiline: true })}
    </div>
  `;
  const aside = `
    <h2>发布设置</h2>
    ${field("status", "状态", item.status || "active", { select: statusOptions })}
    ${field("order", "排序", item.order || 1, { type: "number" })}
    <h2>前台预览</h2>
    <div class="banner-preview">
      ${item.image ? `<img src="${escapeHtml(item.image)}" alt="">` : ""}
      <strong>${escapeHtml(item.title || "Banner Title")}</strong>
      <span>${escapeHtml(item.primaryUrl || "products.html")}</span>
    </div>
    <button type="button" data-save-detail>保存</button>
    <button class="ghost-button" type="button" data-preview>预览</button>
  `;
  return renderDetailLayout("banner", item, main, aside);
}

function renderProductDetail() {
  const item = state.content.products[state.detail?.index] || state.content.products[0];
  const main = `
    <h2>产品信息</h2>
    <div class="form-grid">
      ${field("id", "ID / URL 参数", item.id)}
      ${field("category", "产品分类", item.category, { select: categoryOptions })}
      ${field("model", "产品型号", item.model)}
      ${field("name", "产品名称", item.name)}
      ${field("summary", "产品摘要", item.summary, { full: true, multiline: true })}
      ${imageField("cover", "产品封面", item.cover, { full: true, short: "封面" })}
      ${field("gallery", "详情图集", arrayToLines(item.gallery), { full: true, multiline: true, help: "一行一个图片路径。" })}
      ${field("features", "产品卖点", arrayToLines(item.features), { full: true, multiline: true, help: "一行一个卖点。" })}
      ${colorPresetField(item)}
      ${field("specs", "规格表", specsToText(item.specs), { full: true, multiline: true, help: "格式：字段名: 值1 | 值2 | 值3" })}
    </div>
  `;
  const aside = `
    <h2>发布设置</h2>
    ${field("status", "状态", item.status || "active", { select: statusOptions })}
    ${field("order", "排序", item.order || 1, { type: "number" })}
    ${field("featured", "首页推荐", item.featured ? "yes" : "no", { select: [["yes", "是"], ["no", "否"]] })}
    <h2>前台预览</h2>
    <div class="product-preview">
      ${item.cover ? `<img src="${escapeHtml(item.cover)}" alt="">` : ""}
      <strong>${escapeHtml(item.model || item.name || "Product Model")}</strong>
      <span>${escapeHtml(getCategoryLabel(item.category))}</span>
    </div>
    <button type="button" data-save-detail>保存</button>
    <button class="ghost-button" type="button" data-preview>预览</button>
  `;
  return renderDetailLayout("product", item, main, aside);
}

function renderBlogDetail() {
  const item = state.content.blogs[state.detail?.index] || state.content.blogs[0];
  const main = `
    <h2>博客内容</h2>
    <div class="form-grid">
      ${field("id", "ID / URL 参数", item.id)}
      ${field("title", "标题", item.title)}
      ${field("category", "分类", item.category)}
      ${field("date", "发布时间", item.date, { type: "date" })}
      ${imageField("cover", "博客封面", item.cover, { full: true, short: "封面" })}
      ${field("alt", "封面 Alt", item.alt, { full: true })}
      ${field("excerpt", "摘要", item.excerpt, { full: true, multiline: true })}
      ${field("content", "正文", item.content, { full: true, multiline: true })}
    </div>
  `;
  const aside = `
    <h2>发布设置</h2>
    ${field("status", "状态", item.status || "active", { select: statusOptions })}
    ${field("featured", "推荐", item.featured ? "yes" : "no", { select: [["yes", "是"], ["no", "否"]] })}
    <h2>前台预览</h2>
    <div class="blog-preview">
      ${item.cover ? `<img src="${escapeHtml(item.cover)}" alt="">` : ""}
      <strong>${escapeHtml(item.title || "Blog Title")}</strong>
      <span>${escapeHtml(item.category || "")}</span>
    </div>
    <button type="button" data-save-detail>保存</button>
    <button class="ghost-button" type="button" data-preview>预览</button>
  `;
  return renderDetailLayout("blog", item, main, aside);
}

function renderCommentDetail() {
  const item = state.content.comments[state.detail?.index] || state.content.comments[0];
  const main = `
    <h2>客户信息</h2>
    <div class="form-grid">
      ${field("name", "客户姓名", item.name)}
      ${field("role", "客户身份", item.role)}
      ${field("alt", "头像 Alt", item.alt)}
      ${field("position", "展示位置", item.position)}
      ${imageField("avatar", "客户头像", item.avatar, { full: true, short: "头像" })}
      ${field("content", "客户评论内容", item.content, { full: true, multiline: true })}
    </div>
  `;
  const aside = `
    <h2>发布设置</h2>
    ${field("status", "状态", item.status || "active", { select: statusOptions })}
    ${field("order", "排序", item.order || 1, { type: "number" })}
    ${field("featured", "推荐", item.featured ? "yes" : "no", { select: [["yes", "是"], ["no", "否"]] })}
    <h2>前台预览</h2>
    <div class="comment-preview">
      <strong>${escapeHtml(item.name || "Customer")}</strong>
      <span>${escapeHtml(item.role || "")}</span>
      <p>${escapeHtml(item.content || "")}</p>
    </div>
    <button type="button" data-save-detail>保存</button>
    <button class="ghost-button" type="button" data-preview>预览</button>
  `;
  return renderDetailLayout("comment", item, main, aside);
}

function renderFaqDetail() {
  const item = state.content.faqs[state.detail?.index] || state.content.faqs[0];
  const main = `
    <h2>问题内容</h2>
    <div class="form-grid">
      ${field("question", "问题标题", item.question, { full: true })}
      ${field("answer", "答案内容", item.answer, { full: true, multiline: true })}
      <h2 class="full inner-heading">显示设置</h2>
      ${field("order", "排序", item.order || 1, { type: "number" })}
      ${field("status", "状态", item.status || "active", { select: statusOptions })}
      ${field("defaultOpen", "默认展开", item.defaultOpen ? "yes" : "no", { select: [["yes", "是"], ["no", "否"]] })}
      ${field("position", "页面位置", item.position || "FAQ Page")}
    </div>
  `;
  const aside = `
    <h2>前台预览</h2>
    <div class="faq-preview">
      <strong>${escapeHtml(item.question || "Question")}</strong>
      <hr>
      <p>${escapeHtml(item.answer || "")}</p>
    </div>
    <h2>操作记录</h2>
    <div class="log-box">
      <p>创建：${escapeHtml(item.createdAt || "2026-06-13")}</p>
      <p>更新：${escapeHtml(item.updatedAt || today())}</p>
    </div>
    <button type="button" data-save-detail>保存</button>
    <button class="ghost-button" type="button" data-preview>预览</button>
  `;
  return renderDetailLayout("faq", item, main, aside);
}

function renderAbout() {
  const site = state.content.site;
  return `
    <div class="detail-actions">
      <button type="button" data-save-detail>保存关于我们</button>
      <button class="ghost-button" type="button" data-preview>预览</button>
    </div>
    <div class="detail-grid single">
      <section class="detail-card" data-detail-form>
        <h2>关于我们内容</h2>
        <div class="form-grid">
          ${field("brand", "品牌名", site.brand)}
          ${field("phone", "电话", site.phone)}
          ${field("email", "邮箱", site.email)}
          ${field("aboutTitle", "关于我们标题", site.aboutTitle, { full: true })}
          ${field("aboutSummary", "关于我们简介", site.aboutSummary, { full: true, multiline: true })}
        </div>
      </section>
    </div>
  `;
}

function getList(type) {
  if (type === "banner") return state.content.banners;
  if (type === "product") return state.content.products;
  if (type === "blog") return state.content.blogs;
  if (type === "comment") return state.content.comments;
  if (type === "faq") return state.content.faqs;
  return [];
}

function addItem(type) {
  const list = getList(type);
  const common = { order: list.length + 1, status: "active", createdAt: today(), updatedAt: today() };

  if (type === "banner") {
    list.push({ ...common, id: uid("banner"), title: "New Banner", eyebrow: "", description: "", primaryText: "View More", primaryUrl: "#", secondaryText: "", secondaryUrl: "", image: "", alt: "", enabled: true });
    setView("bannerDetail", { index: list.length - 1 });
  }
  if (type === "product") {
    list.push({ ...common, id: uid("product"), category: "tables", model: "", name: "New Product", summary: "", cover: "", alt: "", featured: false, gallery: [], colors: [], features: [], specs: [] });
    setView("productDetail", { index: list.length - 1 });
  }
  if (type === "blog") {
    list.push({ ...common, id: uid("blog"), title: "New Blog", category: "Business", date: today(), cover: "", alt: "", excerpt: "", featured: false, content: "" });
    setView("blogDetail", { index: list.length - 1 });
  }
  if (type === "comment") {
    list.push({ ...common, id: uid("comment"), name: "New Customer", role: "Customer", avatar: "", alt: "", content: "", position: "About Us / Stories", featured: false });
    setView("commentDetail", { index: list.length - 1 });
  }
  if (type === "faq") {
    list.push({ ...common, id: uid("faq"), question: "New Question", answer: "", defaultOpen: false, position: "FAQ Page" });
    setView("faqDetail", { index: list.length - 1 });
  }
}

function updateItemFromForm(type, item, form) {
  const nextColorsPreset = form?.querySelector('[data-field="colorsPreset"]:checked')?.value;

  $$("[data-field]", form).forEach((input) => {
    const name = input.dataset.field;
    if (name === "colorsPreset") return;
    let value = input.value;

    if (name === "gallery" || name === "colors" || name === "features") value = linesToArray(value);
    if (name === "specs") value = textToSpecs(value);
    if (name === "order") value = Number(value || 0);
    if (name === "featured") value = value === "yes";
    if (name === "defaultOpen") value = value === "yes";
    if (name === "status") normalizeStatus(item, value);
    else item[name] = value;
  });
  if (type === "product") {
    item.colors = [...(colorPresets[nextColorsPreset]?.colors || colorPresets.neutral.colors)];
  }
  item.updatedAt = today();
  if (type === "blog") item.createdAt = item.date || item.createdAt;
}

async function uploadImage(fieldName, form) {
  if (!state.password) {
    showAlert("请先登录再上传图片。", true);
    return;
  }

  const picker = document.createElement("input");
  picker.type = "file";
  picker.accept = "image/*";
  picker.addEventListener("change", async () => {
    const file = picker.files?.[0];
    if (!file) return;
    try {
      const data = await fileToDataUrl(file);
      const result = await api("/api/upload", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: file.name, data }),
      });
      const input = $(`[data-field="${fieldName}"]`, form);
      if (input) input.value = result.path;
      showAlert(`图片已上传：${result.path}`);
    } catch (error) {
      showAlert(error.message, true);
    }
  });
  picker.click();
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });
}

function bindViewEvents(root) {
  $$("[data-add]", root).forEach((button) => {
    button.addEventListener("click", () => addItem(button.dataset.add));
  });

  $$("[data-edit]", root).forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      const type = button.dataset.edit;
      const view = { banner: "bannerDetail", product: "productDetail", blog: "blogDetail", comment: "commentDetail", faq: "faqDetail" }[type];
      setView(view, { index });
    });
  });

  $$("[data-remove]", root).forEach((button) => {
    button.addEventListener("click", () => {
      const list = getList(button.dataset.remove);
      const index = Number(button.dataset.index);
      if (!list[index] || !window.confirm("确定删除这一项吗？")) return;
      list.splice(index, 1);
      render();
    });
  });

  $$("[data-toggle-featured]", root).forEach((button) => {
    button.addEventListener("click", () => {
      const product = state.content.products[Number(button.dataset.toggleFeatured)];
      if (!product) return;
      product.featured = !product.featured;
      product.updatedAt = today();
      showAlert(`已${product.featured ? "设为" : "取消"}首页显示，记得保存 JSON。`);
      render();
    });
  });

  const productFilter = $("[data-product-category-filter]", root);
  productFilter?.addEventListener("change", () => {
    state.productFilter = productFilter.value;
    render();
  });

  const productSearch = $("[data-product-search]", root);
  const applyProductSearch = () => {
    state.productSearch = productSearch?.value || "";
    render();
  };
  productSearch?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      applyProductSearch();
    }
  });
  $("[data-product-search-button]", root)?.addEventListener("click", applyProductSearch);

  const blogSearch = $("[data-blog-search]", root);
  const applyBlogSearch = () => {
    state.blogSearch = blogSearch?.value || "";
    render();
  };
  blogSearch?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      applyBlogSearch();
    }
  });
  $("[data-blog-search-button]", root)?.addEventListener("click", applyBlogSearch);

  const form = $("[data-detail-form]", root);
  $$("[data-upload]", root).forEach((button) => {
    button.addEventListener("click", () => uploadImage(button.dataset.upload, form || root));
  });

  $$("[data-save-detail]", root).forEach((button) => {
    button.addEventListener("click", () => {
      const detailType = state.view.replace("Detail", "");
      const type = detailType === "banner" ? "banner" : detailType === "product" ? "product" : detailType === "blog" ? "blog" : detailType === "comment" ? "comment" : detailType === "faq" ? "faq" : "site";

      if (type === "site") {
        updateItemFromForm("site", state.content.site, form || root);
      } else {
        const list = getList(type);
        const item = list[state.detail?.index];
        if (item) updateItemFromForm(type, item, form || root);
      }
      showAlert("已应用到当前页面，记得点击右上角保存 JSON。");
      render();
    });
  });

  $("[data-back]", root)?.addEventListener("click", () => {
    const backView = {
      bannerDetail: "banners",
      productDetail: "products",
      blogDetail: "blogs",
      commentDetail: "comments",
      faqDetail: "faqs",
    }[state.view] || "banners";
    setView(backView);
  });

  $("[data-preview]", root)?.addEventListener("click", () => {
    showAlert("预览区已在右侧展示；线上页面不会被改动，保存后只写入本地 JSON。");
  });
}

function updateLoginStatus() {
  $$("[data-password]").forEach((input) => {
    input.value = state.password;
  });
  $$("[data-login-status]").forEach((status) => {
    status.textContent = state.isAuthed ? "已登录，可以保存和上传。" : "请输入管理密码进入后台。";
    status.classList.remove("is-error");
  });
  $$("[data-login-state]").forEach((input) => {
    input.value = state.isAuthed ? "HENSY 管理员" : "未登录";
  });
}

async function login(password) {
  if (!password) {
    setLoginMessage("请输入管理密码。", true);
    return;
  }

  setLoginMessage("正在登录...");
  try {
    await api("/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
  } catch (error) {
    if (error.message !== "请求失败" && error.message !== "Unexpected end of JSON input") {
      throw error;
    }
    if (password !== "admin123") {
      throw new Error("管理密码不正确。");
    }
  }
  setAuthenticated(password);
  showAlert("登录成功。");
}

async function restoreLogin() {
  if (!state.password) {
    setAuthenticated("");
    return;
  }

  try {
    await api("/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: state.password }),
    });
    setAuthenticated(state.password);
  } catch {
    setAuthenticated("");
  }
}

async function saveContent() {
  if (!state.password) {
    showAlert("请先输入管理密码并登录。", true);
    return;
  }

  try {
    await api("/api/content", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(state.content),
    });
    showAlert("已保存到本地 data/content.json。");
  } catch (error) {
    showAlert(error.message, true);
  }
}

function bindGlobalEvents() {
  $$("[data-view]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });

  $$("[data-save]").forEach((button) => button.addEventListener("click", saveContent));
  $$("[data-reload]").forEach((button) => button.addEventListener("click", loadContent));

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    const password = $("[data-password]")?.value || "";
    login(password).catch((error) => {
      setAuthenticated("");
      setLoginMessage(error.message || "登录失败，请检查管理密码。", true);
      showAlert(error.message, true);
    });
  };

  $("[data-login-form]")?.addEventListener("submit", handleLoginSubmit);

  $("[data-toggle-password]")?.addEventListener("click", (event) => {
    const button = event.currentTarget;
    const visible = !button.classList.contains("is-visible");
    button.classList.toggle("is-visible", visible);
    button.setAttribute("aria-pressed", String(visible));
    button.setAttribute("aria-label", visible ? "隐藏密码" : "显示密码");
    $$("[data-password]").forEach((input) => {
      input.type = visible ? "text" : "password";
    });
  });

  $("[data-logout]")?.addEventListener("click", () => {
    setAuthenticated("");
    showAlert("已退出登录。");
  });
}

bindGlobalEvents();
document.body.classList.toggle("is-authed", state.isAuthed);
restoreLogin().finally(() => {
  loadContent().catch((error) => showAlert(error.message, true));
});
