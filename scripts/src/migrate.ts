import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define schema directly to avoid import issues
const pals = sqliteTable("pals", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  nameTransliteration: text("name_transliteration").notNull(),
  meaning: text("meaning").notNull(),
});

const adhikarams = sqliteTable("adhikarams", {
  id: integer("id").primaryKey(),
  palId: integer("pal_id").notNull(),
  name: text("name").notNull(),
  nameTransliteration: text("name_transliteration").notNull(),
  meaning: text("meaning").notNull(),
  section: text("section"),
  introduction: text("introduction"),
});

const kurals = sqliteTable("kurals", {
  number: integer("number").primaryKey(),
  adhikaramId: integer("adhikaram_id").notNull(),
  tamil: text("tamil").notNull(),
  transliteration: text("transliteration").notNull(),
  commentary: text("commentary").notNull(),
});

async function migrate() {
  const url = process.env["DATABASE_URL"];
  const authToken = process.env["DATABASE_AUTH_TOKEN"];

  if (!url) {
    console.error("❌ DATABASE_URL is missing!");
    process.exit(1);
  }

  console.log(`🚀 Starting migration to ${url}...`);

  const client = createClient({ url, authToken });
  const db = drizzle(client);

  try {
    console.log("🏗️ Ensuring tables exist in the cloud...");
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS pals (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        name_transliteration TEXT NOT NULL,
        meaning TEXT NOT NULL
      );
    `);
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS adhikarams (
        id INTEGER PRIMARY KEY,
        pal_id INTEGER NOT NULL REFERENCES pals(id),
        name TEXT NOT NULL,
        name_transliteration TEXT NOT NULL,
        meaning TEXT NOT NULL,
        section TEXT,
        introduction TEXT
      );
    `);
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS kurals (
        number INTEGER PRIMARY KEY,
        adhikaram_id INTEGER NOT NULL REFERENCES adhikarams(id),
        tamil TEXT NOT NULL,
        transliteration TEXT NOT NULL,
        commentary TEXT NOT NULL
      );
    `);

    const dataPath = path.resolve(
      __dirname,
      "../../artifacts/thirukkural-app/data/thirukkural.json"
    );
    const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

    // Clear existing data (reverse order of dependencies)
    console.log("🧹 Cleaning up old data...");
    await db.delete(kurals);
    await db.delete(adhikarams);
    await db.delete(pals);

    console.log("📦 Inserting Pals...");
    for (const pal of data.pals) {
      await db.insert(pals).values({
        id: pal.id,
        name: pal.name,
        nameTransliteration: pal.nameTransliteration,
        meaning: pal.meaning,
      });

      console.log(`  📂 Inserting Adhikarams for ${pal.name}...`);
      for (const adhikaram of pal.adhikarams) {
        await db.insert(adhikarams).values({
          id: adhikaram.id,
          palId: pal.id,
          name: adhikaram.name,
          nameTransliteration: adhikaram.nameTransliteration,
          meaning: adhikaram.meaning,
          section: adhikaram.section,
          introduction: adhikaram.introduction,
        });

        console.log(`    📜 Inserting ${adhikaram.kurals.length} Kurals for ${adhikaram.name}...`);
        const kuralValues = adhikaram.kurals.map((k: any) => ({
          number: k.number,
          adhikaramId: adhikaram.id,
          tamil: k.tamil,
          transliteration: k.transliteration,
          commentary: k.commentary,
        }));
        
        await db.insert(kurals).values(kuralValues);
      }
    }

    console.log("✅ Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
