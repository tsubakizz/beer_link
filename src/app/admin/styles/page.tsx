import { db } from "@/lib/db";
import { beerStyles } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { StyleList } from "./StyleList";

// ビルド時にDBに接続できないため動的レンダリング
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ status?: string; q?: string }>;
}

export default async function StylesAdminPage({ searchParams }: Props) {
  const params = await searchParams;
  const statusFilter = params.status || "all";
  const searchQuery = params.q || "";

  // スタイル一覧を取得
  const styleList = await db
    .select()
    .from(beerStyles)
    .orderBy(desc(beerStyles.createdAt));

  // フィルタリング
  let filteredStyles = styleList;
  if (statusFilter !== "all") {
    filteredStyles = filteredStyles.filter((s) => s.status === statusFilter);
  }
  if (searchQuery) {
    const search = searchQuery.toLowerCase();
    filteredStyles = filteredStyles.filter((s) =>
      s.name.toLowerCase().includes(search)
    );
  }

  // 統計
  const stats = {
    total: styleList.length,
    pending: styleList.filter((s) => s.status === "pending").length,
    confirmed: styleList.filter((s) => s.status === "approved").length,
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">スタイル管理</h1>

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

      <StyleList
        styles={filteredStyles}
        currentStatus={statusFilter}
        currentSearch={searchQuery}
      />
    </div>
  );
}
