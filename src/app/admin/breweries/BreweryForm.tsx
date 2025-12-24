"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { FormSearchSelect } from "@/components/ui/FormSearchSelect";
import { createBrewery, updateBrewery } from "./actions";

interface Brewery {
  id: number;
  name: string;
  shortDescription: string | null;
  description: string | null;
  prefectureId: number | null;
  address: string | null;
  websiteUrl: string | null;
  imageUrl: string | null;
  imageSourceUrl: string | null;
  status: string;
}

interface Props {
  brewery?: Brewery;
  prefectures: { id: number; name: string }[];
}

export function BreweryForm({ brewery, prefectures }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!brewery;

  const [name, setName] = useState(brewery?.name || "");
  const [shortDescription, setShortDescription] = useState(
    brewery?.shortDescription || ""
  );
  const [description, setDescription] = useState(brewery?.description || "");
  const [prefectureId, setPrefectureId] = useState<number | null>(
    brewery?.prefectureId || null
  );
  const [address, setAddress] = useState(brewery?.address || "");
  const [websiteUrl, setWebsiteUrl] = useState(brewery?.websiteUrl || "");
  const [imageUrl, setImageUrl] = useState<string | null>(
    brewery?.imageUrl || null
  );
  const [imageSourceUrl, setImageSourceUrl] = useState(
    brewery?.imageSourceUrl || ""
  );
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("ブルワリー名を入力してください");
      return;
    }

    startTransition(async () => {
      const data = {
        name: name.trim(),
        shortDescription: shortDescription || null,
        description: description || null,
        prefectureId,
        address: address || null,
        websiteUrl: websiteUrl || null,
        imageUrl,
        imageSourceUrl: imageSourceUrl || null,
      };

      const result = isEdit
        ? await updateBrewery(brewery.id, data)
        : await createBrewery(data);

      if (result.success) {
        router.push("/admin/breweries");
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
          {/* ブルワリー名 */}
          <div>
            <label htmlFor="brewery-name" className="label">
              <span className="text-base label-text">ブルワリー名 *</span>
            </label>
            <input
              id="brewery-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full input input-bordered"
              placeholder="例: よなよなエール醸造所"
              required
            />
          </div>

          {/* 都道府県 */}
          <div>
            <FormSearchSelect
              id="brewery-prefecture"
              options={prefectures}
              value={prefectureId?.toString() || ""}
              onChange={(value) =>
                setPrefectureId(value ? parseInt(value, 10) : null)
              }
              label="都道府県"
              placeholder="都道府県を検索..."
              clearable
              maxResults={50}
            />
          </div>

          {/* 住所 */}
          <div>
            <label htmlFor="brewery-address" className="label">
              <span className="text-base label-text">住所（都道府県以降）</span>
            </label>
            <input
              id="brewery-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full input input-bordered"
              placeholder="渋谷区恵比寿南1-1-1"
            />
            <p className="text-sm text-base-content/60 mt-1">
              都道府県は上で選択してください。表示時に自動で結合されます。
            </p>
          </div>

          {/* Webサイト */}
          <div>
            <label htmlFor="brewery-website" className="label">
              <span className="text-base label-text">Webサイト</span>
            </label>
            <input
              id="brewery-website"
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full input input-bordered"
              placeholder="https://..."
            />
          </div>
        </div>
      </fieldset>

      {/* 説明 */}
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
        <legend className="fieldset-legend">説明</legend>

        <div className="space-y-4">
          {/* 短い説明 */}
          <div>
            <label htmlFor="brewery-short-description" className="label">
              <span className="text-base label-text">短い説明</span>
            </label>
            <input
              id="brewery-short-description"
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
            <label htmlFor="brewery-description" className="label">
              <span className="text-base label-text">詳細説明</span>
            </label>
            <textarea
              id="brewery-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full textarea textarea-bordered"
              rows={4}
              placeholder="ブルワリーの詳細説明を入力..."
            />
          </div>
        </div>
      </fieldset>

      {/* 画像 */}
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
        <legend className="fieldset-legend">画像</legend>

        <div className="space-y-4">
          <ImageUploader
            category="breweries"
            onUploadComplete={(url) => setImageUrl(url || null)}
            onUploadingChange={setIsUploading}
            currentImageUrl={imageUrl}
          />

          {/* 画像参照元URL */}
          <div>
            <label htmlFor="brewery-image-source" className="label">
              <span className="text-base label-text">画像参照元URL</span>
            </label>
            <input
              id="brewery-image-source"
              type="url"
              value={imageSourceUrl}
              onChange={(e) => setImageSourceUrl(e.target.value)}
              className="w-full input input-bordered"
              placeholder="https://..."
            />
            <p className="text-sm text-base-content/60 mt-1">
              外部サイトから画像を使用する場合、出典元のURLを入力してください
            </p>
          </div>
        </div>
      </fieldset>

      {/* ボタン */}
      <div className="flex gap-4 justify-end">
        <Link href="/admin/breweries" className="btn btn-ghost">
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
