import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema/index.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the directory exists or just use a fixed path from root
const workspaceRoot = path.resolve(__dirname, "../../..");
const localDbPath = path.resolve(workspaceRoot, "lib/db/sqlite.db");

const client = createClient({
  url: process.env["DATABASE_URL"] || `file:${localDbPath}`,
  authToken: process.env["DATABASE_AUTH_TOKEN"],
});

export const db = drizzle(client, { schema });

export * from "./schema/index.js";
