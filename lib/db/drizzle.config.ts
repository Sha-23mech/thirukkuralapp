import { defineConfig } from "drizzle-kit";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  schema: "./src/schema/index.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env["DATABASE_URL"] || "sqlite.db",
    authToken: process.env["DATABASE_AUTH_TOKEN"],
  },
});
