"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { FormSearchSelect } from "@/components/ui/FormSearchSelect";
import { createBeer, updateBeer } from "./actions";

interface Beer {
  id: number;
  name: string;
  breweryId: number | null;
  styleId: number | null;
  abv: string | null;
  ibu: number | null;
  shortDescription: string | null;
  description: string | null;
  imageUrl: string | null;
  status: string;
}

interface Props {
  beer?: Beer;
  breweries: { id: number; name: string }[];
  styles: { id: number; name: string }[];
}

export function BeerForm({ beer, breweries, styles }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!beer;

  const [name, setName] = useState(beer?.name || "");
  const [breweryId, setBreweryId] = useState<number | null>(
    beer?.breweryId || null
  );
  const [styleId, setStyleId] = useState<number | null>(beer?.styleId || null);
  const [abv, setAbv] = useState(beer?.abv || "");
  const [ibu, setIbu] = useState(beer?.ibu?.toString() || "");
  const [shortDescription, setShortDescription] = useState(
    beer?.shortDescription || ""
  );
  const [description, setDescription] = useState(beer?.description || "");
  const [imageUrl, setImageUrl] = useState<string | null>(
    beer?.imageUrl || null
  );
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("ビール名を入力してください");
      return;
    }

    if (!breweryId) {
      setError("ブルワリーを選択してください");
      return;
    }

    startTransition(async () => {
      const data = {
        name: name.trim(),
        breweryId,
        styleId,
        abv: abv || null,
        ibu: ibu ? parseInt(ibu) : null,
        shortDescription: shortDescription || null,
        description: description || null,
        imageUrl,
      };

      const result = isEdit
        ? await updateBeer(beer.id, data)
        : await createBeer(data);

      if (result.success) {
        router.push("/admin/beers");
      } else {
        const errorMessage =
          "error" in result && typeof result.error === "string"
            ? result.error
            : isEdit
              ? "更新に失敗しました"
              : "作成に失敗しました";
        setError(errorMessage);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* 基本情報 */}
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
        <legend className="fieldset-legend">基本情報</legend>

        <div className="space-y-4">
          {/* ビール名 */}
          <div>
            <label htmlFor="beer-name" className="label">
              <span className="text-base label-text">ビール名 *</span>
            </label>
            <input
              id="beer-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full input input-bordered"
              placeholder="例: よなよなエール"
              required
            />
          </div>

          {/* ブルワリー */}
          <div>
            <FormSearchSelect
              id="beer-brewery"
              options={breweries}
              value={breweryId?.toString() || ""}
              onChange={(value) =>
                setBreweryId(value ? parseInt(value, 10) : null)
              }
              label="ブルワリー *"
              placeholder="ブルワリーを検索..."
            />
          </div>

          {/* スタイル */}
          <div>
            <FormSearchSelect
              id="beer-style"
              options={styles}
              value={styleId?.toString() || ""}
              onChange={(value) =>
                setStyleId(value ? parseInt(value, 10) : null)
              }
              label="スタイル"
              placeholder="スタイルを検索..."
              clearable
            />
          </div>

          {/* ABV */}
          <div>
            <label htmlFor="beer-abv" className="label">
              <span className="text-base label-text">ABV (%)</span>
            </label>
            <input
              id="beer-abv"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={abv}
              onChange={(e) => setAbv(e.target.value)}
              className="w-full input input-bordered"
              placeholder="5.0"
            />
            <p className="text-sm text-base-content/60 mt-1">
              アルコール度数
            </p>
          </div>

          {/* IBU */}
          <div>
            <label htmlFor="beer-ibu" className="label">
              <span className="text-base label-text">IBU</span>
            </label>
            <input
              id="beer-ibu"
              type="number"
              min="0"
              max="200"
              value={ibu}
              onChange={(e) => setIbu(e.target.value)}
              className="w-full input input-bordered"
              placeholder="40"
            />
            <p className="text-sm text-base-content/60 mt-1">
              苦味の指標（International Bitterness Units）
            </p>
          </div>
        </div>
      </fieldset>

      {/* 説明 */}
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
        <legend className="fieldset-legend">説明</legend>

        <div className="space-y-4">
          {/* 短い説明 */}
          <div>
            <label htmlFor="beer-short-description" className="label">
              <span className="text-base label-text">短い説明</span>
            </label>
            <input
              id="beer-short-description"
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full input input-bordered"
              maxLength={100}
              placeholder="一覧ページやOGPに表示される短い説明..."
            />
            <p className="text-sm text-base-content/60 mt-1">
              一覧・メタデータ用、100文字以内
            </p>
          </div>

          {/* 詳細説明 */}
          <div>
            <label htmlFor="beer-description" className="label">
              <span className="text-base label-text">詳細説明</span>
            </label>
            <textarea
              id="beer-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full textarea textarea-bordered"
              rows={4}
              placeholder="ビールの詳細説明を入力..."
            />
          </div>
        </div>
      </fieldset>

      {/* 画像 */}
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
        <legend className="fieldset-legend">画像</legend>

        <ImageUploader
          category="beers"
          onUploadComplete={(url) => setImageUrl(url || null)}
          onUploadingChange={setIsUploading}
          currentImageUrl={imageUrl}
        />
      </fieldset>

      {/* ボタン */}
      <div className="flex gap-4 justify-end">
        <Link href="/admin/beers" className="btn btn-ghost">
          キャンセル
        </Link>
        <button type="submit" className="btn btn-primary" disabled={isPending || isUploading}>
          {isPending ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : isEdit ? (
            "保存"
          ) : (
            "作成"
          )}
        </button>
      </div>
    </form>
  );
}
