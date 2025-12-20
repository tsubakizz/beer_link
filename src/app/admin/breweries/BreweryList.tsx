"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteBrewery, updateBreweryStatus } from "./actions";

interface Brewery {
  id: number;
  name: string;
  shortDescription: string | null;
  description: string | null;
  prefectureId: number | null;
  address: string | null;
  websiteUrl: string | null;
  imageUrl: string | null;
  status: string;
  createdAt: Date;
  prefecture: { id: number | null; name: string | null } | null;
}

interface Props {
  breweries: Brewery[];
  currentStatus: string;
  currentSearch: string;
}

export function BreweryList({ breweries, currentStatus, currentSearch }: Props) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    if (currentSearch) params.set("q", currentSearch);
    router.push(`/admin/breweries?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get("q") as string;
    const params = new URLSearchParams();
    if (currentStatus !== "all") params.set("status", currentStatus);
    if (q) params.set("q", q);
    router.push(`/admin/breweries?${params.toString()}`);
  };

  const handleQuickConfirm = async (breweryId: number) => {
    await updateBreweryStatus(breweryId, "approved");
  };

  const handleDelete = async (breweryId: number) => {
    if (!confirm("本当に削除しますか？この操作は取り消せません。\n※このブルワリーに登録されているビールがある場合は削除できません。")) return;
    setDeletingId(breweryId);
    const result = await deleteBrewery(breweryId);
    if (!result.success && "error" in result && result.error) {
      alert(result.error);
    }
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
            placeholder="ブルワリー名で検索"
            className="input input-bordered input-sm w-64"
          />
          <button type="submit" className="btn btn-sm btn-primary">
            検索
          </button>
        </form>
      </div>

      {/* ブルワリー一覧テーブル */}
      {breweries.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table bg-base-100">
            <thead>
              <tr>
                <th>ステータス</th>
                <th>ブルワリー名</th>
                <th>都道府県</th>
                <th>登録日</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {breweries.map((brewery) => (
                <tr key={brewery.id}>
                  <td>
                    <span
                      className={`badge badge-sm ${
                        brewery.status === "pending"
                          ? "badge-warning"
                          : brewery.status === "approved"
                          ? "badge-success"
                          : "badge-error"
                      }`}
                    >
                      {brewery.status === "pending" ? "未確認" : brewery.status === "approved" ? "確認済" : "却下"}
                    </span>
                  </td>
                  <td className="font-medium">{brewery.name}</td>
                  <td>{brewery.prefecture?.name || "-"}</td>
                  <td className="text-sm text-base-content/60">
                    {formatDate(brewery.createdAt)}
                  </td>
                  <td>
                    <div className="flex gap-1">
                      {brewery.status === "pending" && (
                        <button
                          onClick={() => handleQuickConfirm(brewery.id)}
                          className="btn btn-success btn-xs"
                        >
                          確認
                        </button>
                      )}
                      <Link
                        href={`/admin/breweries/${brewery.id}/edit`}
                        className="btn btn-ghost btn-xs"
                      >
                        編集
                      </Link>
                      <button
                        onClick={() => handleDelete(brewery.id)}
                        className="btn btn-error btn-outline btn-xs"
                        disabled={deletingId === brewery.id}
                      >
                        {deletingId === brewery.id ? (
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
          <p className="text-base-content/60">該当するブルワリーがありません</p>
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
