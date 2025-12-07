# beer_link デプロイ完全ガイド（初学者向け）

このガイドでは、beer_link アプリケーションを Cloudflare Workers にデプロイする手順を、初めての方でも分かるように詳しく説明します。

## 目次

1. [事前準備](#1-事前準備)
2. [各サービスの説明](#2-各サービスの説明)
3. [ステージング環境の構築](#3-ステージング環境の構築)
4. [本番環境の構築](#4-本番環境の構築)
5. [トラブルシューティング](#5-トラブルシューティング)

---

## 1. 事前準備

### 1.1 必要なアカウント

以下のサービスのアカウントを作成してください（すべて無料プランで開始可能）：

| サービス | URL | 用途 |
|---------|-----|------|
| Cloudflare | https://dash.cloudflare.com/sign-up | アプリのホスティング、画像保存 |
| Supabase | https://supabase.com | データベース、ユーザー認証 |
| Resend | https://resend.com | メール送信（パスワードリセット等） |

### 1.2 必要なツール

ターミナル（コマンドライン）で以下のコマンドを実行して、必要なツールがインストールされているか確認します：

```bash
# Node.js のバージョン確認（18以上が必要）
node --version

# npm のバージョン確認
npm --version

# Git のバージョン確認
git --version
```

もし Node.js がインストールされていない場合は、[Node.js公式サイト](https://nodejs.org/)からインストールしてください。

### 1.3 プロジェクトの準備

```bash
# プロジェクトディレクトリに移動
cd /path/to/beer_link

# 依存関係をインストール
npm install

# Cloudflare Workers 用のパッケージをインストール
npm install @opennextjs/cloudflare

# Wrangler（Cloudflare CLI）をグローバルにインストール
npm install -g wrangler
```

---

## 2. 各サービスの説明

### Cloudflare Workers とは？

Cloudflare Workers は、サーバーレスでアプリケーションを動かすサービスです。

**メリット：**
- 世界中のエッジサーバーで動作するため高速
- 無料枠が大きい（1日10万リクエストまで無料）
- サーバー管理が不要

### Cloudflare R2 とは？

R2 は、画像などのファイルを保存するストレージサービスです。

**メリット：**
- エグレス（データ転送）料金が無料
- S3互換APIで使いやすい
- 10GB/月まで無料

### Supabase とは？

Supabase は、PostgreSQL データベースと認証機能を提供するサービスです。

**メリット：**
- PostgreSQL をそのまま使える
- 認証機能が組み込み
- 500MB/月まで無料

### Resend とは？

Resend は、メール送信APIを提供するサービスです。

**メリット：**
- シンプルなAPI
- 100通/日まで無料
- 配信率が高い

---

## 3. ステージング環境の構築

ステージング環境とは、本番公開前にテストするための環境です。まずはこちらを作成します。

### Step 1: Cloudflare にログイン

#### 1.1 Wrangler で認証

ターミナルで以下のコマンドを実行：

```bash
wrangler login
```

**何が起こるか：**
1. ブラウザが自動的に開きます
2. Cloudflare のログイン画面が表示されます
3. ログインして「Allow」をクリック
4. ターミナルに「Successfully logged in」と表示されれば成功

#### 1.2 アカウントID の確認

```bash
wrangler whoami
```

表示される `Account ID` をメモしておいてください。後で使います。

```
👋 You are logged in with an OAuth Token, associated with the email xxx@example.com.
┌─────────────────────────────────────┬──────────────────────────────────┐
│ Account Name                        │ Account ID                       │
├─────────────────────────────────────┼──────────────────────────────────┤
│ your-account                        │ abcd1234efgh5678ijkl9012mnop3456 │ ← これをメモ
└─────────────────────────────────────┴──────────────────────────────────┘
```

---

### Step 2: R2 バケットの作成

R2 バケットは、画像ファイルを保存する場所です。

#### 2.1 バケットを作成

```bash
wrangler r2 bucket create beer-link-staging-public
```

**成功時の出力：**
```
Creating bucket beer-link-staging-public with default storage class set to Standard.
Created bucket beer-link-staging-public with default storage class set to Standard.
```

#### 2.2 パブリックアクセスを有効化

画像を一般公開するために、パブリックアクセスを設定します。

1. ブラウザで [Cloudflare Dashboard](https://dash.cloudflare.com/) を開く
2. 左メニューから「**R2 Object Storage**」をクリック
3. 「**beer-link-staging-public**」をクリック
4. 上部の「**Settings**」タブをクリック
5. 「**Public access**」セクションを見つける
6. 「**Allow Access**」ボタンをクリック

**表示される公開URL をメモ：**
```
https://pub-xxxxxxxxxxxxxxxxxxxx.r2.dev
```

この URL は `NEXT_PUBLIC_R2_PUBLIC_URL` として後で使います。

#### 2.3 R2 API トークンの作成

アプリから R2 にアクセスするための認証情報を作成します。

1. Cloudflare Dashboard の右上のアイコンをクリック
2. 「**My Profile**」を選択
3. 左メニューから「**API Tokens**」を選択
4. 「**Create Token**」をクリック
5. 下部の「**Create Custom Token**」をクリック

**トークンの設定：**

| 項目 | 設定値 |
|-----|-------|
| Token name | `beer-link-r2-staging` |
| Permissions | Account → Cloudflare R2 Storage → Edit |
| Account Resources | Include → あなたのアカウント |

6. 「**Continue to summary**」→「**Create Token**」をクリック
7. 表示されるトークンをコピーして安全な場所に保存

**注意：** このトークンは一度しか表示されません！

表示される情報をメモ：
- **Access Key ID**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Secret Access Key**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

#### 2.4 CORS 設定

異なるドメインからのアクセスを許可する設定です。

1. R2 Dashboard で「beer-link-staging-public」を選択
2. 「Settings」タブを選択
3. 「CORS policy」セクションの「Edit CORS policy」をクリック
4. 以下の JSON を入力して「Save」：

```json
[
  {
    "AllowedOrigins": [
      "https://beer-link-staging.あなたのサブドメイン.workers.dev",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

---

### Step 3: Supabase プロジェクトの作成

#### 3.1 新規プロジェクト作成

1. [Supabase Dashboard](https://supabase.com/dashboard) にログイン
2. 「**New Project**」をクリック
3. 以下の情報を入力：

| 項目 | 入力値 |
|-----|-------|
| Organization | あなたの組織（なければ作成） |
| Name | `beer-link-staging` |
| Database Password | 強力なパスワードを設定（メモしておく！） |
| Region | `Northeast Asia (Tokyo)` |
| Pricing Plan | Free |

4. 「**Create new project**」をクリック
5. プロジェクトの作成完了まで2-3分待つ

#### 3.2 接続情報の取得

プロジェクトが作成されたら：

1. 左メニューの「**Project Settings**」（歯車アイコン）をクリック
2. 「**Database**」を選択
3. 「**Connection string**」セクションを確認

**「URI」タブを選択して、以下の2つの接続文字列をメモ：**

**Transaction モード（アプリケーション用）：**
```
postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
```

**Session モード（マイグレーション用）：**
```
postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres
```

**`[YOUR-PASSWORD]` の部分を、Step 3.1 で設定したパスワードに置き換えてください。**

#### 3.3 API キーの取得

1. 左メニューの「**Project Settings**」をクリック
2. 「**API**」を選択
3. 以下の値をメモ：

| 項目 | 説明 |
|-----|------|
| Project URL | `https://xxxx.supabase.co` |
| anon public | 公開キー（クライアント側で使用） |
| service_role | サービスキー（サーバー側で使用）**秘密にする！** |

#### 3.4 データベースのセットアップ

ターミナルで以下を実行してテーブルを作成します：

```bash
# 環境変数を一時的に設定（Session モードの接続文字列を使用）
export DATABASE_URL="postgresql://postgres.xxxx:YOUR_PASSWORD@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"

# マイグレーション実行
npx drizzle-kit push
```

**成功時の出力例：**
```
[✓] Changes applied
```

#### 3.5 シードデータの投入（オプション）

初期データを投入する場合：

```bash
npx tsx seeds/seed.ts
```

#### 3.6 認証設定

Supabase の認証機能を設定します：

1. Supabase Dashboard で左メニューの「**Authentication**」をクリック
2. 「**URL Configuration**」を選択
3. 以下を設定：

| 項目 | 設定値 |
|-----|-------|
| Site URL | `https://beer-link-staging.あなたのサブドメイン.workers.dev` |
| Redirect URLs | 下記を追加 |

**Redirect URLs に追加：**
```
https://beer-link-staging.あなたのサブドメイン.workers.dev/auth/callback
http://localhost:3000/auth/callback
```

4. 「**Save**」をクリック

---

### Step 4: Resend の設定

#### 4.1 API キーの作成

1. [Resend Dashboard](https://resend.com/api-keys) にログイン
2. 「**Create API Key**」をクリック
3. 以下を設定：

| 項目 | 設定値 |
|-----|-------|
| Name | `beer-link-staging` |
| Permission | Full access |
| Domain | デフォルトのまま |

4. 「**Add**」をクリック
5. 表示される API キー（`re_xxxx...`）をメモ

**注意：** この API キーも一度しか表示されません！

---

### Step 5: 設定ファイルの作成

#### 5.1 wrangler.toml の作成

プロジェクトのルートディレクトリに `wrangler.toml` ファイルを作成します：

```bash
touch wrangler.toml
```

以下の内容を記述（各値はあなたの環境に合わせて変更）：

```toml
#:schema node_modules/wrangler/config-schema.json

# ========================================
# ステージング環境（デフォルト）
# ========================================
name = "beer-link-staging"
main = ".open-next/worker.js"
compatibility_date = "2024-12-01"
compatibility_flags = ["nodejs_compat"]

# 静的ファイルの設定
assets = { directory = ".open-next/assets", binding = "ASSETS" }

# 公開する環境変数
[vars]
NEXT_PUBLIC_SITE_URL = "https://beer-link-staging.あなたのサブドメイン.workers.dev"
NEXT_PUBLIC_R2_PUBLIC_URL = "https://pub-xxxxxxxxxxxxxxxxxxxx.r2.dev"
NEXT_PUBLIC_SUPABASE_URL = "https://xxxx.supabase.co"
# 注意: NEXT_PUBLIC_SUPABASE_ANON_KEY は公開キーなのでここに書いてOK
NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# R2 バケットの紐付け
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "beer-link-staging-public"
```

#### 5.2 open-next.config.ts の作成

```bash
touch open-next.config.ts
```

以下の内容を記述：

```typescript
import type { OpenNextConfig } from "@opennextjs/cloudflare";

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

#### 5.3 package.json にスクリプトを追加

`package.json` の `scripts` セクションに以下を追加：

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "build:worker": "npx @opennextjs/cloudflare",
    "deploy:staging": "npm run build:worker && wrangler deploy",
    "deploy:production": "npm run build:worker && wrangler deploy --env production"
  }
}
```

---

### Step 6: 秘密情報（Secrets）の設定

API キーなどの秘密情報は、`wrangler secret` コマンドで設定します。これらは Cloudflare に安全に保存され、コードには含まれません。

各コマンドを実行すると、値の入力を求められます：

```bash
# データベース接続文字列（Transaction モード）
wrangler secret put DATABASE_URL
# → postgresql://postgres.xxxx:PASSWORD@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres を入力

# Supabase サービスキー
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
# → service_role キーを入力

# Cloudflare アカウント ID
wrangler secret put CLOUDFLARE_ACCOUNT_ID
# → Step 1.2 でメモした Account ID を入力

# R2 認証情報
wrangler secret put R2_ACCESS_KEY_ID
# → Step 2.3 でメモした Access Key ID を入力

wrangler secret put R2_SECRET_ACCESS_KEY
# → Step 2.3 でメモした Secret Access Key を入力

wrangler secret put R2_BUCKET_NAME
# → beer-link-staging-public を入力

# Resend API キー
wrangler secret put RESEND_API_KEY
# → Step 4.1 でメモした API キーを入力
```

**入力時の注意：**
- 入力した内容は画面に表示されません（セキュリティのため）
- 入力後、Enter を押すと設定されます

---

### Step 7: デプロイ

すべての設定が完了したら、デプロイします：

```bash
npm run deploy:staging
```

**処理の流れ：**
1. Next.js アプリをビルド
2. Cloudflare Workers 用に変換
3. Cloudflare にアップロード

**成功時の出力例：**
```
Total Upload: 1234.56 KiB / gzip: 456.78 KiB
Uploaded beer-link-staging (3.45 sec)
Published beer-link-staging (0.12 sec)
  https://beer-link-staging.あなたのサブドメイン.workers.dev
Current Deployment ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

表示された URL にアクセスして、アプリが動作することを確認してください！

---

### Step 8: 動作確認チェックリスト

以下の機能が正常に動作するか確認します：

- [ ] トップページが表示される
- [ ] ビール一覧ページが表示される
- [ ] ユーザー登録ができる
- [ ] ログインできる
- [ ] 画像アップロードができる（レビュー投稿時）
- [ ] パスワードリセットメールが届く

---

## 4. 本番環境の構築

ステージング環境で問題がないことを確認したら、本番環境を構築します。

### Step 1: 本番用 R2 バケットの作成

```bash
wrangler r2 bucket create beer-link-production-public
```

ステージング環境と同様に：
1. パブリックアクセスを有効化
2. 公開 URL をメモ
3. CORS を設定（本番ドメインを追加）

### Step 2: 本番用 Supabase プロジェクトの作成

1. Supabase Dashboard で新規プロジェクト作成
   - Name: `beer-link-production`
   - 他はステージングと同様

2. マイグレーション実行：
```bash
export DATABASE_URL="本番用の接続文字列"
npx drizzle-kit push
```

3. 認証設定：
   - Site URL: `https://beer-link.example.com`（本番ドメイン）
   - Redirect URLs: `https://beer-link.example.com/auth/callback`

### Step 3: wrangler.toml に本番設定を追加

`wrangler.toml` の末尾に以下を追加：

```toml
# ========================================
# 本番環境
# ========================================
[env.production]
name = "beer-link-production"

[env.production.vars]
NEXT_PUBLIC_SITE_URL = "https://beer-link.example.com"
NEXT_PUBLIC_R2_PUBLIC_URL = "https://pub-yyyyyyyyyyyyyyyyyyyy.r2.dev"
NEXT_PUBLIC_SUPABASE_URL = "https://yyyy.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY = "本番用のanon key"

[[env.production.r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "beer-link-production-public"
```

### Step 4: 本番用 Secrets の設定

すべてのコマンドに `--env production` を追加します：

```bash
wrangler secret put DATABASE_URL --env production
wrangler secret put SUPABASE_SERVICE_ROLE_KEY --env production
wrangler secret put CLOUDFLARE_ACCOUNT_ID --env production
wrangler secret put R2_ACCESS_KEY_ID --env production
wrangler secret put R2_SECRET_ACCESS_KEY --env production
wrangler secret put R2_BUCKET_NAME --env production
wrangler secret put RESEND_API_KEY --env production
```

### Step 5: カスタムドメインの設定（オプション）

独自ドメインを使用する場合：

#### 5.1 ドメインを Cloudflare に追加

1. Cloudflare Dashboard → 「**Add a Site**」
2. ドメイン名を入力（例：`example.com`）
3. 無料プランを選択
4. 表示されるネームサーバーをドメインレジストラで設定
5. DNS が反映されるまで待つ（最大48時間、通常は数時間）

#### 5.2 Workers にカスタムドメインを設定

1. Cloudflare Dashboard → 「**Workers & Pages**」
2. 「**beer-link-production**」を選択
3. 「**Settings**」→「**Domains & Routes**」
4. 「**Add**」→「**Custom Domain**」
5. `beer-link.example.com` を入力
6. 「**Add Custom Domain**」をクリック

SSL 証明書は自動的に発行されます。

### Step 6: 本番デプロイ

```bash
npm run deploy:production
```

---

## 5. トラブルシューティング

### よくあるエラーと解決方法

#### エラー: "wrangler: command not found"

**原因：** Wrangler がインストールされていない

**解決方法：**
```bash
npm install -g wrangler
```

#### エラー: "Error: The bucket 'xxx' doesn't exist"

**原因：** R2 バケットが作成されていない、または名前が間違っている

**解決方法：**
```bash
# バケット一覧を確認
wrangler r2 bucket list

# 正しい名前でバケットを作成
wrangler r2 bucket create 正しいバケット名
```

#### エラー: 画像がアップロードできない

**考えられる原因と解決方法：**

1. **CORS 設定が間違っている**
   - R2 の CORS 設定を確認
   - `AllowedOrigins` にアプリの URL が含まれているか確認

2. **R2 認証情報が間違っている**
   ```bash
   # Secrets を再設定
   wrangler secret put R2_ACCESS_KEY_ID
   wrangler secret put R2_SECRET_ACCESS_KEY
   ```

3. **パブリックアクセスが無効**
   - R2 Dashboard で「Allow Access」が有効か確認

#### エラー: ログイン後にリダイレクトされない

**原因：** Supabase の Redirect URLs 設定が間違っている

**解決方法：**
1. Supabase Dashboard → Authentication → URL Configuration
2. Redirect URLs に正しい URL が設定されているか確認
3. 末尾のスラッシュに注意（`/auth/callback` で終わる）

#### エラー: データベース接続エラー

**考えられる原因と解決方法：**

1. **接続文字列が間違っている**
   - Transaction モード（port 6543）を使用しているか確認
   - パスワードに特殊文字が含まれる場合は URL エンコードが必要

2. **IP アドレス制限**
   - Supabase Dashboard → Database → Settings → Network
   - IP 制限が有効になっていないか確認

#### エラー: ビルドが失敗する

**解決方法：**
```bash
# node_modules を削除して再インストール
rm -rf node_modules
rm -rf .next
rm -rf .open-next
npm install

# 再度ビルド
npm run build:worker
```

---

## 環境変数一覧（まとめ）

### 公開可能な環境変数（wrangler.toml の [vars] に記載）

| 変数名 | 説明 | 例 |
|-------|------|-----|
| `NEXT_PUBLIC_SITE_URL` | アプリの URL | `https://beer-link.example.com` |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | R2 の公開 URL | `https://pub-xxx.r2.dev` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase の URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase の公開キー | `eyJ...` |

### 秘密情報（wrangler secret で設定）

| 変数名 | 説明 | 取得場所 |
|-------|------|---------|
| `DATABASE_URL` | DB接続文字列 | Supabase Dashboard → Database |
| `SUPABASE_SERVICE_ROLE_KEY` | サービスキー | Supabase Dashboard → API |
| `CLOUDFLARE_ACCOUNT_ID` | アカウントID | `wrangler whoami` |
| `R2_ACCESS_KEY_ID` | R2 アクセスキー | Cloudflare → API Tokens |
| `R2_SECRET_ACCESS_KEY` | R2 シークレット | Cloudflare → API Tokens |
| `R2_BUCKET_NAME` | バケット名 | 自分で決めた名前 |
| `RESEND_API_KEY` | メール送信キー | Resend Dashboard |

---

## デプロイ完了チェックリスト

### ステージング環境

- [ ] Cloudflare アカウント作成・ログイン完了
- [ ] R2 バケット作成完了
- [ ] R2 パブリックアクセス有効化
- [ ] R2 CORS 設定完了
- [ ] R2 API トークン作成完了
- [ ] Supabase プロジェクト作成完了
- [ ] データベースマイグレーション完了
- [ ] Supabase 認証 URL 設定完了
- [ ] Resend API キー取得完了
- [ ] wrangler.toml 作成完了
- [ ] open-next.config.ts 作成完了
- [ ] すべての Secrets 設定完了
- [ ] デプロイ成功
- [ ] 動作確認完了

### 本番環境

- [ ] 本番用 R2 バケット作成完了
- [ ] 本番用 Supabase プロジェクト作成完了
- [ ] 本番用マイグレーション完了
- [ ] 本番用認証 URL 設定完了
- [ ] wrangler.toml に本番設定追加
- [ ] 本番用 Secrets 設定完了
- [ ] カスタムドメイン設定完了（オプション）
- [ ] SSL 証明書発行完了
- [ ] デプロイ成功
- [ ] 動作確認完了

---

## 参考リンク

- [Cloudflare Workers ドキュメント](https://developers.cloudflare.com/workers/)
- [Cloudflare R2 ドキュメント](https://developers.cloudflare.com/r2/)
- [Supabase ドキュメント](https://supabase.com/docs)
- [Resend ドキュメント](https://resend.com/docs)
- [OpenNext Cloudflare](https://opennext.js.org/cloudflare)
