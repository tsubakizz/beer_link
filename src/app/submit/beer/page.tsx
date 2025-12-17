import { db } from "@/lib/db";
import { breweries, beerStyles, beerStyleOtherNames } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BeerSubmitForm } from "./BeerSubmitForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ビール追加 | beer_link",
  description: "新しいビールを追加できます",
};

// ビルド時にDBに接続できないため動的レンダリング
export const dynamic = "force-dynamic";

export default async function BeerSubmitPage() {
  // 認証チェック
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-2">ビール追加</h1>
        <p className="text-base-content/70 mb-8">
          サイトに掲載されていないビールを追加できます。
        </p>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <BeerSubmitForm breweries={breweryList} styles={styleListWithOtherNames} />
          </div>
        </div>
      </div>
    </div>
  );
}
