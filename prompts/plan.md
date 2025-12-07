# クラフトビールファンサイト「beer_link」開発

## プロジェクト概要

クラフトビールのファンサイトを開発してください。ビール愛好家向けの情報サイトで、ビール・ブルワリー・ビアスタイルの図鑑機能と、ユーザーによる口コミ投稿機能を備えます。

### サイトの主要機能

1. **図鑑機能**
   - ビール図鑑：ビール情報の一覧・詳細表示、検索・フィルタリング
   - ブルワリー図鑑：醸造所の一覧・詳細表示
   - ビアスタイル図鑑：ビールスタイルの一覧・詳細表示

2. **ユーザー機能**
   - ユーザー登録・ログイン
   - ビールの口コミ投稿（写真アップロード、味の評価）
   - お気に入り登録

3. **追加申請機能**
   - サイトに載っていないビールの追加申請（ビール名、ビアスタイル、ブルワリーを入力）
   - ビアスタイルの追加申請

4. **管理機能**
   - 管理者用ダッシュボード
   - ビール・ブルワリー・ビアスタイルの追加申請の承認/却下

5. **初心者向けコンテンツ**
   - ビールの基礎知識ページ
   - ビアスタイルの選び方ガイド

---

## 技術仕様

### 技術スタック

| 領域 | 技術 |
|------|------|
| フロントエンド | Next.js (App Router) + React + TypeScript |
| バックエンド | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| ORM | Drizzle ORM |
| サーバー | Cloudflare Workers / Pages |
| CSS | Tailwind CSS + DaisyUI |

### Supabase 設定

- **Database**: PostgreSQL（メインDB）
- **Auth**: Supabase Auth（メール/パスワード、Google OAuth）
- **Storage**: 画像アップロード用（ビール写真、レビュー画像）
- **Row Level Security (RLS)**: 有効化必須

---

## データベース設計

### テーブル一覧

以下のテーブルを Drizzle ORM で定義してください。

#### 1. users（ユーザー）

```typescript
{
  id: uuid (PK, default: auth.uid()),
  email: text (NOT NULL, UNIQUE),
  displayName: text,
  bio: text,
  profileImageUrl: text,
  role: text (default: 'user'), // 'user' | 'admin'
  createdAt: timestamp (default: now()),
  updatedAt: timestamp (default: now())
}
```

#### 2. beer_styles（ビアスタイル）

