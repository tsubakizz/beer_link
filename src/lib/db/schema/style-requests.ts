import { pgTable, serial, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const beerStyleRequests = pgTable("beer_style_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  submittedBy: uuid("submitted_by").notNull().references(() => users.id),
  status: text("status").default("pending").notNull(), // 'pending' | 'approved' | 'rejected'
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type BeerStyleRequest = typeof beerStyleRequests.$inferSelect;
export type NewBeerStyleRequest = typeof beerStyleRequests.$inferInsert;
