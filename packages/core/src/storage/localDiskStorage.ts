import fs from "node:fs/promises";
import path from "node:path";
import type { Storage } from "./storage";
import { resolveStorageRoot } from "./paths";

export class LocalDiskStorage implements Storage {
  constructor(private readonly rootDir: string) {}

  root(): string {
    return this.rootDir;
  }

  absolutePath(relativePath: string): string {
    const abs = path.join(this.rootDir, relativePath);
    if (!abs.startsWith(path.resolve(this.rootDir))) {
      throw new Error(`Refusing to resolve path outside storage root: ${relativePath}`);
    }
    return abs;
  }

  async save(relativePath: string, data: Buffer): Promise<string> {
    const abs = this.absolutePath(relativePath);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, data);
    return relativePath;
  }

  async readFile(relativePath: string): Promise<Buffer> {
    return fs.readFile(this.absolutePath(relativePath));
  }

  async exists(relativePath: string): Promise<boolean> {
    try {
      await fs.access(this.absolutePath(relativePath));
      return true;
    } catch {
      return false;
    }
  }
}

let defaultStorage: LocalDiskStorage | undefined;

/** Shared storage instance rooted at STORAGE_ROOT (default "./storage"). */
export function getDefaultStorage(): LocalDiskStorage {
  if (!defaultStorage) {
    defaultStorage = new LocalDiskStorage(resolveStorageRoot(process.env.STORAGE_ROOT));
  }
  return defaultStorage;
}
