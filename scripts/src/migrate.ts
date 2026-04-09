import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "../../lib/db/src/index.js";
import { pals, adhikarams, kurals } from "../../lib/db/src/schema/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  console.log("🚀 Starting migration...");

  const dataPath = path.resolve(
    __dirname,
    "../../artifacts/thirukkural-app/data/thirukkural.json"
  );
  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  try {
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
        // Batch insert kurals for performance
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
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
