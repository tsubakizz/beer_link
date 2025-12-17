import { db } from "@/lib/db";
import {
  beers,
  breweries,
  beerStyles,
  beerStyleOtherNames,
  prefectures,
} from "@/lib/db/schema";
import { eq, and, or, count } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BeerCard, BeerFilter } from "@/components/beer";
import { Pagination, ITEMS_PER_PAGE } from "@/components/ui/Pagination";
import { AuthRequiredLink } from "@/components/ui/AuthRequiredLink";
import { createClient } from "@/lib/supabase/server";
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

  const title = `${prefecture.name}のビール一覧 | beer_link`;
  const description = `${prefecture.name}のブルワリーが醸造するクラフトビール一覧。beer_linkで${prefecture.name}のビールを探そう。`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function PrefectureBeersPage({ params, searchParams }: Props) {
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

  // 認証状態を取得
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  // ページネーション
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // 検索条件: 都道府県のブルワリーが醸造するビール
  const conditions = [
    or(eq(beers.status, "approved"), eq(beers.status, "pending"))!,
    eq(breweries.prefectureId, prefectureId),
  ];

  // 総件数を取得
  const [{ totalCount }] = await db
    .select({ totalCount: count() })
    .from(beers)
    .leftJoin(breweries, eq(beers.breweryId, breweries.id))
    .where(and(...conditions));

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
    .orderBy(beers.name)
    .limit(ITEMS_PER_PAGE)
    .offset(offset);

  // フィルター用のスタイル、ブルワリー、都道府県一覧を取得
  const [styleList, otherNamesList, breweryOptions, prefectureOptions] =
    await Promise.all([
      db
        .select({ id: beerStyles.id, name: beerStyles.name })
        .from(beerStyles)
        .where(eq(beerStyles.status, "approved"))
        .orderBy(beerStyles.name),
      db
        .select({
          styleId: beerStyleOtherNames.styleId,
          name: beerStyleOtherNames.name,
        })
        .from(beerStyleOtherNames),
      db
        .select({ id: breweries.id, name: breweries.name })
        .from(breweries)
        .where(eq(breweries.status, "approved"))
        .orderBy(breweries.name),
      db
        .select({ id: prefectures.id, name: prefectures.name })
        .from(prefectures)
        .orderBy(prefectures.id),
    ]);

  // スタイルIDごとに別名をグループ化
  const otherNamesByStyleId = otherNamesList.reduce(
    (acc, { styleId, name }) => {
      if (!acc[styleId]) acc[styleId] = [];
      acc[styleId].push(name);
      return acc;
    },
    {} as Record<number, string[]>
  );

  // スタイルリストに別名を追加
  const styleOptions = styleList.map((style) => ({
    ...style,
    otherNames: otherNamesByStyleId[style.id] || [],
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      {/* パンくずリスト */}
      <div className="breadcrumbs text-sm mb-6">
        <ul>
          <li>
            <Link href="/">ホーム</Link>
          </li>
          <li>
            <Link href="/beers">ビール</Link>
          </li>
          <li>{prefecture.name}</li>
        </ul>
      </div>

      {/* ヘッダーセクション */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">
          {prefecture.name}のビール一覧
        </h1>
        <p className="text-lg text-base-content/70 max-w-2xl mx-auto mb-4">
          {prefecture.name}のブルワリーが醸造するクラフトビールを探索しよう。
        </p>
        <Link
          href={`/prefectures/${prefecture.id}/breweries`}
          className="btn btn-outline btn-sm"
        >
          {prefecture.name}のブルワリー一覧 →
        </Link>
      </div>

      {/* フィルター */}
      <BeerFilter
        styles={styleOptions}
        breweries={breweryOptions}
        prefectures={prefectureOptions}
        currentPrefecture={String(prefectureId)}
      />

      {/* ビール数表示 & 追加ボタン */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="badge badge-lg badge-primary">
            全{totalCount}件
          </span>
          <span className="text-sm text-base-content/60">
            都道府県で絞り込み中
          </span>
        </div>
        <AuthRequiredLink
          href="/submit/beer"
          isAuthenticated={isAuthenticated}
          className="btn btn-primary btn-sm"
        >
          + ビールを追加
        </AuthRequiredLink>
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
          <p className="text-lg text-base-content/60 mb-4">
            {prefecture.name}のビールはまだ登録されていません
          </p>
          <AuthRequiredLink
            href="/submit/beer"
            isAuthenticated={isAuthenticated}
            className="btn btn-primary"
          >
            最初のビールを登録する
          </AuthRequiredLink>
        </div>
      )}

      {/* ページネーション */}
      <Pagination
        currentPage={currentPage}
        totalCount={totalCount}
        basePath={`/prefectures/${prefecture.id}/beers`}
      />
    </div>
  );
}
