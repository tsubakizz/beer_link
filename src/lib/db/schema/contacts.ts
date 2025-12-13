import { pgTable, serial, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").default("pending").notNull(), // 'pending' | 'read' | 'replied' | 'closed'
  submittedBy: uuid("submitted_by").references(() => users.id), // nullable（未ログインユーザーも可）
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
