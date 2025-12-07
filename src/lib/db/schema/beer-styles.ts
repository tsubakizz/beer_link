import { pgTable, serial, text, integer, decimal, timestamp } from "drizzle-orm/pg-core";

export const beerStyles = pgTable("beer_styles", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  bitterness: integer("bitterness"),      // 1-5
  sweetness: integer("sweetness"),        // 1-5
  body: integer("body"),                  // 1-5
  aroma: integer("aroma"),                // 1-5
  sourness: integer("sourness"),          // 1-5
  history: text("history"),
  origin: text("origin"),
  abvMin: decimal("abv_min", { precision: 4, scale: 2 }),
  abvMax: decimal("abv_max", { precision: 4, scale: 2 }),
  ibuMin: integer("ibu_min"),
  ibuMax: integer("ibu_max"),
  srmMin: integer("srm_min"),
  srmMax: integer("srm_max"),
  servingTempMin: integer("serving_temp_min"),
  servingTempMax: integer("serving_temp_max"),
  status: text("status").default("approved").notNull(), // 'pending' | 'approved' | 'rejected'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type BeerStyle = typeof beerStyles.$inferSelect;
export type NewBeerStyle = typeof beerStyles.$inferInsert;
