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

## コーディング規約

- Server Components をデフォルトで使用
- クライアント操作が必要な場合のみ `"use client"` を使用
- Server Actions は `"use server"` で定義
- 管理画面の操作は必ず `checkAdmin()` で権限チェック
