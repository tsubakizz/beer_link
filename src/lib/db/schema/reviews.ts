import { pgTable, serial, uuid, integer, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { beers } from "./beers";

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  beerId: integer("beer_id").notNull().references(() => beers.id),
  rating: integer("rating").notNull(),      // 1-5
  bitterness: integer("bitterness"),        // 1-5
  sweetness: integer("sweetness"),          // 1-5
  body: integer("body"),                    // 1-5
  aroma: integer("aroma"),                  // 1-5
  sourness: integer("sourness"),            // 1-5
  comment: text("comment"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
