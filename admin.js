const state = {
  content: null,
  password: localStorage.getItem("hensyAdminPassword") || "",
  panel: "banners",
  editing: null,
  productFilter: "all",
  productSearch: "",
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const panelNames = {
  banners: "Banner",
  products: "产品",
  blogs: "博客",
  site: "站点设置",
};

const pageTitles = {
  banners: "轮播图管理",
  products: "产品管理",
  blogs: "博客管理",
  site: "站点设置",
};

const pageSubtitles = {
  banners: "官网管理",
  products: "产品卡片和详情页共用这里的数据。",
  blogs: "博客列表和详情页共用这里的数据。",
  site: "官网管理",
};

const categoryOptions = [
  ["tables", "Folding Table Series"],
  ["tents", "Outdoor Tents Series"],
  ["other", "Other Products"],
];

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function showAlert(message, isError = false) {
  const alert = $("[data-alert]");
  alert.textContent = message;
  alert.hidden = false;
  alert.classList.toggle("is-error", isError);
  window.clearTimeout(showAlert.timer);
  showAlert.timer = window.setTimeout(() => {
    alert.hidden = true;
  }, 4200);
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

async function api(url, options = {}) {
  const headers = new Headers(options.headers || {});

  if (state.password) {
    headers.set("x-admin-password", state.password);
  }

  const response = await fetch(url, { ...options, headers });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || "请求失败");
  }

  return payload;
}

async function loadContent() {
  state.content = await api("/api/content");
  renderAll();
  showAlert("内容已读取。");
}

function renderAll() {
  renderBanners();
  renderProducts();
  renderBlogs();
  renderSite();
  updateLoginStatus();
}

function field(name, label, value, options = {}) {
  const tag = options.multiline ? "textarea" : "input";
  const type = options.type || "text";
  const classes = options.full ? "full" : "";
  const help = options.help ? `<p class="field-help">${escapeHtml(options.help)}</p>` : "";

  if (options.select) {
    const opts = options.select
      .map(([optionValue, optionLabel]) => {
        const selected = optionValue === value ? "selected" : "";
        return `<option value="${escapeHtml(optionValue)}" ${selected}>${escapeHtml(optionLabel)}</option>`;
      })
      .join("");
    return `<label class="${classes}">${label}<select data-field="${name}">${opts}</select>${help}</label>`;
  }

  if (tag === "input") {
    return `<label class="${classes}">${label}<input type="${type}" data-field="${name}" value="${escapeHtml(value || "")}">${help}</label>`;
  }

  return `<label class="${classes}">${label}<textarea data-field="${name}">${escapeHtml(value || "")}</textarea>${help}</label>`;
}

function imageField(name, label, value) {
  const preview = value ? `<img class="small-preview" src="${escapeHtml(value)}" alt="">` : "";
  return `
    <label class="full">${label}
      <div class="image-field">
        <input type="text" data-field="${name}" value="${escapeHtml(value || "")}">
        <button type="button" data-upload="${name}">上传</button>
      </div>
      ${preview}
    </label>
  `;
}

function bindCard(card, item) {
  $$("[data-field]", card).forEach((input) => {
    const name = input.dataset.field;
    const apply = () => {
      if (input.type === "checkbox") {
        item[name] = input.checked;
      } else if (name === "gallery" || name === "colors" || name === "features") {
        item[name] = linesToArray(input.value);
      } else if (name === "specs") {
        item[name] = textToSpecs(input.value);
      } else {
        item[name] = input.value;
      }
      renderCardTitle(card, item);
    };

    if (input.type === "checkbox") {
      input.checked = Boolean(item[name]);
    } else if (name === "gallery" || name === "colors" || name === "features") {
      input.value = arrayToLines(item[name]);
    } else if (name === "specs") {
      input.value = specsToText(item[name]);
    } else {
      input.value = item[name] || "";
    }

    input.addEventListener("input", apply);
    input.addEventListener("change", apply);
  });

  $$("[data-upload]", card).forEach((button) => {
    button.addEventListener("click", () => uploadImage(button.dataset.upload, card, item));
  });
}

function renderCardTitle(card, item) {
  const title = $(".editor-card-header h4", card);
  if (!title) return;
  title.textContent = item.name || item.title || item.model || item.id || "未命名";
}

function getItemTitle(item) {
  return item.name || item.title || item.model || item.id || "未命名";
}

