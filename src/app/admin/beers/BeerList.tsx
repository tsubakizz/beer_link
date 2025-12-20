"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteBeer, updateBeerStatus } from "./actions";

interface Beer {
  id: number;
  name: string;
  shortDescription: string | null;
  description: string | null;
  abv: string | null;
  ibu: number | null;
  imageUrl: string | null;
  status: string;
  createdAt: Date;
  brewery: { id: number | null; name: string | null } | null;
  style: { id: number | null; name: string | null } | null;
  submitter: { id: string | null; displayName: string | null; email: string | null } | null;
}

interface Props {
  beers: Beer[];
  currentStatus: string;
  currentSearch: string;
}

export function BeerList({ beers, currentStatus, currentSearch }: Props) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    if (currentSearch) params.set("q", currentSearch);
    router.push(`/admin/beers?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get("q") as string;
    const params = new URLSearchParams();
    if (currentStatus !== "all") params.set("status", currentStatus);
    if (q) params.set("q", q);
    router.push(`/admin/beers?${params.toString()}`);
  };

  const handleQuickConfirm = async (beerId: number) => {
    await updateBeerStatus(beerId, "approved");
  };

  const handleDelete = async (beerId: number) => {
    if (!confirm("本当に削除しますか？この操作は取り消せません。")) return;
    setDeletingId(beerId);
    await deleteBeer(beerId);
    setDeletingId(null);
  };

  return (
    <div>
      {/* フィルター & 検索 */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="tabs tabs-boxed">
          <button
            className={`tab ${currentStatus === "all" ? "tab-active" : ""}`}
            onClick={() => handleStatusFilter("all")}
          >
            すべて
          </button>
          <button
            className={`tab ${currentStatus === "pending" ? "tab-active" : ""}`}
            onClick={() => handleStatusFilter("pending")}
          >
            未確認
          </button>
          <button
            className={`tab ${currentStatus === "approved" ? "tab-active" : ""}`}
            onClick={() => handleStatusFilter("approved")}
          >
            確認済み
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 ml-auto">
          <input
            type="text"
            name="q"
            defaultValue={currentSearch}
            placeholder="ビール名・ブルワリー名で検索"
            className="input input-bordered input-sm w-64"
          />
          <button type="submit" className="btn btn-sm btn-primary">
            検索
          </button>
        </form>
      </div>

      {/* ビール一覧テーブル */}
      {beers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table bg-base-100">
            <thead>
              <tr>
                <th>ステータス</th>
                <th>ビール名</th>
                <th>ブルワリー</th>
                <th>スタイル</th>
                <th>ABV</th>
                <th>登録日</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {beers.map((beer) => (
                <tr key={beer.id}>
                  <td>
                    <span
                      className={`badge badge-sm ${
                        beer.status === "pending"
                          ? "badge-warning"
                          : beer.status === "approved"
                          ? "badge-success"
                          : "badge-error"
                      }`}
                    >
                      {beer.status === "pending" ? "未確認" : beer.status === "approved" ? "確認済" : "却下"}
                    </span>
                  </td>
                  <td className="font-medium">{beer.name}</td>
                  <td>{beer.brewery?.name || "-"}</td>
                  <td>{beer.style?.name || "-"}</td>
                  <td>{beer.abv ? `${beer.abv}%` : "-"}</td>
                  <td className="text-sm text-base-content/60">
                    {formatDate(beer.createdAt)}
                  </td>
                  <td>
                    <div className="flex gap-1">
                      {beer.status === "pending" && (
                        <button
                          onClick={() => handleQuickConfirm(beer.id)}
                          className="btn btn-success btn-xs"
                        >
                          確認
                        </button>
                      )}
                      <Link
                        href={`/admin/beers/${beer.id}/edit`}
                        className="btn btn-ghost btn-xs"
                      >
                        編集
                      </Link>
                      <button
                        onClick={() => handleDelete(beer.id)}
                        className="btn btn-error btn-outline btn-xs"
                        disabled={deletingId === beer.id}
                      >
                        {deletingId === beer.id ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          "削除"
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-base-100 rounded-lg">
          <p className="text-base-content/60">該当するビールがありません</p>
        </div>
      )}
    </div>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}
