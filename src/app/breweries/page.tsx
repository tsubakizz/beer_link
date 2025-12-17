import { db } from "@/lib/db";
import { breweries, prefectures, beers } from "@/lib/db/schema";
import { eq, count, and, ilike, or } from "drizzle-orm";
import { BreweryCard, BreweryFilter } from "@/components/beer";
import { Pagination, ITEMS_PER_PAGE } from "@/components/ui/Pagination";

export const metadata = {
  title: "ブルワリー一覧 | beer_link",
  description:
    "日本全国のクラフトビール醸造所を探索。各ブルワリーの特徴やビールラインナップをチェック。",
};

// ビルド時にDBに接続できないため動的レンダリング
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{
    q?: string;
    prefecture?: string;
    page?: string;
  }>;
}

export default async function BreweriesPage({ searchParams }: Props) {
  const params = await searchParams;
  const { q, prefecture } = params;

  // ページ番号を取得（デフォルト: 1）
  const currentPage = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // 検索条件を構築
  const conditions = [eq(breweries.status, "approved")];

  if (q) {
    conditions.push(
      or(ilike(breweries.name, `%${q}%`), ilike(breweries.description, `%${q}%`))!
    );
  }

  if (prefecture) {
    const prefectureId = parseInt(prefecture, 10);
    if (!isNaN(prefectureId)) {
      conditions.push(eq(breweries.prefectureId, prefectureId));
    }
  }

  // 総件数を取得
  const [{ totalCount }] = await db
    .select({ totalCount: count() })
    .from(breweries)
    .where(and(...conditions));

  // ブルワリー一覧を都道府県と製造ビール数と一緒に取得
  const breweryList = await db
    .select({
      id: breweries.id,
      name: breweries.name,
      description: breweries.description,
      imageUrl: breweries.imageUrl,
      address: breweries.address,
      prefecture: {
        id: prefectures.id,
        name: prefectures.name,
      },
      beerCount: count(beers.id),
    })
    .from(breweries)
    .leftJoin(prefectures, eq(breweries.prefectureId, prefectures.id))
    .leftJoin(beers, eq(beers.breweryId, breweries.id))
    .where(and(...conditions))
    .groupBy(breweries.id, prefectures.id, prefectures.name)
    .orderBy(breweries.name)
    .limit(ITEMS_PER_PAGE)
    .offset(offset);

  // フィルター用の都道府県一覧を取得
  const prefectureOptions = await db
    .select({ id: prefectures.id, name: prefectures.name })
    .from(prefectures)
    .orderBy(prefectures.id);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダーセクション */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">ブルワリー一覧</h1>
        <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
          日本全国のクラフトビール醸造所を紹介。
          各ブルワリーの特徴や製造しているビールを探索してみましょう。
        </p>
      </div>

      {/* フィルター */}
      <BreweryFilter
        prefectures={prefectureOptions}
        currentQuery={q}
        currentPrefecture={prefecture}
      />

      {/* ブルワリー数表示 */}
      <div className="mb-6 flex items-center gap-4">
        <span className="badge badge-lg badge-secondary">
          全{totalCount}件
        </span>
        {(q || prefecture) && (
          <span className="text-sm text-base-content/60">
            フィルター適用中
          </span>
        )}
      </div>

      {/* ブルワリー一覧 */}
      {breweryList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {breweryList.map((brewery) => (
            <BreweryCard key={brewery.id} brewery={brewery} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🏭</div>
          <p className="text-lg text-base-content/60">
            {q || prefecture
              ? "条件に合うブルワリーが見つかりませんでした"
              : "ブルワリーがまだ登録されていません"}
          </p>
        </div>
      )}

      {/* ページネーション */}
      <Pagination
        currentPage={currentPage}
        totalCount={totalCount}
        basePath="/breweries"
        searchParams={{ q, prefecture }}
      />
    </div>
  );
}
