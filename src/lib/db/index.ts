import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * 新しいDB接続を作成
 * Cloudflare Workersでは Hyperdrive 経由で接続
 * ローカル開発では DATABASE_URL を使用
 */
function createDb(): PostgresJsDatabase<typeof schema> {
  let connectionString: string;

  try {
    // Cloudflare Workers 環境では Hyperdrive を使用
    const { env } = getCloudflareContext();
    connectionString = (env as { HYPERDRIVE: { connectionString: string } }).HYPERDRIVE.connectionString;
  } catch {
    // ローカル開発環境では process.env を使用
    connectionString = process.env.DATABASE_URL!;
  }

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
