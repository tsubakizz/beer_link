import { db } from "@/lib/db";
import { beers, breweries, beerStyles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { ReviewForm } from "./ReviewForm";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import type { Metadata } from "next";

// ビルド時にDBに接続できないため動的レンダリング
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
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
    title: `${beer.name} のレビューを書く | beer_link`,
    description: `${beer.name}のレビューを投稿`,
  };
}

export default async function ReviewPage({ params }: Props) {
  // 認証チェック
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const beerId = parseInt(id, 10);

  if (isNaN(beerId)) {
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
          { label: "レビューを書く" },
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

        {/* レビューフォーム */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h1 className="card-title text-2xl mb-4">レビューを書く</h1>
              <ReviewForm beerId={beer.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
