import { pgTable, serial, text, integer, decimal, uuid, timestamp, varchar } from "drizzle-orm/pg-core";
import { breweries } from "./breweries";
import { beerStyles } from "./beer-styles";
import { users } from "./users";

export const beers = pgTable("beers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  shortDescription: varchar("short_description", { length: 100 }), // 一覧ページ・メタデータ用の短い紹介文
  description: text("description"),
  breweryId: integer("brewery_id").notNull().references(() => breweries.id),
  styleId: integer("style_id").references(() => beerStyles.id),
  customStyleText: varchar("custom_style_text", { length: 100 }), // 「その他」スタイル選択時のカスタム名
  abv: decimal("abv", { precision: 4, scale: 2 }),
  ibu: integer("ibu"),
  imageUrl: text("image_url"),
  amazonUrl: text("amazon_url"), // Amazon購入リンク（アフィリエイト）
  rakutenUrl: text("rakuten_url"), // 楽天購入リンク（アフィリエイト）
  officialUrl: text("official_url"), // 公式サイトURL
  otherShopUrl: text("other_shop_url"), // その他のサイトURL
  status: text("status").default("approved").notNull(), // 'pending' | 'approved' | 'rejected'
  submittedBy: uuid("submitted_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Beer = typeof beers.$inferSelect;
export type NewBeer = typeof beers.$inferInsert;
