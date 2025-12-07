"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StyleEditModal } from "./StyleEditModal";
import { deleteStyle, updateStyleStatus } from "./actions";

interface Style {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  createdAt: Date;
}

interface Props {
  styles: Style[];
  currentStatus: string;
  currentSearch: string;
}

export function StyleList({ styles, currentStatus, currentSearch }: Props) {
  const router = useRouter();
  const [editingStyle, setEditingStyle] = useState<Style | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    if (currentSearch) params.set("q", currentSearch);
    router.push(`/admin/styles?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get("q") as string;
    const params = new URLSearchParams();
    if (currentStatus !== "all") params.set("status", currentStatus);
    if (q) params.set("q", q);
    router.push(`/admin/styles?${params.toString()}`);
  };

  const handleQuickConfirm = async (styleId: number) => {
    await updateStyleStatus(styleId, "approved");
  };

  const handleDelete = async (styleId: number) => {
    if (!confirm("本当に削除しますか？この操作は取り消せません。\n※このスタイルを使用しているビールがある場合は削除できません。")) return;
    setDeletingId(styleId);
    const result = await deleteStyle(styleId);
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
            placeholder="スタイル名で検索"
            className="input input-bordered input-sm w-64"
          />
          <button type="submit" className="btn btn-sm btn-primary">
            検索
          </button>
        </form>
      </div>

      {/* スタイル一覧テーブル */}
      {styles.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table bg-base-100">
            <thead>
              <tr>
                <th>ステータス</th>
                <th>スタイル名</th>
                <th>説明</th>
                <th>登録日</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {styles.map((style) => (
                <tr key={style.id}>
                  <td>
                    <span
                      className={`badge badge-sm ${
                        style.status === "pending"
                          ? "badge-warning"
                          : style.status === "approved"
                          ? "badge-success"
                          : "badge-error"
                      }`}
                    >
                      {style.status === "pending" ? "未確認" : style.status === "approved" ? "確認済" : "却下"}
                    </span>
                  </td>
                  <td className="font-medium">{style.name}</td>
                  <td className="max-w-xs truncate text-sm text-base-content/60">
                    {style.description || "-"}
                  </td>
                  <td className="text-sm text-base-content/60">
                    {formatDate(style.createdAt)}
                  </td>
                  <td>
                    <div className="flex gap-1">
                      {style.status === "pending" && (
                        <button
                          onClick={() => handleQuickConfirm(style.id)}
                          className="btn btn-success btn-xs"
                        >
                          確認
                        </button>
                      )}
                      <button
                        onClick={() => setEditingStyle(style)}
                        className="btn btn-ghost btn-xs"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(style.id)}
                        className="btn btn-error btn-outline btn-xs"
                        disabled={deletingId === style.id}
                      >
                        {deletingId === style.id ? (
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
          <p className="text-base-content/60">該当するスタイルがありません</p>
        </div>
      )}

      {/* 編集モーダル */}
      {editingStyle && (
        <StyleEditModal
          style={editingStyle}
          onClose={() => setEditingStyle(null)}
        />
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
