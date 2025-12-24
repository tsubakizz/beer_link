import { pgTable, serial, text, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { prefectures } from "./prefectures";

export const breweries = pgTable("breweries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  shortDescription: varchar("short_description", { length: 100 }), // 一覧ページ・メタデータ用の短い紹介文
  description: text("description"),
  prefectureId: integer("prefecture_id").references(() => prefectures.id),
  address: text("address"),
  websiteUrl: text("website_url"),
  imageUrl: text("image_url"),
  imageSourceUrl: text("image_source_url"), // 画像の参照元URL
  amazonUrl: text("amazon_url"), // Amazonストアリンク
  rakutenUrl: text("rakuten_url"), // 楽天ストアリンク
  otherShopUrl: text("other_shop_url"), // その他のサイトURL
  status: text("status").default("approved").notNull(), // 'pending' | 'approved' | 'rejected'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Brewery = typeof breweries.$inferSelect;
export type NewBrewery = typeof breweries.$inferInsert;
