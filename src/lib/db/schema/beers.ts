import { pgTable, serial, text, integer, decimal, uuid, timestamp } from "drizzle-orm/pg-core";
import { breweries } from "./breweries";
import { beerStyles } from "./beer-styles";
import { users } from "./users";

export const beers = pgTable("beers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  breweryId: integer("brewery_id").notNull().references(() => breweries.id),
  styleId: integer("style_id").references(() => beerStyles.id),
  abv: decimal("abv", { precision: 4, scale: 2 }),
  ibu: integer("ibu"),
  imageUrl: text("image_url"),
  status: text("status").default("approved").notNull(), // 'pending' | 'approved' | 'rejected'
  submittedBy: uuid("submitted_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Beer = typeof beers.$inferSelect;
export type NewBeer = typeof beers.$inferInsert;
