import { db } from "@/lib/db";
import { breweries, prefectures, beers, beerStyles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BeerCard } from "@/components/beer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import type { Metadata } from "next";

// ビルド時にDBに接続できないため動的レンダリング
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const breweryId = parseInt(id, 10);

  if (isNaN(breweryId)) {
    return { title: "ブルワリーが見つかりません | beer_link" };
  }

  const brewery = await db
    .select({
      name: breweries.name,
      description: breweries.description,
      imageUrl: breweries.imageUrl,
    })
    .from(breweries)
    .where(eq(breweries.id, breweryId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!brewery) {
    return { title: "ブルワリーが見つかりません | beer_link" };
  }

  const title = `${brewery.name} | ブルワリー一覧`;
  const description =
    brewery.description ||
    `${brewery.name}の詳細情報と製造しているビール一覧。beer_linkでクラフトビール醸造所の情報をチェック。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: brewery.imageUrl ? [{ url: brewery.imageUrl }] : undefined,
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: brewery.imageUrl ? [brewery.imageUrl] : undefined,
    },
  };
}

export default async function BreweryDetailPage({ params }: Props) {
  const { id } = await params;
  const breweryId = parseInt(id, 10);

  if (isNaN(breweryId)) {
    notFound();
  }

  // ブルワリー情報を取得
  const brewery = await db
    .select({
      id: breweries.id,
      name: breweries.name,
      description: breweries.description,
      address: breweries.address,
      websiteUrl: breweries.websiteUrl,
      imageUrl: breweries.imageUrl,
      prefecture: {
        id: prefectures.id,
        name: prefectures.name,
      },
    })
    .from(breweries)
    .leftJoin(prefectures, eq(breweries.prefectureId, prefectures.id))
    .where(eq(breweries.id, breweryId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!brewery) {
    notFound();
  }

  // このブルワリーのビール一覧を取得
  const breweryBeers = await db
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
    .where(eq(beers.breweryId, brewery.id));

  return (
    <div className="container mx-auto px-4 py-8">
      {/* パンくずリスト */}
      <Breadcrumb
        items={[
          { label: "ブルワリー", href: "/breweries" },
          { label: brewery.name },
        ]}
      />

      {/* ヘッダー */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* 画像 */}
        <div className="lg:col-span-1">
          {brewery.imageUrl ? (
            <Image
              src={brewery.imageUrl}
              alt={brewery.name}
              width={400}
              height={400}
              className="rounded-xl w-full h-auto object-cover shadow-lg"
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
                  d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* 基本情報 */}
        <div className="lg:col-span-2">
          <h1 className="text-4xl font-bold mb-4">{brewery.name}</h1>

          {brewery.prefecture && (
            <p className="text-lg text-base-content/60 mb-4">
              📍{" "}
              <Link
                href={`/breweries/prefecture/${brewery.prefecture.id}`}
                className="hover:text-primary transition-colors"
              >
                {brewery.prefecture.name}
              </Link>
            </p>
          )}

          {brewery.description && (
            <p className="text-base-content/80 whitespace-pre-wrap mb-6">
              {brewery.description}
            </p>
          )}

          {/* 詳細情報 */}
          <div className="space-y-3">
            {brewery.address && (
              <div className="flex items-start gap-2">
                <span className="font-medium min-w-20">所在地:</span>
                <span className="text-base-content/80">{brewery.address}</span>
              </div>
            )}
            {brewery.websiteUrl && (
              <div className="flex items-start gap-2">
                <span className="font-medium min-w-20">Website:</span>
                <a
                  href={brewery.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link link-primary"
                >
                  {brewery.websiteUrl}
                </a>
              </div>
            )}
          </div>

          {/* ビール数 */}
          <div className="mt-6">
            <span className="badge badge-lg badge-secondary">
              {breweryBeers.length} ビール
            </span>
          </div>

          {/* 関連ページへのリンク */}
          {brewery.prefecture && (
            <div className="flex flex-wrap gap-3 mt-6">
              <Link
                href={`/beers/prefecture/${brewery.prefecture.id}`}
                className="btn btn-outline btn-sm"
              >
                {brewery.prefecture.name}のビール一覧 →
              </Link>
              <Link
                href={`/breweries/prefecture/${brewery.prefecture.id}`}
                className="btn btn-outline btn-sm"
              >
                {brewery.prefecture.name}のブルワリー一覧 →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* このブルワリーのビール */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">製造ビール</h2>
          {breweryBeers.length > 0 && (
            <Link
              href={`/beers/brewery-${brewery.id}`}
              className="btn btn-outline btn-sm"
            >
              すべて見る →
            </Link>
          )}
        </div>
        {breweryBeers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {breweryBeers.map((beer) => (
              <BeerCard key={beer.id} beer={beer} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-base-200 rounded-lg">
            <p className="text-base-content/60">
              このブルワリーのビールはまだ登録されていません
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
