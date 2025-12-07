"use client";

import { useState, useTransition, useMemo } from "react";
import { approveBeerWithDetails, rejectBeer } from "./actions";

interface BeerRequestCardProps {
  request: {
    id: number;
    name: string;
    description: string | null;
    abv: string | null;
    ibu: number | null;
    status: string;
    createdAt: Date;
    brewery: { id: number | null; name: string | null } | null;
    style: { id: number | null; name: string | null } | null;
    submitter: { id: string | null; displayName: string | null; email: string | null } | null;
  };
  styles: { id: number; name: string }[];
}

export function BeerRequestCard({ request, styles }: BeerRequestCardProps) {
  const [isPending, startTransition] = useTransition();
  const [isProcessed, setIsProcessed] = useState(false);
  const [result, setResult] = useState<"approved" | "rejected" | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // 編集用state
  const [editName, setEditName] = useState(request.name);
  const [editStyleId, setEditStyleId] = useState<number | null>(request.style?.id || null);
  const [editAbv, setEditAbv] = useState(request.abv || "");
  const [editIbu, setEditIbu] = useState(request.ibu?.toString() || "");
  const [editDescription, setEditDescription] = useState(request.description || "");
  const [styleSearch, setStyleSearch] = useState("");
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);

  const selectedStyle = styles.find((s) => s.id === editStyleId);

  const filteredStyles = useMemo(() => {
    if (!styleSearch) return styles;
    const search = styleSearch.toLowerCase();
    return styles.filter((s) => s.name.toLowerCase().includes(search));
  }, [styles, styleSearch]);

  const handleApprove = () => {
    startTransition(async () => {
      const res = await approveBeerWithDetails(request.id, {
        name: editName,
        styleId: editStyleId,
        abv: editAbv || null,
        ibu: editIbu ? parseInt(editIbu) : null,
        description: editDescription || null,
      });
      if (res.success) {
        setIsProcessed(true);
        setResult("approved");
      }
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      const res = await rejectBeer(request.id);
      if (res.success) {
        setIsProcessed(true);
        setResult("rejected");
      }
    });
  };

  if (isProcessed) {
    return (
      <div className={`card bg-base-100 shadow border-l-4 ${result === "approved" ? "border-success" : "border-error"}`}>
        <div className="card-body py-4">
          <div className="flex items-center gap-4">
            <span className={`badge ${result === "approved" ? "badge-success" : "badge-error"}`}>
              {result === "approved" ? "承認済み" : "却下済み"}
            </span>
            <span className="font-bold">{editName}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-4">
                {/* ビール名 */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">ビール名</span>
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input input-bordered input-sm"
                  />
                </div>

                {/* ブルワリー（編集不可） */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">ブルワリー</span>
                  </label>
                  <input
                    type="text"
                    value={request.brewery?.name || "不明"}
                    className="input input-bordered input-sm bg-base-200"
                    disabled
                  />
                </div>

                {/* スタイル */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">スタイル</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={isStyleDropdownOpen ? styleSearch : (selectedStyle?.name || "")}
                      onChange={(e) => {
                        setStyleSearch(e.target.value);
                        setIsStyleDropdownOpen(true);
                      }}
                      onFocus={() => setIsStyleDropdownOpen(true)}
                      placeholder="スタイルを検索..."
                      className="input input-bordered input-sm w-full"
                    />
                    {isStyleDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setIsStyleDropdownOpen(false)}
                        />
                        <ul className="absolute z-20 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          <li>
                            <button
                              type="button"
                              onClick={() => {
                                setEditStyleId(null);
                                setStyleSearch("");
                                setIsStyleDropdownOpen(false);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-base-200 text-base-content/50"
                            >
                              なし
                            </button>
                          </li>
                          {filteredStyles.map((style) => (
                            <li key={style.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditStyleId(style.id);
                                  setStyleSearch("");
                                  setIsStyleDropdownOpen(false);
                                }}
                                className={`w-full px-4 py-2 text-left hover:bg-base-200 ${editStyleId === style.id ? "bg-primary/10" : ""}`}
                              >
                                {style.name}
                              </button>
                            </li>
                          ))}
                          {filteredStyles.length === 0 && (
                            <li className="px-4 py-2 text-base-content/50">
                              見つかりませんでした
                            </li>
                          )}
                        </ul>
                      </>
                    )}
                  </div>
                </div>

                {/* ABV & IBU */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">ABV (%)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={editAbv}
                      onChange={(e) => setEditAbv(e.target.value)}
                      className="input input-bordered input-sm"
                      placeholder="5.0"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">IBU</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="200"
                      value={editIbu}
                      onChange={(e) => setEditIbu(e.target.value)}
                      className="input input-bordered input-sm"
                      placeholder="40"
                    />
                  </div>
                </div>

                {/* 説明 */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">説明</span>
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="textarea textarea-bordered textarea-sm"
                    rows={3}
                    placeholder="ビールの説明を入力..."
                  />
                </div>
              </div>
            ) : (
              <div>
                <h3 className="card-title">{request.name}</h3>
                <div className="text-sm text-base-content/60 space-y-1 mt-2">
                  <p>ブルワリー: {request.brewery?.name || "不明"}</p>
                  <p>スタイル: {request.style?.name || "未設定"}</p>
                  {request.abv && <p>ABV: {request.abv}%</p>}
                  {request.ibu && <p>IBU: {request.ibu}</p>}
                </div>
                {request.description && (
                  <p className="mt-3 text-sm">{request.description}</p>
                )}
                <p className="text-xs text-base-content/50 mt-3">
                  申請者: {request.submitter?.displayName || request.submitter?.email || "不明"} /
                  {formatDate(request.createdAt)}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-ghost btn-sm"
              >
                編集
              </button>
            )}
            {isEditing && (
              <button
                onClick={() => setIsEditing(false)}
                className="btn btn-ghost btn-sm"
              >
                キャンセル
              </button>
            )}
            <button
              onClick={handleApprove}
              className="btn btn-success btn-sm"
              disabled={isPending || !editName.trim()}
            >
              {isPending ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                "承認"
              )}
            </button>
            <button
              onClick={handleReject}
              className="btn btn-error btn-outline btn-sm"
              disabled={isPending}
            >
              却下
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}
