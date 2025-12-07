# beer_link デプロイ手順

## 概要

| 環境 | 用途 | URL例 |
|-----|------|-------|
| Staging | テスト・検証 | `beer-link-staging.your-domain.workers.dev` |
| Production | 本番 | `beer-link.example.com` |

## 必要なサービス

- **Cloudflare Workers**: アプリケーションホスティング
- **Cloudflare R2**: 画像ストレージ
- **Supabase**: データベース + 認証
- **Resend**: メール送信

---

# Part 1: ステージング環境構築

## 1. Cloudflare アカウント準備

### 1.1 Cloudflare ダッシュボードでの作業

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) にログイン
2. 左メニューから「Workers & Pages」を選択

### 1.2 Wrangler CLI セットアップ

```bash
# Wrangler インストール（未インストールの場合）
npm install -g wrangler

# Cloudflare にログイン
wrangler login
```

## 2. R2 バケット作成（ステージング用）

### 2.1 バケット作成

```bash
# ステージング用バケット作成
wrangler r2 bucket create beer-link-staging-public
```

### 2.2 パブリックアクセス設定

1. Cloudflare Dashboard → R2 → `beer-link-staging-public`
2. 「Settings」タブ → 「Public access」セクション
3. 「Allow Access」を有効化
4. 生成された公開URL（`https://pub-xxx.r2.dev`）をメモ

### 2.3 CORS 設定

R2 バケットの Settings → CORS policy に以下を設定：

```json
[
  {
    "AllowedOrigins": ["https://beer-link-staging.your-domain.workers.dev", "http://localhost:3000"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

## 3. Supabase プロジェクト作成（ステージング用）

### 3.1 プロジェクト作成

1. [Supabase Dashboard](https://supabase.com/dashboard) にログイン
2. 「New Project」をクリック
3. プロジェクト名: `beer-link-staging`
4. リージョン: `Northeast Asia (Tokyo)` 推奨
5. データベースパスワードを設定（メモしておく）

### 3.2 接続情報取得

Project Settings → Database から以下を取得：

- **Host**: `db.xxxx.supabase.co`
- **Database name**: `postgres`
- **Port**: `5432` (Direct) / `6543` (Pooler)
- **User**: `postgres`
- **Password**: 設定したパスワード

接続文字列（Pooler 推奨）:
```
postgresql://postgres.xxxx:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
```

### 3.3 データベースマイグレーション

```bash
# 環境変数を設定
export DATABASE_URL="postgresql://postgres.xxxx:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres"

# マイグレーション実行
npx drizzle-kit push
```

### 3.4 シードデータ投入（必要な場合）

```bash
npx tsx seeds/seed.ts
```

### 3.5 認証設定

Supabase Dashboard → Authentication → URL Configuration:

- **Site URL**: `https://beer-link-staging.your-domain.workers.dev`
- **Redirect URLs**:
  - `https://beer-link-staging.your-domain.workers.dev/auth/callback`
  - `http://localhost:3000/auth/callback`

## 4. Resend 設定

### 4.1 API キー作成

