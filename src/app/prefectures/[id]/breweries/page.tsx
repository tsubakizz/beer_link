import { db } from "@/lib/db";
import { breweries, prefectures, beers } from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BreweryCard, BreweryFilter } from "@/components/beer";
import { Pagination, ITEMS_PER_PAGE } from "@/components/ui/Pagination";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const prefectureId = parseInt(id, 10);

  if (isNaN(prefectureId)) {
    return { title: "都道府県が見つかりません | beer_link" };
  }

  const prefecture = await db
    .select({ name: prefectures.name })
    .from(prefectures)
    .where(eq(prefectures.id, prefectureId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!prefecture) {
    return { title: "都道府県が見つかりません | beer_link" };
  }

  const title = `${prefecture.name}のブルワリー一覧 | beer_link`;
  const description = `${prefecture.name}のクラフトビール醸造所一覧。beer_linkで${prefecture.name}のブルワリーを探そう。`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function PrefectureBreweriesPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { page } = await searchParams;
  const prefectureId = parseInt(id, 10);

  if (isNaN(prefectureId)) {
    notFound();
  }

  // 都道府県情報を取得
  const prefecture = await db
    .select({ id: prefectures.id, name: prefectures.name })
    .from(prefectures)
    .where(eq(prefectures.id, prefectureId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!prefecture) {
    notFound();
  }

  // ページネーション
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // 検索条件
  const conditions = [
    eq(breweries.status, "approved"),
    eq(breweries.prefectureId, prefectureId),
  ];

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
      {/* パンくずリスト */}
      <div className="breadcrumbs text-sm mb-6">
        <ul>
          <li>
            <Link href="/">ホーム</Link>
          </li>
          <li>
            <Link href="/breweries">ブルワリー</Link>
          </li>
          <li>{prefecture.name}</li>
        </ul>
      </div>

      {/* ヘッダーセクション */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">
          {prefecture.name}のブルワリー一覧
        </h1>
        <p className="text-lg text-base-content/70 max-w-2xl mx-auto mb-4">
          {prefecture.name}のクラフトビール醸造所を探索しよう。
        </p>
        <Link
          href={`/prefectures/${prefecture.id}/beers`}
          className="btn btn-outline btn-sm"
        >
          {prefecture.name}のビール一覧 →
        </Link>
      </div>

      {/* フィルター */}
      <BreweryFilter
        prefectures={prefectureOptions}
        currentPrefecture={String(prefectureId)}
      />

      {/* ブルワリー数表示 */}
      <div className="mb-6 flex items-center gap-4">
        <span className="badge badge-lg badge-secondary">
          全{totalCount}件
        </span>
        <span className="text-sm text-base-content/60">
          都道府県で絞り込み中
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
            {prefecture.name}のブルワリーはまだ登録されていません
          </p>
        </div>
      )}

      {/* ページネーション */}
      <Pagination
        currentPage={currentPage}
        totalCount={totalCount}
        basePath={`/prefectures/${prefecture.id}/breweries`}
      />
    </div>
  );
}
