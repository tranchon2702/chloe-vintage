import { createServer } from "node:http";
import { appendFile, mkdir, readFile } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { dirname, extname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));
const defaultStorageFile = join(projectRoot, "storage", "contacts.ndjson");
const requestWindows = new Map();

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

const profile = {
  name: "Chloe",
  birthDate: "2000-11-14",
  role: "Organic food sales · Relationship builder",
  email: "hello@chloe.studio",
  palette: ["#FFBE91", "#FFDDB0", "#FFFCE1", "#CFEBFF"],
  interests: ["Slow travel", "Local food culture", "Quiet living"],
};

const projects = [
  {
    id: "listen",
    title: "Listen before offering",
    type: "Relationship-led sales approach",
    year: 2026,
  },
  {
    id: "translate",
    title: "Translate organic value",
    type: "Product storytelling",
    year: 2026,
  },
  {
    id: "grow",
    title: "Nurture long-term growth",
    type: "Partner relationship care",
    year: 2026,
  },
];

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  response.end(JSON.stringify(payload));
}

function normaliseText(value, maximum) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, maximum);
}

function validateContact(payload) {
  const contact = {
    name: normaliseText(payload?.name, 80),
    email: normaliseText(payload?.email, 160).toLowerCase(),
    subject: normaliseText(payload?.subject, 160),
    message: normaliseText(payload?.message, 3000),
    website: normaliseText(payload?.website, 240),
  };

  const errors = {};
  if (contact.name.length < 2) errors.name = "Please enter at least 2 characters.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (contact.message.length < 10) {
    errors.message = "Please enter at least 10 characters.";
  }

  return { contact, errors };
}

function allowRequest(request) {
  const ip = request.socket.remoteAddress || "unknown";
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const entries = (requestWindows.get(ip) || []).filter((time) => now - time < windowMs);

  if (entries.length >= 5) return false;
  entries.push(now);
  requestWindows.set(ip, entries);
  return true;
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > 20_000) {
      const error = new Error("Request body is too large.");
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch {
    const error = new Error("Invalid JSON body.");
    error.status = 400;
    throw error;
  }
}

async function handleContact(request, response, storageFile) {
  if (!allowRequest(request)) {
    sendJson(response, 429, {
      ok: false,
      error: "Too many messages. Please try again in a few minutes.",
    });
    return;
  }

  const payload = await readJsonBody(request);
  const { contact, errors } = validateContact(payload);

  // Honeypot: return a normal success response without persisting bot submissions.
  if (contact.website) {
    sendJson(response, 201, { ok: true, message: "Message received." });
    return;
  }

  if (Object.keys(errors).length > 0) {
    sendJson(response, 422, { ok: false, errors });
    return;
  }

  const record = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    name: contact.name,
    email: contact.email,
    subject: contact.subject,
    message: contact.message,
  };

  await mkdir(dirname(storageFile), { recursive: true });
  await appendFile(storageFile, `${JSON.stringify(record)}\n`, "utf8");

  sendJson(response, 201, {
    ok: true,
    id: record.id,
    message: "Thank you. Chloe will be in touch soon.",
  });
}

function isAllowedStaticPath(pathname) {
  return (
    pathname === "/" ||
    pathname === "/index.html" ||
    pathname === "/styles.css" ||
    pathname === "/content.js" ||
    pathname === "/script.js" ||
    pathname.startsWith("/assets/")
  );
}

async function serveStatic(pathname, response, rootDir) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const absolutePath = resolve(rootDir, `.${requestedPath}`);
  const relativePath = relative(resolve(rootDir), absolutePath);

  if (relativePath.startsWith("..") || isAbsolute(relativePath)) {
    sendJson(response, 403, { ok: false, error: "Forbidden." });
    return;
  }

  try {
    const body = await readFile(absolutePath);
    response.writeHead(200, {
      "content-type": contentTypes[extname(absolutePath).toLowerCase()] || "application/octet-stream",
      "cache-control": "no-cache",
      "x-content-type-options": "nosniff",
      "referrer-policy": "strict-origin-when-cross-origin",
    });
    response.end(body);
  } catch (error) {
    if (error.code === "ENOENT") {
      sendJson(response, 404, { ok: false, error: "Not found." });
      return;
    }
    throw error;
  }
}

export function createPortfolioServer({
  rootDir = projectRoot,
  storageFile = defaultStorageFile,
} = {}) {
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
      const pathname = decodeURIComponent(url.pathname);

      if (pathname === "/api/health" && request.method === "GET") {
        sendJson(response, 200, {
          ok: true,
          service: "chloe-web-vintage",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (pathname === "/api/profile" && request.method === "GET") {
        sendJson(response, 200, { ok: true, profile });
        return;
      }

      if (pathname === "/api/projects" && request.method === "GET") {
        sendJson(response, 200, { ok: true, projects });
        return;
      }

      if (pathname === "/api/contact" && request.method === "POST") {
        await handleContact(request, response, storageFile);
        return;
      }

      if (pathname.startsWith("/api/")) {
        sendJson(response, 404, { ok: false, error: "API route not found." });
        return;
      }

      if (request.method !== "GET" && request.method !== "HEAD") {
        sendJson(response, 405, { ok: false, error: "Method not allowed." });
        return;
      }

      if (!isAllowedStaticPath(pathname)) {
        sendJson(response, 404, { ok: false, error: "Not found." });
        return;
      }

      await serveStatic(pathname, response, rootDir);
    } catch (error) {
      const reference = createHash("sha256")
        .update(`${Date.now()}-${error.message}`)
        .digest("hex")
        .slice(0, 10);
      console.error(`[${reference}]`, error);
      sendJson(response, error.status || 500, {
        ok: false,
        error: error.status ? error.message : "Internal server error.",
        reference,
      });
    }
  });
}

const isMainModule =
  process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isMainModule) {
  const port = Number.parseInt(process.env.PORT || "4173", 10);
  const host = process.env.HOST || "0.0.0.0";
  const server = createPortfolioServer();

  server.listen(port, host, () => {
    console.log(`CHLOE portfolio running at http://${host}:${port}`);
  });
}
