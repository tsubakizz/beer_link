import { db } from "@/lib/db";
import { beers, breweries, beerStyles, beerStyleOtherNames } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BeerForm } from "../../BeerForm";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBeerPage({ params }: Props) {
  const { id } = await params;
  const beerId = parseInt(id, 10);

  if (isNaN(beerId)) {
    notFound();
  }

  // ビール情報を取得
  const [beer] = await db
    .select({
      id: beers.id,
      name: beers.name,
      breweryId: beers.breweryId,
      styleId: beers.styleId,
      customStyleText: beers.customStyleText,
      abv: beers.abv,
      ibu: beers.ibu,
      shortDescription: beers.shortDescription,
      description: beers.description,
      imageUrl: beers.imageUrl,
      amazonUrl: beers.amazonUrl,
      rakutenUrl: beers.rakutenUrl,
      officialUrl: beers.officialUrl,
      otherShopUrl: beers.otherShopUrl,
      status: beers.status,
    })
    .from(beers)
    .where(eq(beers.id, beerId));

  if (!beer) {
    notFound();
  }

  // 確認済みブルワリー一覧を取得
  const breweryList = await db
    .select({ id: breweries.id, name: breweries.name })
    .from(breweries)
    .where(eq(breweries.status, "approved"))
    .orderBy(breweries.name);

  // スタイル一覧を取得
  const styleList = await db
    .select({ id: beerStyles.id, name: beerStyles.name })
    .from(beerStyles)
    .orderBy(beerStyles.name);

  // ビアスタイル別名一覧を取得
  const otherNamesList = await db
    .select({
      styleId: beerStyleOtherNames.styleId,
      name: beerStyleOtherNames.name,
    })
    .from(beerStyleOtherNames);

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
  const styleListWithOtherNames = styleList.map((style) => ({
    ...style,
    otherNames: otherNamesByStyleId[style.id] || [],
  }));

  return (
    <div>
      {/* パンくずリスト */}
      <div className="breadcrumbs text-sm mb-6">
        <ul>
          <li>
            <Link href="/admin">管理画面</Link>
          </li>
          <li>
            <Link href="/admin/beers">ビール管理</Link>
          </li>
          <li>編集</li>
        </ul>
      </div>

      <h1 className="text-3xl font-bold mb-8">ビールを編集</h1>

      <BeerForm beer={beer} breweries={breweryList} styles={styleListWithOtherNames} />
    </div>
  );
}
