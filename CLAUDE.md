# Claude Code 設定ファイル

このファイルはClaude Codeがプロジェクトのコンテキストを理解するための設定ファイルです。

## プロジェクト概要

Beer Link - クラフトビール情報共有プラットフォーム

- **フレームワーク**: Next.js 15 (App Router)
- **データベース**: PostgreSQL (Supabase)
- **ORM**: Drizzle ORM
- **認証**: Supabase Auth
- **スタイリング**: Tailwind CSS + DaisyUI

## スキーマ変更時の手順

新しいテーブルを追加したり、既存のスキーマを変更する場合は以下の手順を実行してください。

### 1. スキーマファイルの作成・編集

```
src/lib/db/schema/
```

新しいテーブルの場合は新規ファイルを作成し、`src/lib/db/schema/index.ts` でエクスポートを追加。

### 2. データベースへの反映

```bash
npx drizzle-kit push
```

### 3. RLS（Row Level Security）設定の追加

`src/lib/db/setup-rls.ts` の `rlsConfig` 配列に新しいテーブルの設定を追加。

**ポリシーパターン:**
- 公開読み取りのみ: `{ table: "table_name", policies: [{ name: "Public read access", cmd: "SELECT", using: "true" }] }`
- ユーザー自身のデータのみ: `{ using: "(auth.uid() = user_id)" }`
- 管理者のみ（サービスロール経由）: `{ table: "table_name", policies: [] }`

### 4. RLS設定の適用

```bash
# ローカル環境
npx tsx src/lib/db/setup-rls.ts

# 本番環境
ENV_FILE=.env.production.local npx tsx src/lib/db/setup-rls.ts
```

### 5. シードデータがある場合

- SQLファイルを `seeds/sql/` に配置
- または `seeds/` にCSVを配置して `src/lib/db/seed.ts` に処理を追加

## ディレクトリ構造

```
src/
├── app/                    # Next.js App Router
│   ├── admin/              # 管理画面
│   ├── api/                # API Routes
│   ├── styles/             # ビールスタイル一覧・詳細
│   ├── submit/             # 投稿フォーム
│   └── ...
├── components/             # 共通コンポーネント
├── lib/
│   ├── db/
│   │   ├── schema/         # Drizzle スキーマ定義
│   │   ├── index.ts        # DB接続
│   │   ├── seed.ts         # シードスクリプト
│   │   └── setup-rls.ts    # RLS設定スクリプト
│   └── supabase/           # Supabase クライアント
└── ...
seeds/
├── sql/                    # 手動実行用SQLファイル
└── *.csv                   # シードデータCSV
```

## ビルド・環境設定変更時

以下を変更した場合は `README.md` も更新すること:

- 依存パッケージの追加・削除（package.json）
- 環境変数の追加・変更（.env.local, .env.example）
- ビルドスクリプトの変更
- デプロイ手順の変更
- 開発環境のセットアップ手順の変更

## Cloudflare R2 画像管理

### R2バケットの種類

| バケット | 環境変数 | 用途 |
|---------|---------|------|
| `beer-link-staging-public` | `NEXT_PUBLIC_R2_PUBLIC_URL` | ユーザーアップロード画像（ビール写真等） |
| `beer-link-production-public` | `NEXT_PUBLIC_R2_PUBLIC_URL` | ユーザーアップロード画像（本番） |
| `beer-link-assets` | `NEXT_PUBLIC_R2_ASSETS_URL` | 静的アセット（ロゴ、KV、アイコン等） |

### 静的アセットの追加手順

```bash
# 1. UUIDを生成
uuidgen

# 2. R2にアップロード（ファイル名はUUID、小文字推奨）
npx wrangler r2 object put beer-link-assets/<uuid>.<拡張子> \
  --file=<ローカルファイルパス> \
  --content-type="image/webp" \
  --remote
```

### 現在の静的アセット一覧

| UUID | 用途 |
|------|------|
| `02506bce-6ae7-45ee-bdb8-8156534a9758.png` | ヘッダーロゴ |
| `a15279c4-18a7-434c-a4cf-1d23945fdd9c.webp` | トップページKV |
| `663adb8a-c867-47da-bea7-ace4f266ba75.webp` | 一覧機能アイコン |
| `288284bf-c706-475f-98c5-c0fa26afd9cd.webp` | レビュー機能アイコン |
| `0fd4da87-6a9b-4447-9b24-0707bd323abc.webp` | みんなで作るアイコン |
| `4a9c3c2e-25f8-47c7-b1e7-d7b9f54e4466.webp` | 初心者ガイドアイコン |

### 画像使用時の注意

- 静的アセットは `NEXT_PUBLIC_R2_ASSETS_URL` を使用
- ユーザーアップロード画像は `NEXT_PUBLIC_R2_PUBLIC_URL` を使用
- Next.js Image の `fill` 使用時は `style={{ objectFit: "cover" }}` を指定
- 新しいドメインを使う場合は `next.config.ts` の `remotePatterns` に追加

## コーディング規約

- Server Components をデフォルトで使用
- クライアント操作が必要な場合のみ `"use client"` を使用
- Server Actions は `"use server"` で定義
- 管理画面の操作は必ず `checkAdmin()` で権限チェック
