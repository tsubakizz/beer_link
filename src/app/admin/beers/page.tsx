import { db } from "@/lib/db";
import { beers, beerStyles, breweries, users } from "@/lib/db/schema";
import { eq, desc, sql, or, ilike } from "drizzle-orm";
import { BeerList } from "./BeerList";

// ビルド時にDBに接続できないため動的レンダリング
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ status?: string; q?: string }>;
}

export default async function BeersAdminPage({ searchParams }: Props) {
  const params = await searchParams;
  const statusFilter = params.status || "all";
  const searchQuery = params.q || "";

  // ビール一覧を取得
  let query = db
    .select({
      id: beers.id,
      name: beers.name,
      shortDescription: beers.shortDescription,
      description: beers.description,
      abv: beers.abv,
      ibu: beers.ibu,
      imageUrl: beers.imageUrl,
      status: beers.status,
      createdAt: beers.createdAt,
      brewery: {
        id: breweries.id,
        name: breweries.name,
      },
      style: {
        id: beerStyles.id,
        name: beerStyles.name,
      },
      submitter: {
        id: users.id,
        displayName: users.displayName,
        email: users.email,
      },
    })
    .from(beers)
    .leftJoin(breweries, eq(beers.breweryId, breweries.id))
    .leftJoin(beerStyles, eq(beers.styleId, beerStyles.id))
    .leftJoin(users, eq(beers.submittedBy, users.id))
    .orderBy(desc(beers.createdAt))
    .$dynamic();

  // ステータスフィルター
  if (statusFilter !== "all") {
    query = query.where(eq(beers.status, statusFilter));
  }

  const beerList = await query;

  // 検索フィルター（クライアント側で実装可能だが、サーバー側でも対応）
  const filteredBeers = searchQuery
    ? beerList.filter(
        (beer) =>
          beer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          beer.brewery?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : beerList;

  // 全スタイルと全ブルワリーを取得（編集用）
  const allStyles = await db
    .select({ id: beerStyles.id, name: beerStyles.name })
    .from(beerStyles)
    .orderBy(beerStyles.name);

  const allBreweries = await db
    .select({ id: breweries.id, name: breweries.name })
    .from(breweries)
    .orderBy(breweries.name);

  // 統計
  const stats = {
    total: beerList.length,
    pending: beerList.filter((b) => b.status === "pending").length,
    confirmed: beerList.filter((b) => b.status === "approved").length,
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">ビール管理</h1>

      {/* 統計カード */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-title">総数</div>
          <div className="stat-value text-2xl">{stats.total}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-title">未確認</div>
          <div className="stat-value text-2xl text-warning">{stats.pending}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-title">確認済み</div>
          <div className="stat-value text-2xl text-success">{stats.confirmed}</div>
        </div>
      </div>

      <BeerList
        beers={filteredBeers}
        styles={allStyles}
        breweries={allBreweries}
        currentStatus={statusFilter}
        currentSearch={searchQuery}
      />
    </div>
  );
}
