import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";
import { prefectures } from "./schema/prefectures";
import { beerStyles } from "./schema/beer-styles";
import { beerStyleRelations } from "./schema/beer-style-relations";

// 環境変数 ENV_FILE で .env ファイルを切り替え可能
// 例: ENV_FILE=.env.production.local npx tsx src/lib/db/seed.ts
const envFile = process.env.ENV_FILE || ".env.local";
config({ path: envFile, override: true });

// 環境変数からDATABASE_URLを取得
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client);

// 都道府県データ
const prefectureNames = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
];

// CSVパーサー（シンプルな実装）
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split("\n");
  // BOMを除去
  const headerLine = lines[0].replace(/^\uFEFF/, "");
  const headers = headerLine.split(",");

  const rows: Record<string, string>[] = [];
  let currentRow: string[] = [];
  let inQuote = false;
  let currentField = "";

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];

      if (char === '"' && !inQuote) {
        inQuote = true;
      } else if (char === '"' && inQuote) {
        if (line[j + 1] === '"') {
          currentField += '"';
          j++;
        } else {
          inQuote = false;
        }
      } else if (char === "," && !inQuote) {
        currentRow.push(currentField);
        currentField = "";
      } else {
        currentField += char;
      }
    }

    if (!inQuote) {
      currentRow.push(currentField);
      currentField = "";

      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header.trim()] = currentRow[index]?.trim() || "";
      });
      rows.push(row);
      currentRow = [];
    } else {
      currentField += "\n";
    }
  }

  return rows;
}

async function seed() {
  console.log("🌱 Seeding database...");

  // 1. 都道府県データを投入
  console.log("📍 Inserting prefectures...");
  await db.insert(prefectures).values(
    prefectureNames.map((name) => ({ name }))
  ).onConflictDoNothing();
  console.log(`✅ Inserted ${prefectureNames.length} prefectures`);

  // 2. ビアスタイルCSVを読み込み
  console.log("🍺 Loading beer styles from CSV...");
  const csvPath = path.join(process.cwd(), "seeds", "beer-styles.csv");
  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const styleRows = parseCSV(csvContent);
  console.log(`📄 Found ${styleRows.length} beer styles in CSV`);

  // 3. ビアスタイルデータを投入
  console.log("🍺 Inserting beer styles...");
  const styleValues = styleRows.map((row) => ({
    slug: row.slug || "",
    name: row.name || "",
    description: row.description || null,
    bitterness: row.bitterness ? parseInt(row.bitterness) : null,
    sweetness: row.sweetness ? parseInt(row.sweetness) : null,
    body: row.body ? parseInt(row.body) : null,
    aroma: row.aroma ? parseInt(row.aroma) : null,
    sourness: row.sourness ? parseInt(row.sourness) : null,
    history: row.history || null,
    origin: row.origin || null,
    abvMin: row.abv_min || null,
    abvMax: row.abv_max || null,
    ibuMin: row.ibu_min ? parseInt(row.ibu_min) : null,
    ibuMax: row.ibu_max ? parseInt(row.ibu_max) : null,
    srmMin: row.srm_min ? parseInt(row.srm_min) : null,
    srmMax: row.srm_max ? parseInt(row.srm_max) : null,
    servingTempMin: row.serving_temp_min ? parseInt(row.serving_temp_min) : null,
    servingTempMax: row.serving_temp_max ? parseInt(row.serving_temp_max) : null,
    status: "approved" as const,
  }));

  // バッチ挿入（100件ずつ）
  const batchSize = 100;
  for (let i = 0; i < styleValues.length; i += batchSize) {
    const batch = styleValues.slice(i, i + batchSize);
    await db.insert(beerStyles).values(batch).onConflictDoNothing();
    console.log(`  Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(styleValues.length / batchSize)}`);
  }
  console.log(`✅ Inserted ${styleValues.length} beer styles`);

  // 4. ビアスタイル関連CSVを読み込み
  console.log("🔗 Loading beer style relations from CSV...");
  const relationsPath = path.join(process.cwd(), "seeds", "beer-style-relations.csv");
  const relationsContent = fs.readFileSync(relationsPath, "utf-8");
  const relationRows = parseCSV(relationsContent);
  console.log(`📄 Found ${relationRows.length} beer style relations in CSV`);

  // 5. ビアスタイル関連データを投入
  console.log("🔗 Inserting beer style relations...");
  const relationValues = relationRows.map((row) => ({
    styleId: parseInt(row.style_id),
    relatedStyleId: parseInt(row.related_style_id),
    relationType: parseInt(row.relation_type),
  }));

  // バッチ挿入（100件ずつ）
  for (let i = 0; i < relationValues.length; i += batchSize) {
    const batch = relationValues.slice(i, i + batchSize);
    await db.insert(beerStyleRelations).values(batch).onConflictDoNothing();
    console.log(`  Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(relationValues.length / batchSize)}`);
  }
  console.log(`✅ Inserted ${relationValues.length} beer style relations`);

  console.log("🎉 Seeding completed!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