function renderTable({ headers, rows, total }) {
  return `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>${headers.map((header) => `<th class="${header.className || ""}">${header.label}</th>`).join("")}</tr>
        </thead>
        <tbody>${rows.join("")}</tbody>
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

function renderProductTable({ headers, rows, total }) {
  return `
    <div class="admin-table-wrap">
      <table class="admin-table product-table">
        <thead>
          <tr>${headers.map((header) => `<th class="${header.className || ""}">${header.label}</th>`).join("")}</tr>
        </thead>
        <tbody>${rows.join("")}</tbody>
      </table>
    </div>
    <div class="table-footer product-table-footer">
      <span>共${total}条</span>
      <button class="pager-button" type="button" aria-label="上一页">‹</button>
      ${[1, 2, 3, 4, 5, 6].map((page) => `<span class="pager-current ${page === 1 ? "" : "is-muted"}">${page}</span>`).join("")}
      <button class="pager-button" type="button" aria-label="下一页">›</button>
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

function bindTableActions(root) {
  $$("[data-edit]", root).forEach((button) => {
    button.addEventListener("click", () => openEditor(button.dataset.edit, Number(button.dataset.index)));
  });

  $$("[data-remove]", root).forEach((button) => {
    button.addEventListener("click", () => {
      const list = getListByType(button.dataset.remove);
      const index = Number(button.dataset.index);
      if (!list[index] || !window.confirm("确定删除这一项吗？")) return;
      list.splice(index, 1);
      renderAll();
    });
  });
}

function getListByType(type) {
  if (type === "banner") return state.content.banners;
  if (type === "product") return state.content.products;
  if (type === "blog") return state.content.blogs;
  return [];
}

async function uploadImage(fieldName, card, item) {
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
      item[fieldName] = result.path;
      const input = $(`[data-field="${fieldName}"]`, card);
      if (input) input.value = result.path;
      renderAll();
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

function renderBanners() {
  const list = $("[data-banner-list]");
  const rows = state.content.banners.map(
    (banner, index) => `
      <tr>
        <td class="order-cell">${index + 1}</td>
        <td class="image-cell">
          ${banner.image ? `<img class="admin-thumb" src="${escapeHtml(banner.image)}" alt="${escapeHtml(banner.alt || banner.title || "")}">` : ""}
        </td>
        <td class="title-cell">${escapeHtml(banner.title || "")}</td>
        <td class="link-cell">${escapeHtml((banner.primaryUrl || "").toUpperCase())}</td>
        <td class="status-cell">${banner.enabled === false ? "无效" : "有效"}</td>
        <td class="action-cell">${actionButtons("banner", index)}</td>
      </tr>
    `,
  );

  list.innerHTML = renderTable({
    headers: [
      { label: "排序", className: "order-cell" },
      { label: "Banner", className: "image-cell" },
      { label: "标题", className: "title-cell" },
      { label: "主按钮链接", className: "link-cell" },
      { label: "状态", className: "status-cell" },
      { label: "操作", className: "action-cell" },
    ],
    rows,
    total: state.content.banners.length,
  });
  bindTableActions(list);
}

function renderProducts() {
  const list = $("[data-product-list]");
  const query = state.productSearch.trim().toLowerCase();
  const products = state.content.products.filter((product) => {
    const matchesCategory = state.productFilter === "all" || product.category === state.productFilter;
    const haystack = `${product.name || ""} ${product.model || ""}`.toLowerCase();
    const matchesSearch = !query || haystack.includes(query);
    return matchesCategory && matchesSearch;
  });

  const rows = products.map(
    (product, index) => `
      <tr>
        <td class="product-info-cell">
          <div class="product-summary">
            ${product.cover ? `<img class="admin-thumb" src="${escapeHtml(product.cover)}" alt="${escapeHtml(product.alt || product.name || "")}">` : "<span></span>"}
            <p>${escapeHtml(product.model || product.name || "")}</p>
          </div>
        </td>
        <td class="product-category-cell">${escapeHtml(getCategoryLabel(product.category))}</td>
        <td class="product-date-cell">${escapeHtml(product.createdAt || "2026-06-13")}</td>
        <td class="product-action-cell">${actionButtons("product", state.content.products.indexOf(product))}</td>
      </tr>
    `,
  );

  list.innerHTML = renderProductTable({
    headers: [
      { label: "产品", className: "product-info-cell" },
      { label: "产品分类", className: "product-category-cell" },
      { label: "创建时间", className: "product-date-cell" },
      { label: "操作", className: "product-action-cell" },
    ],
    rows,
    total: products.length,
  });
  bindTableActions(list);
}

function getCategoryLabel(category) {
  return categoryOptions.find(([value]) => value === category)?.[1] || category || "";
}

function renderBlogs() {
  const list = $("[data-blog-list]");
  const rows = state.content.blogs.map(
    (blog, index) => `
      <tr>
        <td class="order-cell">${index + 1}</td>
        <td class="image-cell">
          ${blog.cover ? `<img class="admin-thumb" src="${escapeHtml(blog.cover)}" alt="${escapeHtml(blog.alt || blog.title || "")}">` : ""}
        </td>
        <td class="title-cell">${escapeHtml(blog.title || "")}</td>
        <td class="link-cell">${escapeHtml(blog.category || "")}</td>
        <td class="status-cell">${blog.featured ? "推荐" : "有效"}</td>
        <td class="action-cell">${actionButtons("blog", index)}</td>
      </tr>
    `,
  );

  list.innerHTML = renderTable({
    headers: [
      { label: "排序", className: "order-cell" },
      { label: "封面", className: "image-cell" },
      { label: "标题", className: "title-cell" },
      { label: "分类", className: "link-cell" },
      { label: "状态", className: "status-cell" },
      { label: "操作", className: "action-cell" },
    ],
    rows,
    total: state.content.blogs.length,
  });
  bindTableActions(list);
}

function renderSite() {
  const form = $("[data-site-form]");
  const site = state.content.site || {};
  form.innerHTML = `
    <div class="form-grid">
      ${field("brand", "品牌名", site.brand)}
      ${field("phone", "电话", site.phone)}
      ${field("email", "邮箱", site.email)}
    </div>
  `;

  $$("[data-field]", form).forEach((input) => {
    input.value = site[input.dataset.field] || "";
    input.addEventListener("input", () => {
      state.content.site = state.content.site || {};
      state.content.site[input.dataset.field] = input.value;
    });
  });
}

function getEditorForm(type, item) {
  if (type === "banner") {
    return `
      <div class="form-grid">
        ${field("id", "ID", item.id)}
        ${field("title", "标题", item.title)}
        ${field("eyebrow", "小标题", item.eyebrow)}
        ${field("alt", "图片 Alt", item.alt)}
        ${field("description", "描述", item.description, { full: true, multiline: true })}
        ${field("primaryText", "主按钮文字", item.primaryText)}
        ${field("primaryUrl", "主按钮链接", item.primaryUrl)}
        ${field("secondaryText", "次按钮文字", item.secondaryText)}
        ${field("secondaryUrl", "次按钮链接", item.secondaryUrl)}
        ${imageField("image", "图片路径", item.image)}
        <label class="checkbox-label full"><input type="checkbox" data-field="enabled">启用</label>
      </div>
    `;
  }

  if (type === "product") {
    return `
      <div class="form-grid">
        ${field("id", "ID / URL 参数", item.id)}
        ${field("category", "分类", item.category, { select: categoryOptions })}
        ${field("model", "型号", item.model)}
        ${field("name", "产品名称", item.name)}
        ${field("summary", "摘要", item.summary, { full: true, multiline: true })}
        ${field("alt", "封面 Alt", item.alt)}
        ${imageField("cover", "封面图", item.cover)}
        ${field("gallery", "详情图集", arrayToLines(item.gallery), { full: true, multiline: true, help: "一行一个图片路径。" })}
        ${field("colors", "颜色", arrayToLines(item.colors), { full: true, multiline: true, help: "一行一个色值，例如 #0f6e47。" })}
        ${field("features", "卖点", arrayToLines(item.features), { full: true, multiline: true, help: "一行一个卖点。" })}
        ${field("specs", "规格表", specsToText(item.specs), { full: true, multiline: true, help: "格式：字段名: 值1 | 值2 | 值3" })}
        <label class="checkbox-label full"><input type="checkbox" data-field="featured">首页推荐</label>
      </div>
    `;
  }

  return `
    <div class="form-grid">
      ${field("id", "ID / URL 参数", item.id)}
      ${field("title", "标题", item.title)}
      ${field("category", "分类", item.category)}
      ${field("date", "发布日期", item.date, { type: "date" })}
      ${field("excerpt", "摘要", item.excerpt, { full: true, multiline: true })}
      ${field("alt", "封面 Alt", item.alt)}
      ${imageField("cover", "封面图", item.cover)}
      ${field("content", "正文", item.content, { full: true, multiline: true })}
      <label class="checkbox-label full"><input type="checkbox" data-field="featured">推荐 / 置顶</label>
    </div>
  `;
}

function openEditor(type, index) {
  const list = getListByType(type);
  const item = list[index];
  if (!item) return;

  state.editing = { type, index };

  const drawer = $("[data-editor-drawer]");
  const body = $("[data-editor-body]");
  const title = $("[data-editor-title]");

  title.textContent = `编辑${panelNames[`${type}s`] || ""}：${getItemTitle(item)}`;
  body.innerHTML = `
    <article class="editor-card">
      <div class="editor-card-header">
        <h4>${escapeHtml(getItemTitle(item))}</h4>
      </div>
      ${getEditorForm(type, item)}
      <div class="editor-save-row">
        <button class="ghost-button" type="button" data-editor-cancel>关闭</button>
        <button type="button" data-editor-apply>应用到列表</button>
      </div>
    </article>
  `;

  bindCard(body, item);
  $("[data-editor-cancel]", body).addEventListener("click", closeEditor);
  $("[data-editor-apply]", body).addEventListener("click", () => {
    renderAll();
    showAlert("已应用到当前列表，记得点击保存 JSON。");
    closeEditor();
  });

  drawer.classList.add("is-open");
}

function closeEditor() {
  state.editing = null;
  $("[data-editor-drawer]")?.classList.remove("is-open");
}

function addItem(type) {
  if (type === "banner") {
    state.content.banners.push({
      id: uid("banner"),
      title: "New Banner",
      eyebrow: "",
      description: "",
      primaryText: "View More",
      primaryUrl: "#",
      secondaryText: "",
      secondaryUrl: "",
      image: "",
      alt: "",
      enabled: true,
    });
    renderAll();
    openEditor("banner", state.content.banners.length - 1);
    return;
  }

  if (type === "product") {
    state.content.products.push({
      id: uid("product"),
      category: "tables",
      model: "",
      name: "New Product",
      summary: "",
      cover: "",
      alt: "",
      featured: false,
      gallery: [],
      colors: [],
      features: [],
      specs: [],
    });
    renderAll();
    openEditor("product", state.content.products.length - 1);
    return;
  }

  if (type === "blog") {
    state.content.blogs.push({
      id: uid("blog"),
      title: "New Blog",
      category: "Business",
      date: new Date().toISOString().slice(0, 10),
      cover: "",
      alt: "",
      excerpt: "",
      featured: false,
      content: "",
    });
    renderAll();
    openEditor("blog", state.content.blogs.length - 1);
    return;
  }
}

function switchPanel(panel) {
  state.panel = panel;
  $$("[data-panel]").forEach((button) => button.classList.toggle("is-active", button.dataset.panel === panel));
  $$("[data-panel-view]").forEach((view) => view.classList.toggle("is-active", view.dataset.panelView === panel));
  const title = $("[data-page-title]");
  if (title) title.textContent = pageTitles[panel] || panelNames[panel] || panel;
  const subtitle = $("[data-page-subtitle]");
  if (subtitle) subtitle.textContent = pageSubtitles[panel] || "官网管理";
  closeEditor();
}

function updateLoginStatus() {
  const passwordInput = $("[data-password]");
  const status = $("[data-login-status]");
  passwordInput.value = state.password;
  status.textContent = state.password ? "已保存本机登录密码，可以保存和上传。" : "未登录时只能查看，保存和上传需要登录。";
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
    showAlert("已保存到 data/content.json。");
  } catch (error) {
    showAlert(error.message, true);
  }
}

function bindGlobalEvents() {
  $$("[data-panel]").forEach((button) => {
    button.addEventListener("click", () => switchPanel(button.dataset.panel));
  });

  $$("[data-add]").forEach((button) => {
    button.addEventListener("click", () => addItem(button.dataset.add));
  });

  $$("[data-save]").forEach((button) => button.addEventListener("click", saveContent));
  $$("[data-reload]").forEach((button) => button.addEventListener("click", loadContent));
  $("[data-editor-close]").addEventListener("click", closeEditor);
  $("[data-editor-drawer]").addEventListener("click", (event) => {
    if (event.target === event.currentTarget) closeEditor();
  });

  $("[data-product-category-filter]").addEventListener("change", (event) => {
    state.productFilter = event.target.value;
    renderProducts();
  });

  const searchInput = $("[data-product-search]");
  const applyProductSearch = () => {
    state.productSearch = searchInput.value;
    renderProducts();
  };
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      applyProductSearch();
    }
  });
  $("[data-product-search-button]").addEventListener("click", applyProductSearch);

  $("[data-login-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    state.password = $("[data-password]").value;
    localStorage.setItem("hensyAdminPassword", state.password);
    updateLoginStatus();
    showAlert("登录信息已保存到当前浏览器。");
  });
}

bindGlobalEvents();
loadContent().catch((error) => showAlert(error.message, true));