1. [Resend Dashboard](https://resend.com/api-keys) にログイン
2. 「Create API Key」
3. 名前: `beer-link-staging`
4. 生成されたAPIキーをメモ

### 4.2 ドメイン設定（任意）

本番用には独自ドメインからのメール送信を設定：
1. Resend → Domains → Add Domain
2. DNS レコードを設定

## 5. Next.js を Cloudflare Workers 用に設定

### 5.1 依存関係インストール

```bash
npm install @opennextjs/cloudflare
```

### 5.2 wrangler.toml 作成

```toml
#:schema node_modules/wrangler/config-schema.json
name = "beer-link-staging"
main = ".open-next/worker.js"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]

# 静的アセット
assets = { directory = ".open-next/assets", binding = "ASSETS" }

# 環境変数（機密情報は wrangler secret で設定）
[vars]
NEXT_PUBLIC_SITE_URL = "https://beer-link-staging.your-domain.workers.dev"
NEXT_PUBLIC_R2_PUBLIC_URL = "https://pub-xxx.r2.dev"

# R2 バインディング
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "beer-link-staging-public"
```

### 5.3 open-next.config.ts 作成

```typescript
import type { OpenNextConfig } from "@opennextjs/aws/types/open-next";

const config: OpenNextConfig = {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
    },
  },
  middleware: {
    external: true,
    override: {
      wrapper: "cloudflare-edge",
      converter: "edge",
      proxyExternalRequest: "fetch",
    },
  },
};

export default config;
```

### 5.4 package.json にスクリプト追加

```json
{
  "scripts": {
    "build:worker": "npx @opennextjs/cloudflare",
    "deploy:staging": "npm run build:worker && wrangler deploy",
    "dev:worker": "wrangler dev"
  }
}
```

## 6. 環境変数設定（Secrets）

```bash
# Supabase
wrangler secret put DATABASE_URL
# → postgresql://... を入力

wrangler secret put NEXT_PUBLIC_SUPABASE_URL
# → https://xxxx.supabase.co を入力

wrangler secret put NEXT_PUBLIC_SUPABASE_ANON_KEY
# → anon key を入力

wrangler secret put SUPABASE_SERVICE_ROLE_KEY
# → service_role key を入力

# R2
wrangler secret put R2_ACCESS_KEY_ID
wrangler secret put R2_SECRET_ACCESS_KEY
wrangler secret put CLOUDFLARE_ACCOUNT_ID

# Resend
wrangler secret put RESEND_API_KEY
```

## 7. デプロイ

```bash
# ビルド & デプロイ
npm run deploy:staging
```

デプロイ後、表示されるURLでアクセス確認。

---

# Part 2: 本番環境構築

## 1. R2 バケット作成（本番用）

```bash
wrangler r2 bucket create beer-link-production-public
```

パブリックアクセスとCORSを設定（ステージングと同様）。

## 2. Supabase プロジェクト作成（本番用）

1. 新規プロジェクト: `beer-link-production`
2. リージョン: `Northeast Asia (Tokyo)`
3. マイグレーション実行

```bash
export DATABASE_URL="postgresql://postgres.xxxx:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres"
npx drizzle-kit push
```

認証のURL設定:
- **Site URL**: `https://beer-link.example.com`
- **Redirect URLs**: `https://beer-link.example.com/auth/callback`

## 3. wrangler.toml に本番環境追加

```toml
#:schema node_modules/wrangler/config-schema.json
name = "beer-link-staging"
main = ".open-next/worker.js"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]

assets = { directory = ".open-next/assets", binding = "ASSETS" }

[vars]
NEXT_PUBLIC_SITE_URL = "https://beer-link-staging.your-domain.workers.dev"
NEXT_PUBLIC_R2_PUBLIC_URL = "https://pub-xxx.r2.dev"

[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "beer-link-staging-public"

# ============ 本番環境 ============
[env.production]
name = "beer-link-production"

[env.production.vars]
NEXT_PUBLIC_SITE_URL = "https://beer-link.example.com"
NEXT_PUBLIC_R2_PUBLIC_URL = "https://pub-yyy.r2.dev"

[[env.production.r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "beer-link-production-public"
```

## 4. 本番用 Secrets 設定

```bash
# --env production を付けて本番用に設定
wrangler secret put DATABASE_URL --env production
wrangler secret put NEXT_PUBLIC_SUPABASE_URL --env production
wrangler secret put NEXT_PUBLIC_SUPABASE_ANON_KEY --env production
wrangler secret put SUPABASE_SERVICE_ROLE_KEY --env production
wrangler secret put R2_ACCESS_KEY_ID --env production
wrangler secret put R2_SECRET_ACCESS_KEY --env production
wrangler secret put CLOUDFLARE_ACCOUNT_ID --env production
wrangler secret put RESEND_API_KEY --env production
```

## 5. カスタムドメイン設定

### 5.1 Cloudflare でドメイン管理

1. Cloudflare Dashboard → Websites → Add a Site
2. ドメインを追加し、ネームサーバーを変更

### 5.2 Workers にカスタムドメイン設定

1. Workers & Pages → beer-link-production → Settings → Domains & Routes
2. 「Add」→ Custom Domain
3. `beer-link.example.com` を入力

## 6. 本番デプロイ

```bash
# package.json にスクリプト追加
# "deploy:production": "npm run build:worker && wrangler deploy --env production"

npm run deploy:production
```

---

# 環境変数一覧

| 変数名 | 説明 | 例 |
|-------|------|-----|
| `DATABASE_URL` | PostgreSQL接続文字列 | `postgresql://...` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase公開キー | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabaseサービスキー | `eyJ...` |
| `NEXT_PUBLIC_SITE_URL` | サイトURL | `https://beer-link.example.com` |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | R2公開URL | `https://pub-xxx.r2.dev` |
| `R2_ACCESS_KEY_ID` | R2 APIキーID | `xxx` |
| `R2_SECRET_ACCESS_KEY` | R2 シークレットキー | `xxx` |
| `CLOUDFLARE_ACCOUNT_ID` | CloudflareアカウントID | `xxx` |
| `RESEND_API_KEY` | Resend APIキー | `re_xxx` |

---

# デプロイチェックリスト

## ステージング
- [ ] R2バケット作成・パブリック設定
- [ ] Supabaseプロジェクト作成
- [ ] DBマイグレーション実行
- [ ] Supabase認証URL設定
- [ ] Resend APIキー取得
- [ ] wrangler.toml設定
- [ ] Secrets設定
- [ ] デプロイ実行
- [ ] 動作確認

## 本番
- [ ] R2バケット作成・パブリック設定
- [ ] Supabaseプロジェクト作成
- [ ] DBマイグレーション実行
- [ ] Supabase認証URL設定
- [ ] wrangler.toml本番設定追加
- [ ] 本番Secrets設定
- [ ] カスタムドメイン設定
- [ ] SSL証明書確認
- [ ] デプロイ実行
- [ ] 動作確認

---

# トラブルシューティング

## よくある問題

### 1. ビルドエラー: Edge Runtime 非対応
一部のNode.js APIはEdge Runtimeで使用不可。`crypto`など。

### 2. 画像アップロード失敗
- R2のCORS設定を確認
- R2 APIキーの権限を確認

### 3. 認証コールバックエラー
- Supabaseの「Redirect URLs」設定を確認
- Site URLが正しいか確認

### 4. データベース接続エラー
- Pooler URLを使用しているか確認（port 6543）
- IPアドレス制限がないか確認
