import { db } from "@/lib/db";
import { beers, breweries, beerStyles, reviews } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { ReviewEditForm } from "./ReviewEditForm";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string; reviewId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const beerId = parseInt(id, 10);

  if (isNaN(beerId)) {
    return { title: "ビールが見つかりません | beer_link" };
  }

  const beer = await db
    .select({ name: beers.name })
    .from(beers)
    .where(eq(beers.id, beerId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!beer) {
    return { title: "ビールが見つかりません | beer_link" };
  }

  return {
    title: `${beer.name} のレビューを編集 | beer_link`,
    description: `${beer.name}のレビューを編集`,
  };
}

export default async function ReviewEditPage({ params }: Props) {
  const { id, reviewId } = await params;
  const beerId = parseInt(id, 10);
  const reviewIdNum = parseInt(reviewId, 10);

  if (isNaN(beerId) || isNaN(reviewIdNum)) {
    notFound();
  }

  // 認証チェック
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/beers/${beerId}/review/${reviewIdNum}/edit`);
  }

  // レビュー情報を取得（所有者チェック含む）
  const review = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.id, reviewIdNum), eq(reviews.userId, user.id)))
    .limit(1)
    .then((rows) => rows[0]);

  if (!review) {
    notFound();
  }

  // ビール情報を取得
  const beer = await db
    .select({
      id: beers.id,
      name: beers.name,
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
    .where(eq(beers.id, beerId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!beer) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* パンくずリスト */}
      <Breadcrumb
        items={[
          { label: "ビール", href: "/beers" },
          { label: beer.name, href: `/beers/${beer.id}` },
          { label: "レビューを編集" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ビール情報 */}
        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow sticky top-4">
            <figure className="px-4 pt-4">
              {beer.imageUrl ? (
                <Image
                  src={beer.imageUrl}
                  alt={beer.name}
                  width={300}
                  height={300}
                  className="rounded-xl object-cover"
                />
              ) : (
                <div className="w-full aspect-square bg-base-200 rounded-xl flex items-center justify-center">
                  <span className="text-6xl">🍺</span>
                </div>
              )}
            </figure>
            <div className="card-body">
              <h2 className="card-title">{beer.name}</h2>
              <p className="text-base-content/60">
                {beer.brewery?.name} / {beer.style?.name}
              </p>
            </div>
          </div>
        </div>

        {/* レビュー編集フォーム */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h1 className="card-title text-2xl mb-4">レビューを編集</h1>
              <ReviewEditForm beerId={beer.id} review={review} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
