import { db } from "@/lib/db";
import { beerStyles } from "@/lib/db/schema";
import { eq, and, gte, lte, type SQL, type Column } from "drizzle-orm";
import { StyleCard } from "@/components/beer";
import { StyleFilter } from "@/components/beer/StyleFilter";
import type { Metadata } from "next";

// ビルド時にDBに接続できないため動的レンダリング
export const dynamic = "force-dynamic";

// 味の強さラベル
const FLAVOR_LABELS: Record<number, string> = {
  1: "弱め",
  2: "やや弱め",
  3: "普通",
  4: "やや強め",
  5: "強め",
};

const FLAVOR_NAMES: Record<string, string> = {
  bitterness: "苦味",
  sweetness: "甘味",
  body: "ボディ",
  aroma: "香り",
  sourness: "酸味",
};

interface Props {
  searchParams: Promise<{
    q?: string;
    bitterness_min?: string;
    bitterness_max?: string;
    sweetness_min?: string;
    sweetness_max?: string;
    body_min?: string;
    body_max?: string;
    aroma_min?: string;
    aroma_max?: string;
    sourness_min?: string;
    sourness_max?: string;
  }>;
}

function getRangeDescription(min?: string, max?: string): string | null {
  const minVal = min ? parseInt(min, 10) : null;
  const maxVal = max ? parseInt(max, 10) : null;

  if (!minVal && !maxVal) return null;

  if (minVal && maxVal) {
    if (minVal === maxVal) {
      return FLAVOR_LABELS[minVal];
    }
    return `${FLAVOR_LABELS[minVal]}〜${FLAVOR_LABELS[maxVal]}`;
  }
  if (minVal) {
    return `${FLAVOR_LABELS[minVal]}以上`;
  }
  if (maxVal) {
    return `${FLAVOR_LABELS[maxVal]}以下`;
  }
  return null;
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const params = await searchParams;
  const filterDescriptions: string[] = [];

  const flavorKeys = ["bitterness", "sweetness", "body", "aroma", "sourness"];
  for (const key of flavorKeys) {
    const min = params[`${key}_min` as keyof typeof params];
    const max = params[`${key}_max` as keyof typeof params];
    const desc = getRangeDescription(min, max);
    if (desc) {
      filterDescriptions.push(`${FLAVOR_NAMES[key]}が${desc}`);
    }
  }

  if (params.q) {
    filterDescriptions.push(`「${params.q}」を含む`);
  }

  if (filterDescriptions.length > 0) {
    const title = `${filterDescriptions.join("・")}のビアスタイル一覧 | beer_link`;
    return {
      title,
      description: `${filterDescriptions.join("、")}のビアスタイルを探索`,
    };
  }

  return {
    title: "ビアスタイル一覧 | beer_link",
    description:
      "世界中のビアスタイルを探索しよう。IPA、スタウト、ピルスナーなど、様々なビールの種類と特徴を解説。",
  };
}

export default async function StylesPage({ searchParams }: Props) {
  const params = await searchParams;
  const { q } = params;

  // 検索条件を構築
  const conditions: SQL[] = [eq(beerStyles.status, "approved")];

  // 範囲フィルター用のヘルパー
  const addRangeCondition = (
    column: Column,
    minParam?: string,
    maxParam?: string
  ) => {
    const min = minParam ? parseInt(minParam, 10) : null;
    const max = maxParam ? parseInt(maxParam, 10) : null;
    if (min && min >= 1 && min <= 5) {
      conditions.push(gte(column, min));
    }
    if (max && max >= 1 && max <= 5) {
      conditions.push(lte(column, max));
    }
  };

  addRangeCondition(
    beerStyles.bitterness,
    params.bitterness_min,
    params.bitterness_max
  );
  addRangeCondition(
    beerStyles.sweetness,
    params.sweetness_min,
    params.sweetness_max
  );
  addRangeCondition(beerStyles.body, params.body_min, params.body_max);
  addRangeCondition(beerStyles.aroma, params.aroma_min, params.aroma_max);
  addRangeCondition(
    beerStyles.sourness,
    params.sourness_min,
    params.sourness_max
  );

  // スタイル一覧を取得
  const styles = await db
    .select()
    .from(beerStyles)
    .where(and(...conditions))
    .orderBy(beerStyles.name);

  // 名前でフィルタリング
  const filteredStyles = q
    ? styles.filter(
        (s) =>
          s.name.toLowerCase().includes(q.toLowerCase()) ||
          s.description?.toLowerCase().includes(q.toLowerCase())
      )
    : styles;

  // ページタイトルを生成
  const filterDescriptions: string[] = [];
  const flavorKeys = ["bitterness", "sweetness", "body", "aroma", "sourness"];
  for (const key of flavorKeys) {
    const min = params[`${key}_min` as keyof typeof params];
    const max = params[`${key}_max` as keyof typeof params];
    const desc = getRangeDescription(min, max);
    if (desc) {
      filterDescriptions.push(`${FLAVOR_NAMES[key]}が${desc}`);
    }
  }
  if (q) {
    filterDescriptions.push(`「${q}」を含む`);
  }

  const hasFilters = filterDescriptions.length > 0;
  const pageTitle = hasFilters
    ? `${filterDescriptions.join("・")}のビアスタイル一覧`
    : "ビアスタイル一覧";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダーセクション */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">{pageTitle}</h1>
        {!hasFilters && (
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            世界中には100種類以上のビアスタイルが存在します。
            それぞれのスタイルが持つ独自の歴史、味の特徴、
            そして楽しみ方を探索してみましょう。
          </p>
        )}
      </div>

      {/* フィルター */}
      <StyleFilter
        currentQuery={q}
        currentBitternessMin={params.bitterness_min}
        currentBitternessMax={params.bitterness_max}
        currentSweetnessMin={params.sweetness_min}
        currentSweetnessMax={params.sweetness_max}
        currentBodyMin={params.body_min}
        currentBodyMax={params.body_max}
        currentAromaMin={params.aroma_min}
        currentAromaMax={params.aroma_max}
        currentSournessMin={params.sourness_min}
        currentSournessMax={params.sourness_max}
      />

      {/* スタイル数表示 */}
      <div className="mb-6 flex items-center gap-4">
        <span className="badge badge-lg badge-primary">
          {filteredStyles.length} スタイル
        </span>
        {hasFilters && (
          <span className="text-sm text-base-content/60">フィルター適用中</span>
        )}
      </div>

      {/* スタイル一覧 */}
      {filteredStyles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStyles.map((style) => (
            <StyleCard key={style.id} style={style} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🍺</div>
          <p className="text-lg text-base-content/60">
            {hasFilters
              ? "条件に合うビアスタイルが見つかりませんでした"
              : "ビアスタイルがまだ登録されていません"}
          </p>
        </div>
      )}
    </div>
  );
}
