import { pgTable, serial, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const rememberTokens = pgTable("remember_tokens", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type RememberToken = typeof rememberTokens.$inferSelect;
export type NewRememberToken = typeof rememberTokens.$inferInsert;
