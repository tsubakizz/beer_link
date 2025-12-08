import { db } from "@/lib/db";
import {
  beerStyles,
  beers,
  breweries,
  beerStyleRelations,
  RelationType,
} from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { FlavorProfile, BeerCard, RelatedStyles } from "@/components/beer";
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

// 有効なフィルタータイプ
const VALID_FILTER_TYPES = [
  "bitterness",
  "sweetness",
  "body",
  "aroma",
  "sourness",
] as const;

type FilterType = (typeof VALID_FILTER_TYPES)[number];

// フィルターパターンをパース（例: "bitterness-3" -> { type: "bitterness", value: 3 }）
function parseFilterSlug(
  slug: string
): { type: FilterType; value: number } | null {
  const match = slug.match(
    /^(bitterness|sweetness|body|aroma|sourness)-([1-5])$/
  );
  if (!match) return null;
  return {
    type: match[1] as FilterType,
    value: parseInt(match[2], 10),
  };
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // フィルターパターンの場合はリダイレクトされるのでここでは処理しない
  const filter = parseFilterSlug(slug);
  if (filter) {
    return { title: "リダイレクト中..." };
  }

  // スタイル詳細
  const style = await db
    .select({
      name: beerStyles.name,
      description: beerStyles.description,
      origin: beerStyles.origin,
    })
    .from(beerStyles)
    .where(eq(beerStyles.slug, slug))
    .limit(1)
    .then((rows) => rows[0]);

  if (!style) {
    return { title: "ビアスタイルが見つかりません | beer_link" };
  }

  const title = `${style.name} | ビアスタイル一覧`;
  const description =
    style.description ||
    `${style.name}の特徴、歴史、おすすめビールを紹介。${style.origin ? `発祥: ${style.origin}。` : ""}beer_linkでビアスタイルを学ぼう。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function StylePage({ params }: Props) {
  const { slug } = await params;

  // フィルターパターンの場合はクエリパラメータ付きでリダイレクト
  const filter = parseFilterSlug(slug);
  if (filter) {
    const { type, value } = filter;
    redirect(`/styles?${type}_min=${value}&${type}_max=${value}`);
  }

  // スタイル詳細を表示
  const style = await db
    .select()
    .from(beerStyles)
    .where(eq(beerStyles.slug, slug))
    .limit(1)
    .then((rows) => rows[0]);

  if (!style) {
    notFound();
  }

  // このスタイルのビールを取得
  const styleBeers = await db
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
    .where(and(eq(beers.styleId, style.id), eq(beers.status, "approved")))
    .limit(12);

  // 関連スタイルを取得
  const relations = await db
    .select({
      relatedStyleId: beerStyleRelations.relatedStyleId,
      relationType: beerStyleRelations.relationType,
    })
    .from(beerStyleRelations)
    .where(eq(beerStyleRelations.styleId, style.id));

  // 関連スタイルのIDを種類ごとに分類
  const parentIds = relations
    .filter((r) => r.relationType === RelationType.PARENT)
    .map((r) => r.relatedStyleId);
  const childIds = relations
    .filter((r) => r.relationType === RelationType.CHILD)
    .map((r) => r.relatedStyleId);
  const siblingIds = relations
    .filter((r) => r.relationType === RelationType.SIBLING)
    .map((r) => r.relatedStyleId);

  // 関連スタイルの詳細を取得
  const allRelatedIds = [...parentIds, ...childIds, ...siblingIds];
  const relatedStylesData =
    allRelatedIds.length > 0
      ? await db
          .select({
            id: beerStyles.id,
            slug: beerStyles.slug,
            name: beerStyles.name,
          })
          .from(beerStyles)
          .where(inArray(beerStyles.id, allRelatedIds))
      : [];

  // 種類ごとにスタイルを分類
  const parentStyles = relatedStylesData.filter((s) => parentIds.includes(s.id));
  const childStyles = relatedStylesData.filter((s) => childIds.includes(s.id));
  const siblingStyles = relatedStylesData.filter((s) => siblingIds.includes(s.id));

  return (
    <div className="container mx-auto px-4 py-8">
      {/* パンくずリスト */}
      <div className="breadcrumbs text-sm mb-6">
        <ul>
          <li>
            <Link href="/">ホーム</Link>
          </li>
          <li>
            <Link href="/styles">ビアスタイル</Link>
          </li>
          <li>{style.name}</li>
        </ul>
      </div>

      {/* ヘッダー */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2">{style.name}</h1>
        {style.origin && (
          <p className="text-lg text-base-content/60">発祥: {style.origin}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* メイン情報 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 説明 */}
          {style.description && (
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title">概要</h2>
                <p className="text-base-content/80 whitespace-pre-wrap">
                  {style.description}
                </p>
              </div>
            </div>
          )}

          {/* 歴史 */}
          {style.history && (
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title">歴史・起源</h2>
                <p className="text-base-content/80 whitespace-pre-wrap">
                  {style.history}
                </p>
              </div>
            </div>
          )}

          {/* スペック */}
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h2 className="card-title">スペック</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {style.abvMin && style.abvMax && (
                  <div className="stat bg-base-200 rounded-lg p-4">
                    <div className="stat-title text-xs">アルコール度数</div>
                    <div className="stat-value text-lg">
                      {style.abvMin}-{style.abvMax}%
                    </div>
                  </div>
                )}
                {style.ibuMin && style.ibuMax && (
                  <div className="stat bg-base-200 rounded-lg p-4">
                    <div className="stat-title text-xs">IBU (苦味)</div>
                    <div className="stat-value text-lg">
                      {style.ibuMin}-{style.ibuMax}
                    </div>
                  </div>
                )}
                {style.srmMin && style.srmMax && (
                  <div className="stat bg-base-200 rounded-lg p-4">
                    <div className="stat-title text-xs">SRM (色)</div>
                    <div className="stat-value text-lg">
                      {style.srmMin}-{style.srmMax}
                    </div>
                  </div>
                )}
                {style.servingTempMin && style.servingTempMax && (
                  <div className="stat bg-base-200 rounded-lg p-4">
                    <div className="stat-title text-xs">適温</div>
                    <div className="stat-value text-lg">
                      {style.servingTempMin}-{style.servingTempMax}°C
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* サイドバー - 味の特性 */}
        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow sticky top-24">
            <div className="card-body items-center">
              <h2 className="card-title">味の特性</h2>
              <FlavorProfile
                data={{
                  bitterness: style.bitterness,
                  sweetness: style.sweetness,
                  body: style.body,
                  aroma: style.aroma,
                  sourness: style.sourness,
                }}
                size="lg"
              />
              <div className="w-full mt-4 space-y-2">
                <FlavorBarLink
                  label="苦味"
                  value={style.bitterness}
                  filterType="bitterness"
                />
                <FlavorBarLink
                  label="甘味"
                  value={style.sweetness}
                  filterType="sweetness"
                />
                <FlavorBarLink
                  label="ボディ"
                  value={style.body}
                  filterType="body"
                />
                <FlavorBarLink
                  label="香り"
                  value={style.aroma}
                  filterType="aroma"
                />
                <FlavorBarLink
                  label="酸味"
                  value={style.sourness}
                  filterType="sourness"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 関連するビアスタイル */}
      <div className="mb-12">
        <RelatedStyles
          parentStyles={parentStyles}
          childStyles={childStyles}
          siblingStyles={siblingStyles}
        />
      </div>

      {/* このスタイルのビール */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">このスタイルのビール</h2>
          {styleBeers.length > 0 && (
            <Link
              href={`/beers/style-${style.id}`}
              className="btn btn-outline btn-sm"
            >
              すべて見る →
            </Link>
          )}
        </div>
        {styleBeers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {styleBeers.map((beer) => (
                <BeerCard key={beer.id} beer={beer} />
              ))}
            </div>
            {styleBeers.length >= 12 && (
              <div className="text-center mt-8">
                <Link
                  href={`/beers/style-${style.id}`}
                  className="btn btn-primary"
                >
                  {style.name}のビールをもっと見る
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-base-200 rounded-lg">
            <p className="text-base-content/60">
              このスタイルのビールはまだ登録されていません
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function FlavorBarLink({
  label,
  value,
  filterType,
}: {
  label: string;
  value: number | null;
  filterType: FilterType;
}) {
  const val = value ?? 0;
  const flavorLabel = val > 0 ? FLAVOR_LABELS[val] : null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm w-16">{label}</span>
      <progress
        className="progress progress-primary flex-1"
        value={val}
        max={5}
      />
      {val > 0 && flavorLabel ? (
        <Link
          href={`/styles/${filterType}-${val}`}
          className="text-sm min-w-20 text-right link link-primary hover:link-hover"
          title={`${label}が${flavorLabel}のビアスタイル一覧を見る`}
        >
          {val} ({flavorLabel})
        </Link>
      ) : (
        <span className="text-sm min-w-20 text-right text-base-content/50">
          -
        </span>
      )}
    </div>
  );
}
