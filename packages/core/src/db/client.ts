import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { __marketronPrisma?: PrismaClient };

/**
 * Lazily-constructed singleton. Kept lazy (rather than instantiated at
 * module load) so that packages which merely import shared types from
 * @marketron/core — the planner, the renderer — never pay the cost of
 * constructing a Prisma client (or hit a "run `prisma generate`" error)
 * unless they actually touch the database.
 */
export function getPrisma(): PrismaClient {
  if (!globalForPrisma.__marketronPrisma) {
    globalForPrisma.__marketronPrisma = new PrismaClient();
  }
  return globalForPrisma.__marketronPrisma;
}
