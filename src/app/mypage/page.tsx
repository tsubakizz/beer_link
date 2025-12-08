import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users, reviews, beerFavorites, beers, breweries, beerStyles } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ProfileForm } from "./ProfileForm";
import { BeerCard, FlavorProfile } from "@/components/beer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "マイページ | beer_link",
  description: "あなたのプロフィール、レビュー、お気に入りを管理",
};

// ビルド時にDBに接続できないため動的レンダリング
export const dynamic = "force-dynamic";

export default async function MyPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  // ユーザー情報を取得（なければ作成）
  let [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser.id));

  if (!user) {
    // 初回ログイン時にユーザーレコードを作成
    const [newUser] = await db.insert(users).values({
      id: authUser.id,
      email: authUser.email!,
      displayName: authUser.user_metadata.display_name || authUser.email?.split("@")[0],
    }).returning();
    user = newUser;
  }

  // レビュー一覧を取得
  const userReviews = await db
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
      beer: {
        id: beers.id,
        name: beers.name,
        imageUrl: beers.imageUrl,
      },
      brewery: {
        name: breweries.name,
      },
      style: {
        name: beerStyles.name,
      },
    })
    .from(reviews)
    .innerJoin(beers, eq(reviews.beerId, beers.id))
    .innerJoin(breweries, eq(beers.breweryId, breweries.id))
    .innerJoin(beerStyles, eq(beers.styleId, beerStyles.id))
    .where(eq(reviews.userId, authUser.id))
    .orderBy(desc(reviews.createdAt));

  // お気に入り一覧を取得
  const userFavorites = await db
    .select({
      id: beerFavorites.id,
      createdAt: beerFavorites.createdAt,
      beer: {
        id: beers.id,
        name: beers.name,
        description: beers.description,
        abv: beers.abv,
        ibu: beers.ibu,
        imageUrl: beers.imageUrl,
      },
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
    .from(beerFavorites)
    .innerJoin(beers, eq(beerFavorites.beerId, beers.id))
    .innerJoin(breweries, eq(beers.breweryId, breweries.id))
    .innerJoin(beerStyles, eq(beers.styleId, beerStyles.id))
    .where(eq(beerFavorites.userId, authUser.id))
    .orderBy(desc(beerFavorites.createdAt));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">マイページ</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* プロフィールセクション */}
        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h2 className="card-title mb-4">プロフィール</h2>

              {/* アバター */}
              <div className="flex justify-center mb-4">
                {user.profileImageUrl ? (
                  <Image
                    src={user.profileImageUrl}
                    alt={user.displayName || "プロフィール画像"}
                    width={96}
                    height={96}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-base-200 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-base-content/40"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <ProfileForm user={user} />

              <div className="divider"></div>

              {/* 統計 */}
              <div className="stats stats-vertical shadow">
                <div className="stat">
                  <div className="stat-title">レビュー数</div>
                  <div className="stat-value text-primary">{userReviews.length}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">お気に入り数</div>
                  <div className="stat-value text-secondary">{userFavorites.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="lg:col-span-2 space-y-8">
          {/* レビュー一覧 */}
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h2 className="card-title mb-4">マイレビュー</h2>

              {userReviews.length > 0 ? (
                <div className="space-y-4">
                  {userReviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                      <div className="flex gap-4">
                        {/* ビール画像 */}
                        <Link href={`/beers/${review.beer.id}`} className="shrink-0">
                          {review.beer.imageUrl ? (
                            <Image
                              src={review.beer.imageUrl}
                              alt={review.beer.name}
                              width={80}
                              height={80}
                              className="rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-lg bg-base-200 flex items-center justify-center">
                              <span className="text-3xl">🍺</span>
                            </div>
                          )}
                        </Link>

                        <div className="flex-1 min-w-0">
                          <Link href={`/beers/${review.beer.id}`} className="hover:underline">
                            <h3 className="font-bold text-lg truncate">{review.beer.name}</h3>
                          </Link>
                          <p className="text-sm text-base-content/60">
                            {review.brewery.name} / {review.style.name}
                          </p>

                          {/* 評価 */}
                          <div className="flex items-center gap-2 mt-1">
                            <div className="rating rating-sm">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <input
                                  key={star}
                                  type="radio"
                                  className="mask mask-star-2 bg-amber-400"
                                  checked={review.rating === star}
                                  readOnly
                                />
                              ))}
                            </div>
                            <span className="text-sm text-base-content/60">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>

                          {review.comment && (
                            <p className="text-sm mt-2 line-clamp-2">{review.comment}</p>
                          )}
                        </div>

                        {/* 味評価 */}
                        {(review.bitterness || review.sweetness || review.body || review.aroma || review.sourness) && (
                          <div className="hidden md:block shrink-0">
                            <FlavorProfile
                              data={{
                                bitterness: review.bitterness,
                                sweetness: review.sweetness,
                                body: review.body,
                                aroma: review.aroma,
                                sourness: review.sourness,
                              }}
                              size="sm"
                              showLabels={false}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📝</div>
                  <p className="text-base-content/60">まだレビューがありません</p>
                  <Link href="/beers" className="btn btn-primary btn-sm mt-4">
                    ビールを探す
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* お気に入り一覧 */}
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h2 className="card-title mb-4">お気に入りビール</h2>

              {userFavorites.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {userFavorites.map((fav) => (
                    <BeerCard
                      key={fav.id}
                      beer={{
                        id: fav.beer.id,
                        name: fav.beer.name,
                        description: fav.beer.description,
                        abv: fav.beer.abv,
                        ibu: fav.beer.ibu,
                        imageUrl: fav.beer.imageUrl,
                        brewery: fav.brewery,
                        style: fav.style,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">❤️</div>
                  <p className="text-base-content/60">お気に入りはまだありません</p>
                  <Link href="/beers" className="btn btn-primary btn-sm mt-4">
                    ビールを探す
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}
