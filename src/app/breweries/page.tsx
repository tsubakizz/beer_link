import { db } from "@/lib/db";
import { breweries, prefectures, beers } from "@/lib/db/schema";
import { eq, sql, count } from "drizzle-orm";
import { BreweryCard } from "@/components/beer";

export const metadata = {
  title: "ブルワリー一覧 | beer_link",
  description:
    "日本全国のクラフトビール醸造所を探索。各ブルワリーの特徴やビールラインナップをチェック。",
};

// ビルド時にDBに接続できないため動的レンダリング
export const dynamic = "force-dynamic";

export default async function BreweriesPage() {
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
    .where(eq(breweries.status, "approved"))
    .groupBy(breweries.id, prefectures.id, prefectures.name)
    .orderBy(breweries.name);

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

      {/* ブルワリー数表示 */}
      <div className="mb-6">
        <span className="badge badge-lg badge-secondary">
          {breweryList.length} ブルワリー
        </span>
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
            ブルワリーがまだ登録されていません
          </p>
        </div>
      )}
    </div>
  );
}
