import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type Database = NeonHttpDatabase<typeof schema>;

// Lazy connection — only connects when first queried, not at import time.
// This prevents build failures when DATABASE_URL isn't set (e.g. Vercel preview builds).
function createDb(): Database {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local or Vercel environment variables."
    );
  }
  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
}

let _db: Database | null = null;

export const db = new Proxy({} as Database, {
  get(_target, prop) {
    if (!_db) {
      _db = createDb();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (_db as any)[prop];
  },
});
