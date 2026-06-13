const fs = require("fs/promises");
const http = require("http");
const path = require("path");
const { URL } = require("url");

const rootDir = __dirname;
const dataDir = process.env.DATA_DIR || path.join(rootDir, "data");
const uploadDir = process.env.UPLOAD_DIR || path.join(rootDir, "uploads");
const dataFile = path.join(dataDir, "content.json");
const defaultDataFile = path.join(rootDir, "data", "content.json");
const port = Number(process.env.PORT || 3000);
const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
};

function send(res, status, body, type = "application/json; charset=utf-8") {
  const payload = typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(status, {
    "content-type": type,
    "content-length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

function sendJson(res, status, body) {
  send(res, status, body, "application/json; charset=utf-8");
}

function getBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function isAuthorized(req) {
  return req.headers["x-admin-password"] === adminPassword;
}

async function readContent() {
  await ensureContentFile();
  const raw = await fs.readFile(dataFile, "utf8");
  return JSON.parse(raw);
}

async function writeContent(content) {
  await fs.mkdir(dataDir, { recursive: true });
  const backupFile = path.join(dataDir, `content.backup-${Date.now()}.json`);
  const current = await fs.readFile(dataFile, "utf8").catch(() => "");

  if (current) {
    await fs.writeFile(backupFile, current);
  }

  await fs.writeFile(dataFile, `${JSON.stringify(content, null, 2)}\n`);
}

async function ensureContentFile() {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(dataFile);
  } catch {
    await fs.copyFile(defaultDataFile, dataFile);
  }
}

function sanitizeName(name) {
  const ext = path.extname(name || "").toLowerCase() || ".png";
  const base = path
    .basename(name || "image", ext)
    .replace(/[^a-z0-9_-]+/gi, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `${Date.now()}-${base || "image"}${ext}`;
}

async function handleApi(req, res, pathname) {
  if (pathname === "/api/content" && req.method === "GET") {
    sendJson(res, 200, await readContent());
    return true;
  }

  if (pathname === "/api/content" && req.method === "PUT") {
    if (!isAuthorized(req)) {
      sendJson(res, 401, { error: "Unauthorized" });
      return true;
    }

    const content = JSON.parse(await getBody(req));
    if (!content || !Array.isArray(content.banners) || !Array.isArray(content.products) || !Array.isArray(content.blogs)) {
      sendJson(res, 400, { error: "Invalid content payload." });
      return true;
    }

    await writeContent(content);
    sendJson(res, 200, { ok: true, savedAt: new Date().toISOString() });
    return true;
  }

  if (pathname === "/api/upload" && req.method === "POST") {
    if (!isAuthorized(req)) {
      sendJson(res, 401, { error: "Unauthorized" });
      return true;
    }

    const payload = JSON.parse(await getBody(req));
    if (!payload?.data || !payload?.name) {
      sendJson(res, 400, { error: "Invalid upload payload." });
      return true;
    }

    const match = String(payload.data).match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i);
    if (!match) {
      sendJson(res, 400, { error: "Only base64 image uploads are supported." });
      return true;
    }

    const bytes = Buffer.from(match[2], "base64");
    if (bytes.length > 10 * 1024 * 1024) {
      sendJson(res, 413, { error: "Image is larger than 10MB." });
      return true;
    }

    await fs.mkdir(uploadDir, { recursive: true });
    const fileName = sanitizeName(payload.name);
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, bytes);
    sendJson(res, 200, { path: `uploads/${fileName}` });
    return true;
  }

  return false;
}

async function serveStatic(res, pathname) {
  if (pathname === "/data/content.json") {
    sendJson(res, 200, await readContent());
    return;
  }

  if (pathname.startsWith("/uploads/")) {
    const uploadPath = path.join(uploadDir, pathname.slice("/uploads/".length));
    if (!uploadPath.startsWith(uploadDir)) {
      send(res, 403, "Forbidden", "text/plain; charset=utf-8");
      return;
    }

    await serveFile(res, uploadPath);
    return;
  }

  const cleanPath = decodeURIComponent(pathname === "/" ? "/index.html" : pathname);
  const requested = path.normalize(cleanPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(rootDir, requested);

  if (!filePath.startsWith(rootDir)) {
    send(res, 403, "Forbidden", "text/plain; charset=utf-8");
    return;
  }

  await serveFile(res, filePath);
}

async function serveFile(res, filePath) {
  try {
    const file = await fs.readFile(filePath);
    const type = mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    send(res, 200, file, type);
  } catch (error) {
    if (error.code === "ENOENT") {
      send(res, 404, "Not found", "text/plain; charset=utf-8");
      return;
    }
    throw error;
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const handled = await handleApi(req, res, url.pathname);
    if (handled) return;
    await serveStatic(res, url.pathname);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: error.message || "Server error" });
  }
});

server.listen(port, () => {
  console.log(`HENSY site: http://localhost:${port}`);
  console.log(`Admin panel: http://localhost:${port}/admin.html`);
  console.log(`Default admin password: ${adminPassword}`);
});
