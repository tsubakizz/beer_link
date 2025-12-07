"use client";

import { useState, useTransition } from "react";
import { updateStyle } from "./actions";

interface Style {
  id: number;
  name: string;
  description: string | null;
  status: string;
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
