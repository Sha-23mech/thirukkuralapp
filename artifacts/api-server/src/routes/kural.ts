import { Router } from "express";
import { db } from "@workspace/db";
import { pals, adhikarams, kurals } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// Get all sections (Pals)
router.get("/pals", async (req, res) => {
  try {
    const allPals = await db.select().from(pals);
    res.json(allPals);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sections" });
  }
});

// Get chapters (Adhikarams) for a pal or all
router.get("/adhikarams", async (req, res) => {
  const { palId } = req.query;
  try {
    const query = db.select().from(adhikarams);
    if (palId) {
      const results = await query.where(eq(adhikarams.palId, Number(palId)));
      return res.json(results);
    }
    const results = await query;
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chapters" });
  }
});

// Get kurals for an adhikaram or search
router.get("/kurals", async (req, res) => {
  const { adhikaramId } = req.query;
  try {
    const query = db.select().from(kurals);
    if (adhikaramId) {
      const results = await query.where(eq(kurals.adhikaramId, Number(adhikaramId)));
      return res.json(results);
    }
    const results = await query.limit(10); // Default limit
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch kurals" });
  }
});

// Get a specific kural by number
router.get("/kural/:number", async (req, res) => {
  const { number } = req.params;
  try {
    const result = await db.select().from(kurals).where(eq(kurals.number, Number(number)));
    if (result.length === 0) {
      return res.status(404).json({ error: "Kural not found" });
    }
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch kural" });
  }
});

export default router;
