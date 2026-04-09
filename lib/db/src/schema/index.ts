import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const pals = sqliteTable("pals", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  nameTransliteration: text("name_transliteration").notNull(),
  meaning: text("meaning").notNull(),
});

export const adhikarams = sqliteTable("adhikarams", {
  id: integer("id").primaryKey(),
  palId: integer("pal_id")
    .notNull()
    .references(() => pals.id),
  name: text("name").notNull(),
  nameTransliteration: text("name_transliteration").notNull(),
  meaning: text("meaning").notNull(),
  section: text("section"),
  introduction: text("introduction"),
});

export const kurals = sqliteTable("kurals", {
  number: integer("number").primaryKey(),
  adhikaramId: integer("adhikaram_id")
    .notNull()
    .references(() => adhikarams.id),
  tamil: text("tamil").notNull(),
  transliteration: text("transliteration").notNull(),
  commentary: text("commentary").notNull(),
});

export type Pal = typeof pals.$inferSelect;
export type Adhikaram = typeof adhikarams.$inferSelect;
export type Kural = typeof kurals.$inferSelect;