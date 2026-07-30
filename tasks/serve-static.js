"use strict";

const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const MIME_TYPES = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webm": "video/webm",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function sendText(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(body),
    "Content-Type": "text/plain; charset=utf-8",
  });
  response.end(body);
}

function resolveRequestPath(root, requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl, "http://127.0.0.1").pathname);
  const relative = pathname.replace(/^\/+/, "");
  const resolved = path.resolve(root, relative || "index.html");
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) return null;
  return resolved;
}

function parseRange(header, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header || "");
  if (!match) return null;
  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2] || 0));
  const end = match[2] ? Number(match[2]) : size - 1;
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end < start || start >= size) {
    return { invalid: true };
  }
  return { start, end: Math.min(end, size - 1) };
}

function createStaticServer(rootDirectory) {
  const root = path.resolve(rootDirectory);
  return http.createServer(async (request, response) => {
    try {
      if (request.method !== "GET" && request.method !== "HEAD") {
        response.setHeader("Allow", "GET, HEAD");
        sendText(response, 405, "Method not allowed");
        return;
      }

      let filePath = resolveRequestPath(root, request.url);
      if (!filePath) {
        sendText(response, 403, "Forbidden");
        return;
      }

      let stat;
      try {
        stat = await fs.promises.stat(filePath);
      } catch (error) {
        if (error.code === "ENOENT" || error.code === "ENOTDIR") {
          sendText(response, 404, "Not found");
          return;
        }
        throw error;
      }

      if (stat.isDirectory()) {
        filePath = path.join(filePath, "index.html");
        try {
          stat = await fs.promises.stat(filePath);
        } catch (error) {
          if (error.code === "ENOENT" || error.code === "ENOTDIR") {
            sendText(response, 404, "Not found");
            return;
          }
          throw error;
        }
      }

      if (!stat.isFile()) {
        sendText(response, 404, "Not found");
        return;
      }

      const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
      const range = parseRange(request.headers.range, stat.size);
      const headers = {
        "Accept-Ranges": "bytes",
        "Cache-Control": "no-store",
        "Content-Type": contentType,
      };

      if (range && range.invalid) {
        response.writeHead(416, { ...headers, "Content-Range": `bytes */${stat.size}` });
        response.end();
        return;
      }

      if (range) {
        const length = range.end - range.start + 1;
        response.writeHead(206, {
          ...headers,
          "Content-Length": length,
          "Content-Range": `bytes ${range.start}-${range.end}/${stat.size}`,
        });
        if (request.method === "HEAD") {
          response.end();
          return;
        }
        fs.createReadStream(filePath, { start: range.start, end: range.end }).pipe(response);
        return;
      }

      response.writeHead(200, { ...headers, "Content-Length": stat.size });
      if (request.method === "HEAD") {
        response.end();
        return;
      }
      fs.createReadStream(filePath).pipe(response);
    } catch (error) {
      if (!response.headersSent) sendText(response, 500, "Internal server error");
      else response.destroy(error);
    }
  });
}

async function startStaticServer({ root = process.cwd(), host = "127.0.0.1", port = 0 } = {}) {
  const server = createStaticServer(root);
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, resolve);
  });
  const address = server.address();
  return {
    host,
    port: address.port,
    root: path.resolve(root),
    server,
    url: `http://${host}:${address.port}`,
    close: () => new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    }),
  };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  let root = process.cwd();
  let port = Number(process.env.PORT || 8080);
  const positionals = [];
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--port") {
      port = Number(args[index + 1]);
      index += 1;
    } else if (args[index] === "--root") {
      root = path.resolve(args[index + 1]);
      index += 1;
    } else {
      positionals.push(args[index]);
    }
  }
  if (positionals[0]) root = path.resolve(positionals[0]);
  if (positionals[1]) port = Number(positionals[1]);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    console.error("Port must be an integer between 0 and 65535.");
    process.exit(1);
  }
  startStaticServer({ root, port }).then((instance) => {
    console.log(`Serving ${instance.root} at ${instance.url}`);
    const close = async () => {
      await instance.close().catch(() => {});
      process.exit(0);
    };
    process.once("SIGINT", close);
    process.once("SIGTERM", close);
  }).catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}

module.exports = { createStaticServer, startStaticServer };
