"use client";

import { useState, useTransition } from "react";
import { updateStyle } from "./actions";

interface Style {
  id: number;
  name: string;
  description: string | null;
  status: string;
  otherNames: string[];
}

interface Props {
  style: Style;
  onClose: () => void;
}

export function StyleEditModal({ style, onClose }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(style.name);
  const [description, setDescription] = useState(style.description || "");
  const [status, setStatus] = useState(style.status);
  const [otherNames, setOtherNames] = useState<string[]>(style.otherNames);
  const [newOtherName, setNewOtherName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("スタイル名を入力してください");
      return;
    }

    startTransition(async () => {
      const result = await updateStyle(style.id, {
        name: name.trim(),
        description: description || null,
        status,
        otherNames,
      });

      if (result.success) {
        onClose();
      } else {
        setError("error" in result && result.error ? result.error : "更新に失敗しました");
      }
    });
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">スタイルを編集</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          {/* スタイル名 */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">スタイル名 *</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input input-bordered"
              required
            />
          </div>

          {/* 説明 */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">説明</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea textarea-bordered"
              rows={4}
              placeholder="スタイルの説明を入力..."
            />
          </div>

          {/* ステータス */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">ステータス</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="select select-bordered"
            >
              <option value="pending">未確認</option>
              <option value="approved">確認済み</option>
            </select>
          </div>

          {/* 別名 */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">別名</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {otherNames.map((otherName, index) => (
                <span
                  key={index}
                  className="badge badge-lg gap-1"
                >
                  {otherName}
                  <button
                    type="button"
                    onClick={() =>
                      setOtherNames(otherNames.filter((_, i) => i !== index))
                    }
                    className="btn btn-ghost btn-xs p-0"
                  >
                    ✕
                  </button>
                </span>
              ))}
              {otherNames.length === 0 && (
                <span className="text-sm text-base-content/50">
                  別名が登録されていません
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newOtherName}
                onChange={(e) => setNewOtherName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (newOtherName.trim() && !otherNames.includes(newOtherName.trim())) {
                      setOtherNames([...otherNames, newOtherName.trim()]);
                      setNewOtherName("");
                    }
                  }
                }}
                className="input input-bordered input-sm flex-1"
                placeholder="別名を入力してEnter"
              />
              <button
                type="button"
                onClick={() => {
                  if (newOtherName.trim() && !otherNames.includes(newOtherName.trim())) {
                    setOtherNames([...otherNames, newOtherName.trim()]);
                    setNewOtherName("");
                  }
                }}
                className="btn btn-sm btn-outline"
              >
                追加
              </button>
            </div>
          </div>

          <div className="modal-action">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={isPending}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isPending}
            >
              {isPending ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "保存"
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
