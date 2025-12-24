import { db } from "@/lib/db";
import {
  beers,
  breweries,
  beerStyles,
  beerStyleOtherNames,
  prefectures,
} from "@/lib/db/schema";
import { eq, and, ilike, or, count, gte, lte, isNotNull } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { BeerCard, BeerFilter } from "@/components/beer";
import {
  BITTERNESS_OPTIONS,
  ABV_OPTIONS,
  BITTERNESS_RANGES,
  ABV_RANGES,
  type BitternessLevel,
  type AbvLevel,
} from "@/lib/constants/beer-filters";
import { Pagination, ITEMS_PER_PAGE } from "@/components/ui/Pagination";
import { AuthRequiredLink } from "@/components/ui/AuthRequiredLink";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import type { Metadata } from "next";

// ビルド時にDBに接続できないため動的レンダリング
export const dynamic = "force-dynamic";


interface Props {
  searchParams: Promise<{
    q?: string;
    style?: string;
    brewery?: string;
    prefecture?: string;
    bitterness?: string;
    abv?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const { style, brewery, prefecture, bitterness, abv, q } = params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://beer-link.com";

  // 単一フィルターの場合は構造化URLをcanonicalに設定
  const activeFilters = [style, brewery, prefecture, bitterness, abv, q].filter(Boolean).length;

  if (activeFilters === 1 && !q) {
    if (style) {
      const styleData = await db
        .select({ name: beerStyles.name })
        .from(beerStyles)
        .where(eq(beerStyles.id, parseInt(style, 10)))
        .limit(1)
        .then((rows) => rows[0]);

      if (styleData) {
        return {
          title: `${styleData.name}のビール一覧`,
          description: `${styleData.name}スタイルのクラフトビールを探索。Beer Linkで${styleData.name}のビールを見つけよう。`,
          alternates: {
            canonical: `${siteUrl}/beers/style/${style}`,
          },
        };
      }
    }
    if (brewery) {
      const breweryData = await db
        .select({ name: breweries.name })
        .from(breweries)
        .where(eq(breweries.id, parseInt(brewery, 10)))
        .limit(1)
        .then((rows) => rows[0]);

      if (breweryData) {
        return {
          title: `${breweryData.name}のビール一覧`,
          description: `${breweryData.name}が醸造するクラフトビールを探索。Beer Linkで${breweryData.name}のビールを見つけよう。`,
          alternates: {
            canonical: `${siteUrl}/beers/brewery/${brewery}`,
          },
        };
      }
    }
    if (prefecture) {
      const prefectureData = await db
        .select({ name: prefectures.name })
        .from(prefectures)
        .where(eq(prefectures.id, parseInt(prefecture, 10)))
        .limit(1)
        .then((rows) => rows[0]);

      if (prefectureData) {
        return {
          title: `${prefectureData.name}のビール一覧`,
          description: `${prefectureData.name}のブルワリーが醸造するクラフトビールを探索。Beer Linkで${prefectureData.name}のビールを見つけよう。`,
          alternates: {
            canonical: `${siteUrl}/beers/prefecture/${prefecture}`,
          },
        };
      }
    }
    if (bitterness && BITTERNESS_OPTIONS.some((o) => o.value === bitterness)) {
      const option = BITTERNESS_OPTIONS.find((o) => o.value === bitterness)!;
      return {
        title: `苦味${option.label}のビール一覧`,
        description: `苦味${option.label}（${option.description}）のクラフトビールを探索。苦味で選ぶビール探し。`,
        alternates: {
          canonical: `${siteUrl}/beers/bitterness/${bitterness}`,
        },
      };
    }
    if (abv && ABV_OPTIONS.some((o) => o.value === abv)) {
      const option = ABV_OPTIONS.find((o) => o.value === abv)!;
      return {
        title: `アルコール度数${option.label}のビール一覧`,
        description: `アルコール度数${option.label}（${option.description}）のクラフトビールを探索。アルコール度数で選ぶビール探し。`,
        alternates: {
          canonical: `${siteUrl}/beers/abv/${abv}`,
        },
      };
    }
  }

  // デフォルトのメタデータ
  return {
    title: "ビール一覧",
    description:
      "クラフトビールを探索。ビアスタイル、ブルワリーで絞り込んでお気に入りのビールを見つけよう。",
    alternates: {
      canonical: `${siteUrl}/beers`,
    },
  };
}

export default async function BeersPage({ searchParams }: Props) {
  const params = await searchParams;
  const { q, style, brewery, prefecture, bitterness, abv } = params;

  // 認証状態を取得
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  // ページ番号を取得（デフォルト: 1）
  const currentPage = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // 検索条件を構築
  const conditions: ReturnType<typeof eq>[] = [];

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

  if (prefecture) {
    const prefectureId = parseInt(prefecture, 10);
    if (!isNaN(prefectureId)) {
      conditions.push(eq(breweries.prefectureId, prefectureId));
    }
  }

  // 苦味（IBU）フィルター
  if (bitterness && bitterness in BITTERNESS_RANGES) {
    const range = BITTERNESS_RANGES[bitterness as BitternessLevel];
    conditions.push(isNotNull(beers.ibu));
    conditions.push(gte(beers.ibu, range.min));
    if (range.max !== null) {
      conditions.push(lte(beers.ibu, range.max));
    }
  }

  // ABVフィルター
  if (abv && abv in ABV_RANGES) {
    const range = ABV_RANGES[abv as AbvLevel];
    conditions.push(isNotNull(beers.abv));
    conditions.push(gte(beers.abv, String(range.min)));
    if (range.max !== null) {
      conditions.push(lte(beers.abv, String(range.max)));
    }
  }

  // 総件数を取得（都道府県フィルターのためブルワリーをjoin）
  const [{ totalCount }] = await db
    .select({ totalCount: count() })
    .from(beers)
    .leftJoin(breweries, eq(beers.breweryId, breweries.id))
    .where(and(...conditions));

  // ビール一覧を取得（ページネーション付き）
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

  // フィルター用のスタイル、ブルワリー、都道府県一覧を取得（ビールが存在するもののみ）
  const [styleList, otherNamesList, breweryOptions, prefectureOptions, beersWithIbu, beersWithAbv] =
    await Promise.all([
      // ビールが存在するスタイルのみ取得
      db
        .selectDistinct({ id: beerStyles.id, name: beerStyles.name })
        .from(beerStyles)
        .innerJoin(beers, eq(beers.styleId, beerStyles.id))
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
      // IBUが設定されているビールを取得（苦味フィルター用）
      db
        .select({ ibu: beers.ibu })
        .from(beers)
        .where(isNotNull(beers.ibu)),
      // ABVが設定されているビールを取得（アルコール度数フィルター用）
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
  const styleOptions = styleList.map((s) => ({
    ...s,
    otherNames: otherNamesByStyleId[s.id] || [],
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      {/* パンくずリスト */}
      <Breadcrumb items={[{ label: "ビール" }]} />

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
        prefectures={prefectureOptions}
        bitternessOptions={bitternessOptions}
        abvOptions={abvOptions}
        currentQuery={q}
        currentStyle={style}
        currentBrewery={brewery}
        currentPrefecture={prefecture}
        currentBitterness={bitterness}
        currentAbv={abv}
      />

      {/* ビール数表示 & 追加ボタン */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="badge badge-lg badge-primary">全{totalCount}件</span>
          {(q || style || brewery || prefecture || bitterness || abv) && (
            <span className="text-sm text-base-content/60">
              フィルター適用中
            </span>
          )}
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
          <p className="text-lg text-base-content/60">
            {q || style || brewery || prefecture || bitterness || abv
              ? "条件に合うビールが見つかりませんでした"
              : "ビールがまだ登録されていません"}
          </p>
        </div>
      )}

      {/* ページネーション */}
      <Pagination
        currentPage={currentPage}
        totalCount={totalCount}
        basePath="/beers"
        searchParams={{ q, style, brewery, prefecture, bitterness, abv }}
      />
    </div>
  );
}
