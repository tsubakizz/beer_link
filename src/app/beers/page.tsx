import { db } from "@/lib/db";
import { beers, breweries, beerStyles } from "@/lib/db/schema";
import { eq, and, ilike, or } from "drizzle-orm";
import { BeerCard } from "@/components/beer";
import { BeerFilter } from "@/components/beer/BeerFilter";
import Link from "next/link";

export const metadata = {
  title: "ビール一覧 | beer_link",
  description:
    "クラフトビールを探索。ビアスタイル、ブルワリーで絞り込んでお気に入りのビールを見つけよう。",
};

// ビルド時にDBに接続できないため動的レンダリング
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{
    q?: string;
    style?: string;
    brewery?: string;
  }>;
}

export default async function BeersPage({ searchParams }: Props) {
  const params = await searchParams;
  const { q, style, brewery } = params;

  // 検索条件を構築（未確認・確認済みの両方を表示）
  const conditions = [or(eq(beers.status, "approved"), eq(beers.status, "pending"))!];

  if (q) {
    conditions.push(
      or(ilike(beers.name, `%${q}%`), ilike(beers.description, `%${q}%`))!
    );
  }

  if (style) {
    const styleId = parseInt(style, 10);
    if (!isNaN(styleId)) {
      conditions.push(eq(beers.styleId, styleId));
    }
  }

  if (brewery) {
    const breweryId = parseInt(brewery, 10);
    if (!isNaN(breweryId)) {
      conditions.push(eq(beers.breweryId, breweryId));
    }
  }

  // ビール一覧を取得
  const beerList = await db
    .select({
      id: beers.id,
      name: beers.name,
      description: beers.description,
      abv: beers.abv,
      ibu: beers.ibu,
      imageUrl: beers.imageUrl,
      brewery: {
        id: breweries.id,
        name: breweries.name,
      },
      style: {
        id: beerStyles.id,
        name: beerStyles.name,
        slug: beerStyles.slug,
      },
    })
    .from(beers)
    .leftJoin(breweries, eq(beers.breweryId, breweries.id))
    .leftJoin(beerStyles, eq(beers.styleId, beerStyles.id))
    .where(and(...conditions))
    .orderBy(beers.name);

  // フィルター用のスタイルとブルワリー一覧を取得
  const [styleOptions, breweryOptions] = await Promise.all([
    db
      .select({ id: beerStyles.id, name: beerStyles.name })
      .from(beerStyles)
      .where(eq(beerStyles.status, "approved"))
      .orderBy(beerStyles.name),
    db
      .select({ id: breweries.id, name: breweries.name })
      .from(breweries)
      .where(eq(breweries.status, "approved"))
      .orderBy(breweries.name),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダーセクション */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">ビール一覧</h1>
        <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
          様々なクラフトビールを探索しよう。
          スタイルやブルワリーで絞り込んで、あなたの好みのビールを見つけてください。
        </p>
      </div>

      {/* フィルター */}
      <BeerFilter
        styles={styleOptions}
        breweries={breweryOptions}
        currentQuery={q}
        currentStyle={style}
        currentBrewery={brewery}
      />

      {/* ビール数表示 & 追加ボタン */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="badge badge-lg badge-primary">
            {beerList.length} ビール
          </span>
          {(q || style || brewery) && (
            <span className="text-sm text-base-content/60">
              フィルター適用中
            </span>
          )}
        </div>
        <Link href="/submit/beer" className="btn btn-primary btn-sm">
          + ビールを追加
        </Link>
      </div>

      {/* ビール一覧 */}
      {beerList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {beerList.map((beer) => (
            <BeerCard key={beer.id} beer={beer} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🍺</div>
          <p className="text-lg text-base-content/60">
            {q || style || brewery
              ? "条件に合うビールが見つかりませんでした"
              : "ビールがまだ登録されていません"}
          </p>
        </div>
      )}
    </div>
  );
}
