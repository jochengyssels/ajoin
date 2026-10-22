import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

let instance: ReturnType<typeof create> | null = null;

function create() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  // WebSocket pool: supports transactions, needed for atomic order creation.
  return drizzle(new Pool({ connectionString: url }), { schema });
}

/** Lazily connects so builds and pages that don't touch the DB work without DATABASE_URL. */
export function db() {
  instance ??= create();
  return instance;
}

export const hasDatabase = () => Boolean(process.env.DATABASE_URL);
export { schema };
