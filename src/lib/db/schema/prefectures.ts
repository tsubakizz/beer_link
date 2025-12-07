import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const prefectures = pgTable("prefectures", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Prefecture = typeof prefectures.$inferSelect;
export type NewPrefecture = typeof prefectures.$inferInsert;
