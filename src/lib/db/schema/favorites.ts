import { pgTable, serial, uuid, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { users } from "./users";
import { beers } from "./beers";

export const beerFavorites = pgTable("beer_favorites", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  beerId: integer("beer_id").notNull().references(() => beers.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  unique("unique_user_beer").on(table.userId, table.beerId),
]);

export type BeerFavorite = typeof beerFavorites.$inferSelect;
export type NewBeerFavorite = typeof beerFavorites.$inferInsert;
