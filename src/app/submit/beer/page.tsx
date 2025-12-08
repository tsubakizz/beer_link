import { db } from "@/lib/db";
import { breweries, beerStyles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { BeerSubmitForm } from "./BeerSubmitForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ビール追加 | beer_link",
  description: "新しいビールを追加できます",
};

// ビルド時にDBに接続できないため動的レンダリング
export const dynamic = "force-dynamic";

export default async function BeerSubmitPage() {
  // ブルワリー一覧を取得（承認済みのみ）
  const breweryList = await db
    .select({ id: breweries.id, name: breweries.name })
    .from(breweries)
    .where(eq(breweries.status, "approved"))
    .orderBy(breweries.name);

  // ビアスタイル一覧を取得（承認済みのみ）
  const styleList = await db
    .select({ id: beerStyles.id, name: beerStyles.name })
    .from(beerStyles)
    .where(eq(beerStyles.status, "approved"))
    .orderBy(beerStyles.name);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-2">ビール追加</h1>
        <p className="text-base-content/70 mb-8">
          サイトに掲載されていないビールを追加できます。
        </p>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <BeerSubmitForm breweries={breweryList} styles={styleList} />
          </div>
        </div>
      </div>
    </div>
  );
}
