import { config } from "dotenv";
import type { Config } from "drizzle-kit";

// 環境変数 ENV_FILE で .env ファイルを切り替え可能
// 例: ENV_FILE=.env.production.local npx drizzle-kit push
const envFile = process.env.ENV_FILE || ".env.local";
config({ path: envFile, override: true });

export default {
  schema: "./src/lib/db/schema",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
