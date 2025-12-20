import { db } from "@/lib/db";
import { breweries, beerStyles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { BeerForm } from "../BeerForm";

export const dynamic = "force-dynamic";

export default async function NewBeerPage() {
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
          <li>新規作成</li>
        </ul>
      </div>

      <h1 className="text-3xl font-bold mb-8">ビールを新規作成</h1>

      <BeerForm breweries={breweryList} styles={styleList} />
    </div>
  );
}
