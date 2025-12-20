import { db } from "@/lib/db";
import { beerStyles, beerStyleOtherNames } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
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

  // 別名一覧を取得
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

  // スタイルに別名を付与
  const styleListWithOtherNames = styleList.map((style) => ({
    ...style,
    otherNames: otherNamesByStyleId[style.id] || [],
  }));

  // フィルタリング
  let filteredStyles = styleListWithOtherNames;
  if (statusFilter !== "all") {
    filteredStyles = filteredStyles.filter((s) => s.status === statusFilter);
  }
  if (searchQuery) {
    const search = searchQuery.toLowerCase();
    filteredStyles = filteredStyles.filter(
      (s) =>
        s.name.toLowerCase().includes(search) ||
        s.otherNames.some((name) => name.toLowerCase().includes(search))
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">スタイル管理</h1>
        <Link href="/admin/styles/new" className="btn btn-primary">
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

      <StyleList
        styles={filteredStyles}
        currentStatus={statusFilter}
        currentSearch={searchQuery}
      />
    </div>
  );
}
