# Beer Link

クラフトビールレビューアプリケーション

## 技術スタック

- **フロントエンド**: Next.js 16, React 19, TailwindCSS, daisyUI
- **バックエンド**: Cloudflare Workers (OpenNext)
- **データベース**: Supabase PostgreSQL + Drizzle ORM
- **ストレージ**: Cloudflare R2
- **認証**: Supabase Auth

## 環境構成

| 環境 | URL | 用途 |
|------|-----|------|
| ローカル | `http://localhost:3000` | 開発 |
| ステージング | `https://beer-link-staging.m-tsubaki.workers.dev` | 検証 |
| 本番 | `https://beer-link-production.m-tsubaki.workers.dev` | 公開 |

## ローカル開発環境のセットアップ

### 前提条件

- Node.js 20以上
- Docker Desktop
- Supabase CLI (`brew install supabase/tap/supabase`)

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd beer_link
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. ローカルSupabaseの起動

```bash
supabase start
```

初回起動時はDockerイメージのダウンロードに数分かかります。

起動後、以下のような情報が表示されます：

```text
Studio:      http://127.0.0.1:54323
Project URL: http://127.0.0.1:54321
DB URL:      postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

### 4. 環境変数の設定

`.env.local` ファイルを作成：

```bash
# Supabase (Local Development)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase startで表示されるPublishable Key>
SUPABASE_SERVICE_ROLE_KEY=<supabase startで表示されるSecret Key>

# Database (Local Supabase)
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Cloudflare R2 (開発用バケット)
CLOUDFLARE_ACCOUNT_ID=<your-account-id>
R2_ACCESS_KEY_ID=<your-access-key>
R2_SECRET_ACCESS_KEY=<your-secret-key>
R2_BUCKET_NAME=beer-link-local-public
NEXT_PUBLIC_R2_PUBLIC_URL=<your-r2-public-url>
```

### 5. データベースのセットアップ

```bash
# スキーマをDBに適用
npx drizzle-kit push

# 初期データ（都道府県、ビールスタイル）を投入
npx tsx src/lib/db/seed.ts
```

### 6. 開発サーバーの起動

```bash
npm run dev
```

<http://localhost:3000> でアクセスできます。

### ローカルSupabaseの停止

```bash
supabase stop
```

## デプロイ

### ステージング環境へのデプロイ

```bash
npm run deploy:staging
```

### 本番環境へのデプロイ

```bash
npm run deploy:production
```

### GitHub Actions による自動デプロイ

- `staging` ブランチへのpush → ステージングにデプロイ
- `main` ブランチへのpush → 本番にデプロイ

## 便利なコマンド

```bash
# 開発サーバー
npm run dev

# ビルド（Next.js）
npm run build

# Workerビルド（Cloudflare）
npm run build:worker

# Workerプレビュー（ローカルでWorker動作確認）
npm run preview

# リント
npm run lint

# Drizzle Studio（DBブラウザ）
npx drizzle-kit studio
```

## ディレクトリ構成

```text
beer_link/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── (auth)/       # 認証関連ページ
│   │   ├── admin/        # 管理画面
│   │   ├── beers/        # ビール一覧・詳細
│   │   ├── breweries/    # ブルワリー一覧・詳細
│   │   ├── styles/       # スタイル一覧・詳細
│   │   └── ...
│   ├── components/       # UIコンポーネント
│   └── lib/
│       ├── db/           # Drizzle ORM設定・スキーマ
│       └── supabase/     # Supabaseクライアント
├── seeds/                # シードデータ（CSV）
├── supabase/             # Supabase CLI設定
├── wrangler.toml         # Cloudflare Workers設定
└── drizzle.config.ts     # Drizzle設定
```

## トラブルシューティング

### ローカルSupabaseが起動しない

```bash
# Dockerが起動しているか確認
docker info

# Supabaseコンテナをリセット
supabase stop --no-backup
supabase start
```

### データベース接続エラー

```bash
# Supabaseの状態確認
supabase status

# DATABASE_URLが正しいか確認
echo $DATABASE_URL
```
