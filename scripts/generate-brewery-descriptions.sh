#!/bin/bash

# ブルワリー説明文生成スクリプト
# Claude Code CLI を使って各ブルワリーの説明文を順番に生成する

OUTPUT_DIR="./output/brewery-descriptions"
CSV_FILE="$OUTPUT_DIR/breweries.csv"

# 出力ディレクトリ作成
mkdir -p "$OUTPUT_DIR"

# CSVヘッダー作成
echo "id,name,address,description_long,description_short,logo_url,sources" > "$CSV_FILE"

# ブルワリーID 1-66 を順番に処理
for id in $(seq 35 67); do
  echo "=== Processing Brewery ID: $id ==="

  OUTPUT_FILE="$OUTPUT_DIR/brewery_${id}.txt"

  # Claude Code CLI で処理
  claude -p "以下の手順でブルワリーID: ${id} の説明文を生成してください。

## Step 1: 基本情報の取得
WebFetchツールで https://beer-link.com/breweries/${id} にアクセスし、ブルワリー名と「Website:」のURLを取得

## Step 2: Web検索による情報収集
「[ブルワリー名] クラフトビール ブルワリー」でWebSearchを実行し、以下の優先度で情報源を確認:
- 公式サイト
- ビールの縁側（beer-engawa.jp）
- たのしいお酒.jp（tanoshiiosake.jp）
- My CRAFT BEER（mycraftbeers.com）

## Step 3: 情報の収集
各ソースからWebFetchで以下を収集:
1. コンセプト・スローガン（サイトに明記されている場合のみ、原文ママ）
2. ブルワー/創業者の経歴・想い
3. 名前の由来
4. 創業年
5. 住所（醸造所の所在地）
6. 特徴・こだわり
7. 代表銘柄・受賞歴
8. ロゴ画像URL（公式サイトから）

## Step 4: 出力（必ずこの形式で出力すること）
BREWERY_ID: ${id}
BREWERY_NAME: [ブルワリー名]
ADDRESS: [住所、なければ空]
DESCRIPTION_LONG: [400文字以内の説明文]
DESCRIPTION_SHORT: [100文字以内の説明文]
LOGO_URL: [ロゴ画像URL、なければ空]
SOURCES: [情報源URLを箇条書き]

## 制約
- 収集したソースに記載されている情報のみ使用
- 独自の解釈や推測・補足禁止
- カギ括弧（「」）内の引用文は原文ママ維持
- 情報が薄い場合は「[ブルワリー名] インタビュー」「[ブルワリー名] 開業」で追加検索" --output-format text > "$OUTPUT_FILE" 2>&1

  echo "Saved to $OUTPUT_FILE"
  echo ""

  # 少し待機（API制限対策）
  sleep 2
done

echo "=== All breweries processed ==="
echo "Results saved to $OUTPUT_DIR"
