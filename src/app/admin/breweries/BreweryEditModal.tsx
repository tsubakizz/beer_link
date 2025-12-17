"use client";

import { useState, useTransition } from "react";
import { updateBrewery } from "./actions";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { FormSearchSelect } from "@/components/ui/FormSearchSelect";

interface Brewery {
  id: number;
  name: string;
  description: string | null;
  prefectureId: number | null;
  address: string | null;
  websiteUrl: string | null;
  imageUrl: string | null;
  status: string;
}

interface Props {
  brewery: Brewery;
  prefectures: { id: number; name: string }[];
  onClose: () => void;
}

export function BreweryEditModal({ brewery, prefectures, onClose }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(brewery.name);
  const [description, setDescription] = useState(brewery.description || "");
  const [prefectureId, setPrefectureId] = useState<number | null>(brewery.prefectureId);
  const [address, setAddress] = useState(brewery.address || "");
  const [websiteUrl, setWebsiteUrl] = useState(brewery.websiteUrl || "");
  const [imageUrl, setImageUrl] = useState<string | null>(brewery.imageUrl);
  const [status, setStatus] = useState(brewery.status);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("ブルワリー名を入力してください");
      return;
    }

    startTransition(async () => {
      const result = await updateBrewery(brewery.id, {
        name: name.trim(),
        description: description || null,
        prefectureId,
        address: address || null,
        websiteUrl: websiteUrl || null,
        imageUrl,
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
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-4">ブルワリーを編集</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          {/* ブルワリー名 */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">ブルワリー名 *</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input input-bordered"
              required
            />
          </div>

          {/* 都道府県 */}
          <FormSearchSelect
            options={prefectures}
            value={prefectureId?.toString() || ""}
            onChange={(value) => setPrefectureId(value ? parseInt(value, 10) : null)}
            label="都道府県"
            placeholder="都道府県を検索..."
            clearable
          />

          {/* 住所 */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">住所</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input input-bordered"
              placeholder="〒000-0000 東京都..."
            />
          </div>

          {/* Webサイト */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Webサイト</span>
            </label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="input input-bordered"
              placeholder="https://..."
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
              rows={3}
              placeholder="ブルワリーの説明を入力..."
            />
          </div>

          {/* 画像 */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">画像</span>
            </label>
            <ImageUploader
              category="breweries"
              onUploadComplete={(url) => setImageUrl(url || null)}
              currentImageUrl={imageUrl}
              aspectRatio="square"
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
