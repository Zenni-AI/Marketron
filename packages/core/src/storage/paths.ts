import { fileURLToPath } from "node:url";
import path from "node:path";

// This file lives at packages/core/src/storage/paths.ts — four levels up is
// the monorepo root. Anchoring here (rather than resolving relative to
// process.cwd()) keeps a relative STORAGE_ROOT consistent regardless of
// whether the caller is the Next.js app (cwd = apps/web) or a script run
// from the repo root.
const THIS_DIR = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(THIS_DIR, "../../../..");

export function resolveStorageRoot(configured?: string): string {
  const value = configured ?? "./storage";
  return path.isAbsolute(value) ? value : path.resolve(REPO_ROOT, value);
}
