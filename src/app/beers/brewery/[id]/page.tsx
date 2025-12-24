import { db } from "@/lib/db";
import {
  beers,
  breweries,
  beerStyles,
  beerStyleOtherNames,
  prefectures,
} from "@/lib/db/schema";
import { eq, and, count, isNotNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BeerCard, BeerFilter } from "@/components/beer";
import {
  BITTERNESS_OPTIONS,
  BITTERNESS_RANGES,
  ABV_OPTIONS,
  ABV_RANGES,
} from "@/lib/constants/beer-filters";
import { Pagination, ITEMS_PER_PAGE } from "@/components/ui/Pagination";
import { AuthRequiredLink } from "@/components/ui/AuthRequiredLink";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const breweryId = parseInt(id, 10);

  if (isNaN(breweryId)) {
    return { title: "ブルワリーが見つかりません | Beer Link" };
  }

  const brewery = await db
    .select({ name: breweries.name })
    .from(breweries)
    .where(eq(breweries.id, breweryId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!brewery) {
    return { title: "ブルワリーが見つかりません | Beer Link" };
  }

  const title = `${brewery.name}のビール一覧`;
  const description = `${brewery.name}が醸造するクラフトビール一覧。Beer Linkで${brewery.name}のビールを探そう。`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function BreweryBeersPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { page } = await searchParams;
  const breweryId = parseInt(id, 10);

  if (isNaN(breweryId)) {
    notFound();
  }

  // ブルワリー情報を取得
  const brewery = await db
    .select({ id: breweries.id, name: breweries.name })
    .from(breweries)
    .where(eq(breweries.id, breweryId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!brewery) {
    notFound();
  }

  // 認証状態を取得
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  // ページネーション
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // 検索条件
  const conditions = [eq(beers.breweryId, brewery.id)];

  // 総件数を取得
  const [{ totalCount }] = await db
    .select({ totalCount: count() })
    .from(beers)
    .where(and(...conditions));

  // 0件の場合は404
  if (totalCount === 0) {
    notFound();
  }

  // ビール一覧を取得
  const beerList = await db
    .select({
      id: beers.id,
      name: beers.name,
      shortDescription: beers.shortDescription,
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
      },
    })
    .from(beers)
    .leftJoin(breweries, eq(beers.breweryId, breweries.id))
    .leftJoin(beerStyles, eq(beers.styleId, beerStyles.id))
    .where(and(...conditions))
    .orderBy(beers.name)
    .limit(ITEMS_PER_PAGE)
    .offset(offset);

  // フィルター用のオプションを取得（ビールが存在するもののみ）
  const [styleList, otherNamesList, breweryOptions, prefectureOptions, beersWithIbu, beersWithAbv] =
    await Promise.all([
      // ビールが存在するスタイルのみ取得
      db
        .selectDistinct({ id: beerStyles.id, name: beerStyles.name })
        .from(beerStyles)
        .innerJoin(beers, eq(beers.styleId, beerStyles.id))
        .where(eq(beerStyles.status, "approved"))
        .orderBy(beerStyles.name),
      db
        .select({
          styleId: beerStyleOtherNames.styleId,
          name: beerStyleOtherNames.name,
        })
        .from(beerStyleOtherNames),
      // ビールが存在するブルワリーのみ取得
      db
        .selectDistinct({ id: breweries.id, name: breweries.name })
        .from(breweries)
        .innerJoin(beers, eq(beers.breweryId, breweries.id))
        .orderBy(breweries.name),
      // ビールが存在する都道府県のみ取得
      db
        .selectDistinct({ id: prefectures.id, name: prefectures.name })
        .from(prefectures)
        .innerJoin(breweries, eq(breweries.prefectureId, prefectures.id))
        .innerJoin(beers, eq(beers.breweryId, breweries.id))
        .orderBy(prefectures.id),
      db
        .select({ ibu: beers.ibu })
        .from(beers)
        .where(isNotNull(beers.ibu)),
      db
        .select({ abv: beers.abv })
        .from(beers)
        .where(isNotNull(beers.abv)),
    ]);

  // 苦味フィルターオプション（該当ビールがあるレベルのみ）
  const bitternessOptions = BITTERNESS_OPTIONS.filter((option) => {
    const range = BITTERNESS_RANGES[option.value];
    return beersWithIbu.some((beer) => {
      const ibu = beer.ibu!;
      return ibu >= range.min && (range.max === null || ibu <= range.max);
    });
  }).map((o) => ({ value: o.value, label: o.label }));

  // ABVフィルターオプション（該当ビールがあるレベルのみ）
  const abvOptions = ABV_OPTIONS.filter((option) => {
    const range = ABV_RANGES[option.value];
    return beersWithAbv.some((beer) => {
      const abv = parseFloat(beer.abv!);
      return abv >= range.min && (range.max === null || abv <= range.max);
    });
  }).map((o) => ({ value: o.value, label: o.label }));

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
      <Breadcrumb
        items={[
          { label: "ビール", href: "/beers" },
          { label: brewery.name },
        ]}
      />

      {/* ヘッダーセクション */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">{brewery.name}のビール一覧</h1>
        <p className="text-lg text-base-content/70 max-w-2xl mx-auto mb-4">
          {brewery.name}が醸造するクラフトビールを探索しよう。
        </p>
        <Link
          href={`/breweries/${brewery.id}`}
          className="btn btn-outline btn-sm"
        >
          {brewery.name}について詳しく見る →
        </Link>
      </div>

      {/* フィルター */}
      <BeerFilter
        styles={styleOptions}
        breweries={breweryOptions}
        prefectures={prefectureOptions}
        bitternessOptions={bitternessOptions}
        abvOptions={abvOptions}
        currentBrewery={String(brewery.id)}
      />

      {/* ビール数表示 & 追加ボタン */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="badge badge-lg badge-primary">全{totalCount}件</span>
          <span className="text-sm text-base-content/60">
            ブルワリーで絞り込み中
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
            {brewery.name}のビールはまだ登録されていません
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
        basePath={`/beers/brewery/${brewery.id}`}
      />
    </div>
  );
}
