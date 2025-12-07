import { config } from "dotenv";
import type { Config } from "drizzle-kit";

// .env.local を読み込む
config({ path: ".env.local" });

export default {
  schema: "./src/lib/db/schema",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
