import { db } from "@/lib/db";
import { beers, breweries, beerStyles } from "@/lib/db/schema";
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
      abv: beers.abv,
      ibu: beers.ibu,
      shortDescription: beers.shortDescription,
      description: beers.description,
      imageUrl: beers.imageUrl,
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

      <BeerForm beer={beer} breweries={breweryList} styles={styleList} />
    </div>
  );
}