```typescript
{
  id: serial (PK),
  slug: text (NOT NULL, UNIQUE), // URL用スラッグ
  name: text (NOT NULL), // 日本語名
  description: text,
  bitterness: integer (1-5), // 苦味
  sweetness: integer (1-5), // 甘味
  body: integer (1-5), // ボディ感
  aroma: integer (1-5), // 香り
  sourness: integer (1-5), // 酸味
  history: text, // 歴史・起源
  origin: text, // 発祥地
  abvMin: decimal, // ABV下限
  abvMax: decimal, // ABV上限
  ibuMin: integer, // IBU下限
  ibuMax: integer, // IBU上限
  srmMin: integer, // SRM色下限
  srmMax: integer, // SRM色上限
  servingTempMin: integer, // 提供温度下限
  servingTempMax: integer, // 提供温度上限
  status: text (default: 'approved'), // 'pending' | 'approved' | 'rejected'
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 3. breweries（ブルワリー）

```typescript
{
  id: serial (PK),
  name: text (NOT NULL),
  description: text,
  prefectureId: integer (FK -> prefectures.id),
  address: text,
  websiteUrl: text,
  imageUrl: text,
  status: text (default: 'approved'), // 'pending' | 'approved' | 'rejected'
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 4. beers（ビール）

```typescript
{
  id: serial (PK),
  name: text (NOT NULL),
  description: text,
  breweryId: integer (FK -> breweries.id, NOT NULL),
  styleId: integer (FK -> beer_styles.id, NOT NULL),
  abv: decimal, // アルコール度数
  ibu: integer, // IBU
  imageUrl: text,
  status: text (default: 'approved'), // 'pending' | 'approved' | 'rejected'
  submittedBy: uuid (FK -> users.id), // 申請者（申請の場合）
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 5. reviews（レビュー・口コミ）

```typescript
{
  id: serial (PK),
  userId: uuid (FK -> users.id, NOT NULL),
  beerId: integer (FK -> beers.id, NOT NULL),
  rating: integer (1-5, NOT NULL), // 総合評価
  bitterness: integer (1-5), // 苦味評価
  sweetness: integer (1-5), // 甘味評価
  body: integer (1-5), // ボディ感評価
  aroma: integer (1-5), // 香り評価
  sourness: integer (1-5), // 酸味評価
  comment: text, // テキスト評価
  imageUrl: text, // レビュー画像
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 6. beer_favorites（お気に入り）

```typescript
{
  id: serial (PK),
  userId: uuid (FK -> users.id, NOT NULL),
  beerId: integer (FK -> beers.id, NOT NULL),
  createdAt: timestamp,
  UNIQUE(userId, beerId)
}
```

#### 7. prefectures（都道府県マスタ）

```typescript
{
  id: serial (PK),
  name: text (NOT NULL, UNIQUE), // 北海道〜沖縄県
  createdAt: timestamp
}
```

#### 8. beer_style_requests（ビアスタイル追加申請）

```typescript
{
  id: serial (PK),
  name: text (NOT NULL),
  description: text,
  submittedBy: uuid (FK -> users.id, NOT NULL),
  status: text (default: 'pending'), // 'pending' | 'approved' | 'rejected'
  adminNote: text, // 管理者コメント
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Row Level Security (RLS) ポリシー

各テーブルに適切な RLS ポリシーを設定：

- `users`: 自分のデータのみ更新可能、閲覧は全員可
- `reviews`: 自分のレビューのみ作成・更新・削除可能
- `beer_favorites`: 自分のお気に入りのみ操作可能
- `beers`, `breweries`, `beer_styles`: 閲覧は全員可、作成は認証ユーザー（申請として）、更新・承認は admin のみ

---

## ページ構成

### 公開ページ

```
/ - トップページ（ヒーロー、特徴紹介、人気ビール）
/beers - ビール一覧（検索・フィルター機能）
/beers/[id] - ビール詳細（レビュー一覧含む）
/breweries - ブルワリー一覧
/breweries/[id] - ブルワリー詳細（製造ビール一覧）
/styles - ビアスタイル一覧
/styles/[slug] - ビアスタイル詳細（該当ビール一覧）
/guides - 初心者ガイド一覧
/guides/beginners - ビール入門
/guides/tasting - テイスティングガイド
```

### 認証ページ

```
/login - ログイン
/register - 新規登録
/mypage - マイページ（レビュー履歴、お気に入り）
```

### 申請ページ（要認証）

```
/submit/beer - ビール追加申請フォーム
/submit/style - ビアスタイル追加申請フォーム
```

### 管理者ページ（要admin権限）

```
/admin - 管理ダッシュボード
/admin/requests - 申請一覧・承認管理
/admin/beers - ビール管理
/admin/breweries - ブルワリー管理
/admin/styles - スタイル管理
```

---

## コンポーネント設計

### 共通コンポーネント

- `Navigation` - ヘッダーナビゲーション
- `Footer` - フッター
- `LoadingSpinner` - ローディング表示
- `AuthGuard` - 認証ガード

### ビール関連

- `BeerCard` - ビール一覧用カード
- `BeerDetail` - ビール詳細表示
- `BeerFilter` - 検索・フィルターUI
- `FlavorProfile` - 味の特性レーダーチャート

### レビュー関連

- `ReviewForm` - レビュー投稿フォーム（画像アップロード、味評価スライダー）
- `ReviewCard` - レビュー表示カード
- `ReviewList` - レビュー一覧

### 申請関連

- `BeerSubmitForm` - ビール追加申請フォーム
- `StyleSubmitForm` - スタイル追加申請フォーム

### 管理者関連

- `RequestTable` - 申請一覧テーブル
- `ApprovalModal` - 承認/却下モーダル

---

## 実装の優先順位

### Phase 1: 基盤構築

1. Next.js プロジェクトセットアップ（App Router）
2. Supabase プロジェクト作成・接続
3. Drizzle ORM 設定・スキーマ定義
4. Tailwind CSS + DaisyUI 設定
5. 基本レイアウト（Navigation, Footer）

### Phase 2: 図鑑機能

1. ビアスタイル一覧・詳細ページ
2. ブルワリー一覧・詳細ページ
3. ビール一覧・詳細ページ
4. 検索・フィルター機能

### Phase 3: ユーザー機能

1. Supabase Auth 認証（登録・ログイン）
2. マイページ
3. レビュー投稿機能（味評価、画像アップロード）
4. お気に入り機能

### Phase 4: 申請・管理機能

1. ビール追加申請
2. ビアスタイル追加申請
3. 管理者ダッシュボード
4. 申請承認/却下機能

### Phase 5: コンテンツ・仕上げ

1. 初心者向けガイドページ
2. SEO対策（メタデータ、OGP）
3. レスポンシブ対応調整
4. パフォーマンス最適化

---

## デザイン指針

### カラースキーマ

DaisyUI のカスタムテーマを使用：

- プライマリ: 明るい黄色（ピルスナービールの色）
- 背景: クリーム系
- アクセント: ゴールド

### UI/UX

- モバイルファースト設計
- ビールの写真を大きく見せる
- 味の特性はレーダーチャートで視覚化
- スムーズなアニメーション（必要に応じて Framer Motion）

---

## 環境変数

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Optional
NEXT_PUBLIC_SITE_URL=
```

---

## 注意事項

- TypeScript の strict モードを有効に
- Server Components と Client Components を適切に分離
- Supabase の RLS を必ず設定（セキュリティ）
- 画像は Supabase Storage にアップロード、URL を DB に保存
- 申請データは `status` カラムで管理（pending → approved/rejected）
