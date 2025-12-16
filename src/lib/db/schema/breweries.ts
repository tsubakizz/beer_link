import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { prefectures } from "./prefectures";

export const breweries = pgTable("breweries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  prefectureId: integer("prefecture_id").references(() => prefectures.id),
  address: text("address"),
  websiteUrl: text("website_url"),
  imageUrl: text("image_url"),
  status: text("status").default("approved").notNull(), // 'pending' | 'approved' | 'rejected'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Brewery = typeof breweries.$inferSelect;
export type NewBrewery = typeof breweries.$inferInsert;
