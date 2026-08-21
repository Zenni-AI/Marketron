import fs from "node:fs";
import { storage } from "./storage";

const BRAND_LOGO_RELATIVE_PATH = "branding/logo.png";

/**
 * v1 ships a single global placeholder brand logo (created by
 * `pnpm seed:sample`, see scripts/seed-sample-assets.ts). Per-job/per-user
 * branding upload is future work — this is intentionally the only place
 * that decision is made, so wiring in real branding later is a one-file
 * change.
 */
export function getBrandLogoAbsolutePath(): string | undefined {
  const abs = storage.absolutePath(BRAND_LOGO_RELATIVE_PATH);
  return fs.existsSync(abs) ? abs : undefined;
}
