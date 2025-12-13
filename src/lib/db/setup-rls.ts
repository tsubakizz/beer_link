import { config } from "dotenv";
import postgres from "postgres";

// 環境変数 ENV_FILE で .env ファイルを切り替え可能
// 例: ENV_FILE=.env.production.local npx tsx src/lib/db/setup-rls.ts
const envFile = process.env.ENV_FILE || ".env.local";
config({ path: envFile, override: true });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const sql = postgres(connectionString, { prepare: false });

// RLS設定の定義
const rlsConfig = [
  // 公開読み取りのみ
  { table: "prefectures", policies: [{ name: "Public read access", cmd: "SELECT", using: "true" }] },
  { table: "beer_styles", policies: [{ name: "Public read access", cmd: "SELECT", using: "true" }] },
  { table: "beer_style_relations", policies: [{ name: "Public read access", cmd: "SELECT", using: "true" }] },
  { table: "beers", policies: [{ name: "Public read access", cmd: "SELECT", using: "true" }] },
  { table: "breweries", policies: [{ name: "Public read access", cmd: "SELECT", using: "true" }] },
  { table: "reviews", policies: [{ name: "Public read access", cmd: "SELECT", using: "true" }] },

  // ユーザー関連
  { table: "users", policies: [{ name: "Users can read own data", cmd: "SELECT", using: "(auth.uid() = id)" }] },

  // お気に入り
  { table: "beer_favorites", policies: [] },

  // スタイルリクエスト
  { table: "beer_style_requests", policies: [] },

  // 問い合わせ（管理者のみアクセス、サービスロール経由）
  { table: "contacts", policies: [] },

  // ログイン維持トークン（サービスロール経由のみ）
  { table: "remember_tokens", policies: [] },
];

async function setupRLS() {
  console.log("🔐 Setting up RLS...");

  for (const { table, policies } of rlsConfig) {
    // テーブルが存在するか確認
    const exists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = ${table}
      )
    `;

    if (!exists[0].exists) {
      console.log(`  ⏭️  Skipping ${table} (table does not exist)`);
      continue;
    }

    // RLSを有効化
    await sql.unsafe(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY`);
    console.log(`  ✅ Enabled RLS on ${table}`);

    // ポリシーを作成
    for (const policy of policies) {
      const policyName = `${policy.name} for ${table}`;
      try {
        // 既存のポリシーを削除してから作成
        await sql.unsafe(`DROP POLICY IF EXISTS "${policyName}" ON "${table}"`);
        await sql.unsafe(
          `CREATE POLICY "${policyName}" ON "${table}" FOR ${policy.cmd} TO public USING (${policy.using})`
        );
        console.log(`     📋 Created policy: ${policyName}`);
      } catch (e) {
        console.log(`     ⚠️  Policy error: ${policyName} - ${(e as Error).message}`);
      }
    }
  }

  console.log("🎉 RLS setup completed!");
  process.exit(0);
}

setupRLS().catch((error) => {
  console.error("❌ RLS setup failed:", error);
  process.exit(1);
});
