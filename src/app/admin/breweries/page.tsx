import { db } from "@/lib/db";
import { breweries, prefectures } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { BreweryList } from "./BreweryList";

// ビルド時にDBに接続できないため動的レンダリング
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ status?: string; q?: string }>;
}

export default async function BreweriesAdminPage({ searchParams }: Props) {
  const params = await searchParams;
  const statusFilter = params.status || "all";
  const searchQuery = params.q || "";

  // ブルワリー一覧を取得
  const breweryList = await db
    .select({
      id: breweries.id,
      name: breweries.name,
      shortDescription: breweries.shortDescription,
      description: breweries.description,
      prefectureId: breweries.prefectureId,
      address: breweries.address,
      websiteUrl: breweries.websiteUrl,
      imageUrl: breweries.imageUrl,
      status: breweries.status,
      createdAt: breweries.createdAt,
      prefecture: {
        id: prefectures.id,
        name: prefectures.name,
      },
    })
    .from(breweries)
    .leftJoin(prefectures, eq(breweries.prefectureId, prefectures.id))
    .orderBy(desc(breweries.createdAt));

  // フィルタリング
  let filteredBreweries = breweryList;
  if (statusFilter !== "all") {
    filteredBreweries = filteredBreweries.filter((b) => b.status === statusFilter);
  }
  if (searchQuery) {
    const search = searchQuery.toLowerCase();
    filteredBreweries = filteredBreweries.filter((b) =>
      b.name.toLowerCase().includes(search)
    );
  }

  // 統計
  const stats = {
    total: breweryList.length,
    pending: breweryList.filter((b) => b.status === "pending").length,
    confirmed: breweryList.filter((b) => b.status === "approved").length,
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">ブルワリー管理</h1>
        <Link href="/admin/breweries/new" className="btn btn-primary">
          新規作成
        </Link>
      </div>

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

      <BreweryList
        breweries={filteredBreweries}
        currentStatus={statusFilter}
        currentSearch={searchQuery}
      />
    </div>
  );
}
