import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const MIME_TYPES: Record<string, string> = {
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export interface AssetServer {
  url: string;
  close: () => Promise<void>;
}

/**
 * Serves files under rootDir over plain HTTP for the duration of a render.
 * Remotion's headless-browser render needs a URL it can fetch (rather than
 * an arbitrary filesystem path), and this keeps the renderer agnostic to
 * where assets actually live on disk (local today, could be a proxy to S3
 * later) — it just needs *something* HTTP-servable.
 */
export function startAssetServer(rootDir: string): Promise<AssetServer> {
  const resolvedRoot = path.resolve(rootDir);
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const reqPath = decodeURIComponent((req.url ?? "/").split("?")[0]);
      const filePath = path.join(resolvedRoot, reqPath);
      if (!filePath.startsWith(resolvedRoot)) {
        res.writeHead(403);
        res.end();
        return;
      }
      fs.stat(filePath, (err, stat) => {
        if (err || !stat.isFile()) {
          res.writeHead(404);
          res.end();
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.setHeader("Content-Type", MIME_TYPES[ext] ?? "application/octet-stream");
        res.setHeader("Content-Length", stat.size);
        fs.createReadStream(filePath).pipe(res);
      });
    });

    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Asset server failed to bind to a port"));
        return;
      }
      resolve({
        url: `http://127.0.0.1:${address.port}`,
        close: () => new Promise<void>((res) => server.close(() => res())),
      });
    });
  });
}
