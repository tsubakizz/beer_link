import { db } from "@/lib/db";
import { beers, breweries, beerStyles, reviews, users, beerFavorites, prefectures } from "@/lib/db/schema";
import { eq, avg, count, desc, and, or } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FlavorProfile, FavoriteButton, BeerCard, BeerFilter } from "@/components/beer";
import {
  BITTERNESS_OPTIONS,
  BITTERNESS_RANGES,
  ABV_OPTIONS,
  ABV_RANGES,
} from "@/lib/constants/beer-filters";
import { ReviewCard } from "@/components/review/ReviewCard";
import { AuthRequiredLink } from "@/components/ui/AuthRequiredLink";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

// ビルド時にDBに接続できないため動的レンダリング
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

// IBUから苦味レベルを判定
function getBitternessLevel(ibu: number): { value: string; label: string } | null {
  for (const option of BITTERNESS_OPTIONS) {
    const range = BITTERNESS_RANGES[option.value];
    if (ibu >= range.min && (range.max === null || ibu <= range.max)) {
      return { value: option.value, label: option.label };
    }
  }
  return null;
}

// ABVからアルコール度数レベルを判定
function getAbvLevel(abv: number): { value: string; label: string } | null {
  for (const option of ABV_OPTIONS) {
    const range = ABV_RANGES[option.value];
    if (abv >= range.min && (range.max === null || abv <= range.max)) {
      return { value: option.value, label: option.label };
    }
  }
  return null;
}

