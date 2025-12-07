import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * 新しいDB接続を作成
 * Cloudflare Workersでは各リクエストで新しい接続を使用する必要がある
 */
function createDb(): PostgresJsDatabase<typeof schema> {
  const connectionString = process.env.DATABASE_URL!;
  const client = postgres(connectionString, {
    prepare: false,
    max: 1,
    idle_timeout: 0, // 即座に閉じる
    connect_timeout: 10,
  });
  return drizzle(client, { schema });
}

/**
 * データベース接続を取得
 * 毎回新しい接続を作成（Workers環境での安定性のため）
 */
export function getDb(): PostgresJsDatabase<typeof schema> {
  return createDb();
}

// 後方互換性: db を使う既存コードはそのまま動作
// Proxyで毎回getDb()を呼び出し
export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_, prop) {
    return (createDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
