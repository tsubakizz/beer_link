import { pgTable, serial, integer, text, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { beerStyles } from "./beer-styles";

// ビールスタイルの別名テーブル
export const beerStyleOtherNames = pgTable(
  "beer_style_other_names",
  {
    id: serial("id").primaryKey(),
    styleId: integer("style_id")
      .notNull()
      .references(() => beerStyles.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      styleIdIdx: index("beer_style_other_names_style_id_idx").on(table.styleId),
    };
  }
);

// beerStyleOtherNamesのリレーション定義
export const beerStyleOtherNamesRelations = relations(
  beerStyleOtherNames,
  ({ one }) => ({
    style: one(beerStyles, {
      fields: [beerStyleOtherNames.styleId],
      references: [beerStyles.id],
    }),
  })
);

// 型定義
export type BeerStyleOtherName = typeof beerStyleOtherNames.$inferSelect;
export type NewBeerStyleOtherName = typeof beerStyleOtherNames.$inferInsert;