// フィルターパターンをパース
function parseFilter(id: string): { type: "style" | "brewery"; id: number } | null {
  const styleMatch = id.match(/^style-(\d+)$/);
  if (styleMatch) {
    return { type: "style", id: parseInt(styleMatch[1], 10) };
  }

  const breweryMatch = id.match(/^brewery-(\d+)$/);
  if (breweryMatch) {
    return { type: "brewery", id: parseInt(breweryMatch[1], 10) };
  }

  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  // フィルターパターンの場合
  const filter = parseFilter(id);
  if (filter) {
    if (filter.type === "style") {
      const style = await db
        .select({ name: beerStyles.name })
        .from(beerStyles)
        .where(eq(beerStyles.id, filter.id))
        .limit(1)
        .then((rows) => rows[0]);

      if (!style) {
        return { title: "ビアスタイルが見つかりません | beer_link" };
      }

      const title = `${style.name}のビール一覧 | ビール`;
      const description = `${style.name}スタイルのクラフトビール一覧。beer_linkで${style.name}のビールを探そう。`;

      return {
        title,
        description,
        openGraph: { title, description, type: "website" },
        twitter: { card: "summary", title, description },
      };
    }

    if (filter.type === "brewery") {
      const brewery = await db
        .select({ name: breweries.name })
        .from(breweries)
        .where(eq(breweries.id, filter.id))
        .limit(1)
        .then((rows) => rows[0]);

      if (!brewery) {
        return { title: "ブルワリーが見つかりません | beer_link" };
      }

      const title = `${brewery.name}のビール一覧 | ビール`;
      const description = `${brewery.name}が醸造するクラフトビール一覧。beer_linkで${brewery.name}のビールを探そう。`;

      return {
        title,
        description,
        openGraph: { title, description, type: "website" },
        twitter: { card: "summary", title, description },
      };
    }
  }

  // ビール詳細ページの場合
  const beerId = parseInt(id, 10);

  if (isNaN(beerId)) {
    return { title: "ビールが見つかりません | beer_link" };
  }

  const beer = await db
    .select({
      name: beers.name,
      description: beers.description,
      breweryName: breweries.name,
    })
    .from(beers)
    .leftJoin(breweries, eq(beers.breweryId, breweries.id))
    .where(eq(beers.id, beerId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!beer) {
    return { title: "ビールが見つかりません | beer_link" };
  }

  const title = `${beer.name} | ${beer.breweryName || "ビール"}`;
  const description = beer.description || `${beer.name}の詳細情報とレビュー。beer_linkでクラフトビールの口コミをチェック。`;

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

export default async function BeerPage({ params }: Props) {
  const { id } = await params;

  // フィルターパターンの場合はフィルターページを表示
  const filter = parseFilter(id);
  if (filter) {
    return <FilteredBeersPage filterType={filter.type} filterId={filter.id} />;
  }

  // ビール詳細ページを表示
  const beerId = parseInt(id, 10);

  if (isNaN(beerId)) {
    notFound();
  }

  return <BeerDetailPage beerId={beerId} />;
}

// フィルターページコンポーネント
async function FilteredBeersPage({ filterType, filterId }: { filterType: "style" | "brewery"; filterId: number }) {
  // 認証状態を取得
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  let filterName = "";
  let styleSlug: string | null = null;

  // フィルター対象の情報を取得
  if (filterType === "style") {
    const style = await db
      .select({ id: beerStyles.id, name: beerStyles.name, slug: beerStyles.slug })
      .from(beerStyles)
      .where(eq(beerStyles.id, filterId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!style) {
      notFound();
    }
    filterName = style.name;
    styleSlug = style.slug;
  } else {
    const brewery = await db
      .select({ id: breweries.id, name: breweries.name })
      .from(breweries)
      .where(eq(breweries.id, filterId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!brewery) {
      notFound();
    }
    filterName = brewery.name;
  }

  // 検索条件を構築
  const conditions = [or(eq(beers.status, "approved"), eq(beers.status, "pending"))!];

  if (filterType === "style") {
    conditions.push(eq(beers.styleId, filterId));
  } else {
    conditions.push(eq(beers.breweryId, filterId));
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

  // フィルター用のスタイル、ブルワリー、都道府県一覧を取得
  const [styleOptions, breweryOptions, prefectureOptions] = await Promise.all([
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
    db
      .select({ id: prefectures.id, name: prefectures.name })
      .from(prefectures)
      .orderBy(prefectures.id),
  ]);

  const pageTitle = `${filterName}のビール一覧`;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* パンくずリスト */}
      <Breadcrumb
        items={[
          { label: "ビール", href: "/beers" },
          { label: filterName },
        ]}
      />

      {/* ヘッダーセクション */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">{pageTitle}</h1>
        <p className="text-lg text-base-content/70 max-w-2xl mx-auto mb-4">
          {filterType === "style"
            ? `${filterName}スタイルのクラフトビールを探索しよう。`
            : `${filterName}が醸造するクラフトビールを探索しよう。`}
        </p>
        {filterType === "style" && styleSlug && (
          <Link href={`/styles/${styleSlug}`} className="btn btn-outline btn-sm">
            {filterName}について詳しく見る →
          </Link>
        )}
        {filterType === "brewery" && (
          <Link href={`/breweries/${filterId}`} className="btn btn-outline btn-sm">
            {filterName}について詳しく見る →
          </Link>
        )}
      </div>

      {/* フィルター */}
      <BeerFilter
        styles={styleOptions}
        breweries={breweryOptions}
        prefectures={prefectureOptions}
        currentStyle={filterType === "style" ? String(filterId) : undefined}
        currentBrewery={filterType === "brewery" ? String(filterId) : undefined}
      />

      {/* ビール数表示 & 追加ボタン */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="badge badge-lg badge-primary">
            {beerList.length} ビール
          </span>
          <span className="text-sm text-base-content/60">
            {filterType === "style" ? "スタイル" : "ブルワリー"}で絞り込み中
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
            {filterName}のビールはまだ登録されていません
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
    </div>
  );
}

// ビール詳細ページコンポーネント
async function BeerDetailPage({ beerId }: { beerId: number }) {
  // ビール情報を取得
  const beer = await db
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
      prefecture: {
        id: prefectures.id,
        name: prefectures.name,
      },
      style: {
        id: beerStyles.id,
        name: beerStyles.name,
        slug: beerStyles.slug,
        bitterness: beerStyles.bitterness,
        sweetness: beerStyles.sweetness,
        body: beerStyles.body,
        aroma: beerStyles.aroma,
        sourness: beerStyles.sourness,
      },
    })
    .from(beers)
    .leftJoin(breweries, eq(beers.breweryId, breweries.id))
    .leftJoin(prefectures, eq(breweries.prefectureId, prefectures.id))
    .leftJoin(beerStyles, eq(beers.styleId, beerStyles.id))
    .where(eq(beers.id, beerId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!beer) {
    notFound();
  }

  // レビュー統計を取得
  const reviewStats = await db
    .select({
      avgRating: avg(reviews.rating),
      avgBitterness: avg(reviews.bitterness),
      avgSweetness: avg(reviews.sweetness),
      avgBody: avg(reviews.body),
      avgAroma: avg(reviews.aroma),
      avgSourness: avg(reviews.sourness),
      count: count(reviews.id),
    })
    .from(reviews)
    .where(eq(reviews.beerId, beerId))
    .then((rows) => rows[0]);

  // レビュー一覧を取得
  const beerReviews = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      bitterness: reviews.bitterness,
      sweetness: reviews.sweetness,
      body: reviews.body,
      aroma: reviews.aroma,
      sourness: reviews.sourness,
      comment: reviews.comment,
      imageUrl: reviews.imageUrl,
      createdAt: reviews.createdAt,
      user: {
        id: users.id,
        displayName: users.displayName,
        profileImageUrl: users.profileImageUrl,
      },
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.beerId, beerId))
    .orderBy(desc(reviews.createdAt))
    .limit(20);

  const hasReviews = reviewStats.count > 0;
  const avgRating = hasReviews ? Number(reviewStats.avgRating) : null;

  // お気に入り状態を取得
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;
  let isFavorited = false;

  if (user) {
    const [favorite] = await db
      .select()
      .from(beerFavorites)
      .where(
        and(
          eq(beerFavorites.userId, user.id),
          eq(beerFavorites.beerId, beerId)
        )
      );
    isFavorited = !!favorite;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* パンくずリスト */}
      <Breadcrumb
        items={[
          { label: "ビール", href: "/beers" },
          { label: beer.name },
        ]}
      />

      {/* メイン情報 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* 画像 */}
        <div className="lg:col-span-1">
          {beer.imageUrl ? (
            <Image
              src={beer.imageUrl}
              alt={beer.name}
              width={400}
              height={400}
              className="rounded-xl w-full h-auto object-cover shadow-lg bg-base-200"
            />
          ) : (
            <div className="rounded-xl w-full aspect-square bg-base-200 flex items-center justify-center shadow-lg">
              <svg
                className="w-24 h-24 text-base-content/30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* 基本情報 */}
        <div className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold">{beer.name}</h1>
            <FavoriteButton
              beerId={beer.id}
              isFavorited={isFavorited}
              size="lg"
              showText
            />
          </div>

          {beer.brewery && (
            <Link
              href={`/breweries/${beer.brewery.id}`}
              className="text-lg text-base-content/60 hover:text-primary transition-colors"
            >
              {beer.brewery.name}
            </Link>
          )}

          {/* 評価 */}
          {hasReviews && avgRating && (
            <div className="flex items-center gap-2 mt-4">
              <div className="rating rating-md">
                {[1, 2, 3, 4, 5].map((star) => (
                  <input
                    key={star}
                    type="radio"
                    className="mask mask-star-2 bg-amber-400"
                    checked={Math.round(avgRating) === star}
                    readOnly
                  />
                ))}
              </div>
              <span className="text-xl font-bold">{avgRating.toFixed(1)}</span>
              <span className="text-base-content/60">
                ({reviewStats.count} レビュー)
              </span>
            </div>
          )}

          {/* 説明 */}
          {beer.description && (
            <p className="text-base-content/80 whitespace-pre-wrap mt-4">
              {beer.description}
            </p>
          )}

          {/* スペック */}
          <div className="flex flex-wrap gap-3 mt-6">
            {beer.style && (
              <Link
                href={`/styles/${beer.style.slug}`}
                className="badge badge-primary badge-lg hover:badge-primary/80"
              >
                {beer.style.name}
              </Link>
            )}
            {beer.abv && (
              <span className="badge badge-outline badge-lg">
                ABV: {beer.abv}%
              </span>
            )}
            {beer.ibu && (
              <span className="badge badge-outline badge-lg">
                IBU: {beer.ibu}
              </span>
            )}
          </div>

        </div>
      </div>

      {/* 味の特性セクション */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* スタイルの味特性 */}
        {beer.style && (
          <div className="card bg-base-100 shadow">
            <div className="card-body items-center">
              <h2 className="card-title">
                {beer.style.name}の典型的な味わい
              </h2>
              <FlavorProfile
                data={{
                  bitterness: beer.style.bitterness,
                  sweetness: beer.style.sweetness,
                  body: beer.style.body,
                  aroma: beer.style.aroma,
                  sourness: beer.style.sourness,
                }}
                size="lg"
              />
            </div>
          </div>
        )}

        {/* レビュー平均の味特性 */}
        {hasReviews && (
          <div className="card bg-base-100 shadow">
            <div className="card-body items-center">
              <h2 className="card-title">ユーザーレビュー平均</h2>
              <FlavorProfile
                data={{
                  bitterness: Number(reviewStats.avgBitterness) || null,
                  sweetness: Number(reviewStats.avgSweetness) || null,
                  body: Number(reviewStats.avgBody) || null,
                  aroma: Number(reviewStats.avgAroma) || null,
                  sourness: Number(reviewStats.avgSourness) || null,
                }}
                size="lg"
              />
            </div>
          </div>
        )}
      </div>

      {/* レビューセクション */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            レビュー ({reviewStats.count})
          </h2>
          <AuthRequiredLink
            href={`/beers/${beer.id}/review`}
            isAuthenticated={isAuthenticated}
            className="btn btn-primary"
          >
            レビューを書く
          </AuthRequiredLink>
        </div>

        {beerReviews.length > 0 ? (
          <div className="space-y-4">
            {beerReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                beerId={beer.id}
                currentUserId={user?.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-base-200 rounded-lg">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-base-content/60 mb-4">
              まだレビューがありません
            </p>
            <AuthRequiredLink
              href={`/beers/${beer.id}/review`}
              isAuthenticated={isAuthenticated}
              className="btn btn-primary"
            >
              最初のレビューを書く
            </AuthRequiredLink>
          </div>
        )}
      </div>

      {/* 関連ページへのリンク */}
      <div className="mt-12 pt-8 border-t border-base-300">
        <h2 className="text-xl font-bold mb-4">関連するビール一覧</h2>
        <div className="flex flex-wrap gap-3">
          {beer.style?.id && (
            <Link
              href={`/beers/style/${beer.style.slug}`}
              className="btn btn-outline btn-sm"
            >
              {beer.style.name}のビール一覧 →
            </Link>
          )}
          {beer.brewery?.id && (
            <Link
              href={`/beers/brewery/${beer.brewery.id}`}
              className="btn btn-outline btn-sm"
            >
              {beer.brewery.name}のビール一覧 →
            </Link>
          )}
          {beer.prefecture?.id && (
            <Link
              href={`/beers/prefecture/${beer.prefecture.id}`}
              className="btn btn-outline btn-sm"
            >
              {beer.prefecture.name}のビール一覧 →
            </Link>
          )}
          {beer.ibu && getBitternessLevel(beer.ibu) && (
            <Link
              href={`/beers/bitterness/${getBitternessLevel(beer.ibu)!.value}`}
              className="btn btn-outline btn-sm"
            >
              苦味{getBitternessLevel(beer.ibu)!.label}のビール一覧 →
            </Link>
          )}
          {beer.abv && getAbvLevel(parseFloat(beer.abv)) && (
            <Link
              href={`/beers/abv/${getAbvLevel(parseFloat(beer.abv))!.value}`}
              className="btn btn-outline btn-sm"
            >
              アルコール度数{getAbvLevel(parseFloat(beer.abv))!.label}のビール一覧 →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
