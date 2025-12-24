#!/bin/bash

# ブルワリー説明文の出力ファイルをパースしてCSVを生成する

OUTPUT_DIR="./output/brewery-descriptions"
CSV_FILE="$OUTPUT_DIR/breweries.csv"

# CSVヘッダー作成
echo 'id,name,description_long,description_short,logo_url,sources' > "$CSV_FILE"

# 各ブルワリーファイルを処理
for id in $(seq 1 66); do
  FILE="$OUTPUT_DIR/brewery_${id}.txt"

  if [ -f "$FILE" ]; then
    # 各フィールドを抽出
    BREWERY_ID=$(grep -m1 "^BREWERY_ID:" "$FILE" | sed 's/^BREWERY_ID: *//')
    BREWERY_NAME=$(grep -m1 "^BREWERY_NAME:" "$FILE" | sed 's/^BREWERY_NAME: *//')
    DESC_LONG=$(grep -m1 "^DESCRIPTION_LONG:" "$FILE" | sed 's/^DESCRIPTION_LONG: *//')
    DESC_SHORT=$(grep -m1 "^DESCRIPTION_SHORT:" "$FILE" | sed 's/^DESCRIPTION_SHORT: *//')
    LOGO_URL=$(grep -m1 "^LOGO_URL:" "$FILE" | sed 's/^LOGO_URL: *//')
    SOURCES=$(grep -m1 "^SOURCES:" "$FILE" | sed 's/^SOURCES: *//')

    # CSVエスケープ（ダブルクォートをエスケープ）
    BREWERY_NAME=$(echo "$BREWERY_NAME" | sed 's/"/""/g')
    DESC_LONG=$(echo "$DESC_LONG" | sed 's/"/""/g')
    DESC_SHORT=$(echo "$DESC_SHORT" | sed 's/"/""/g')
    SOURCES=$(echo "$SOURCES" | sed 's/"/""/g')

    # IDが取得できた場合のみ出力
    if [ -n "$BREWERY_ID" ]; then
      echo "${BREWERY_ID},\"${BREWERY_NAME}\",\"${DESC_LONG}\",\"${DESC_SHORT}\",\"${LOGO_URL}\",\"${SOURCES}\"" >> "$CSV_FILE"
      echo "Processed: ID $BREWERY_ID - $BREWERY_NAME"
    else
      echo "Warning: Could not parse brewery_${id}.txt"
    fi
  else
    echo "Warning: File not found - $FILE"
  fi
done

echo ""
echo "CSV generated: $CSV_FILE"
echo "Total rows: $(wc -l < "$CSV_FILE")"
