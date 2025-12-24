import { db } from "@/lib/db";
import {
  beers,
  breweries,
  beerStyles,
  beerStyleOtherNames,
  prefectures,
} from "@/lib/db/schema";
import { eq, and, count, gte, lte, isNotNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { BeerCard, BeerFilter } from "@/components/beer";
import {
  BITTERNESS_OPTIONS,
  BITTERNESS_RANGES,
  ABV_OPTIONS,
  ABV_RANGES,
  type BitternessLevel,
} from "@/lib/constants/beer-filters";
import { Pagination, ITEMS_PER_PAGE } from "@/components/ui/Pagination";
import { AuthRequiredLink } from "@/components/ui/AuthRequiredLink";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ level: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { level } = await params;

  const option = BITTERNESS_OPTIONS.find((o) => o.value === level);
  if (!option) {
    return { title: "苦味レベルが見つかりません | Beer Link" };
  }

  const title = `苦味${option.label}のビール一覧`;
  const description = `苦味${option.label}（${option.description}）のクラフトビールを探索。苦味で選ぶビール探し。`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function BitternessBeerPage({
  params,
  searchParams,
}: Props) {
  const { level } = await params;
  const { page } = await searchParams;

  // 有効な苦味レベルかチェック
  const option = BITTERNESS_OPTIONS.find((o) => o.value === level);
  if (!option || !(level in BITTERNESS_RANGES)) {
    notFound();
  }

  const range = BITTERNESS_RANGES[level as BitternessLevel];

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
  const conditions = [
    isNotNull(beers.ibu),
    gte(beers.ibu, range.min),
    ...(range.max !== null ? [lte(beers.ibu, range.max)] : []),
  ];

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
      customStyleText: beers.customStyleText,
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
    .orderBy(beers.ibu)
    .limit(ITEMS_PER_PAGE)
    .offset(offset);

  // フィルター用のオプションを取得
  const [styleList, otherNamesList, breweryOptions, prefectureOptions, beersWithIbu, beersWithAbv] =
    await Promise.all([
      db
        .selectDistinct({
          id: beerStyles.id,
          name: beerStyles.name,
        })
        .from(beerStyles)
        .innerJoin(beers, eq(beers.styleId, beerStyles.id))
        .orderBy(beerStyles.name),
      db
        .select({
          styleId: beerStyleOtherNames.styleId,
          name: beerStyleOtherNames.name,
        })
        .from(beerStyleOtherNames),
      db
        .selectDistinct({ id: breweries.id, name: breweries.name })
        .from(breweries)
        .innerJoin(beers, eq(beers.breweryId, breweries.id))
        .orderBy(breweries.name),
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
        items={[{ label: "ビール", href: "/beers" }, { label: `苦味${option.label}` }]}
      />

      {/* ヘッダーセクション */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">苦味{option.label}のビール一覧</h1>
        <p className="text-lg text-base-content/70 max-w-2xl mx-auto mb-2">
          {option.description}の苦味を持つクラフトビールを探索しよう。
        </p>
        <p className="text-sm text-base-content/50">
          IBU（国際苦味単位）で分類されたビールです
        </p>
      </div>

      {/* フィルター */}
      <BeerFilter
        styles={styleOptions}
        breweries={breweryOptions}
        prefectures={prefectureOptions}
        bitternessOptions={bitternessOptions}
        abvOptions={abvOptions}
        currentBitterness={level}
      />

      {/* ビール数表示 & 追加ボタン */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="badge badge-lg badge-primary">全{totalCount}件</span>
          <span className="text-sm text-base-content/60">
            苦味で絞り込み中
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {beerList.map((beer) => (
          <BeerCard key={beer.id} beer={beer} />
        ))}
      </div>

      {/* ページネーション */}
      <Pagination
        currentPage={currentPage}
        totalCount={totalCount}
        basePath={`/beers/bitterness/${level}`}
      />
    </div>
  );
}
