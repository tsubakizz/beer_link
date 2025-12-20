"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createStyle, updateStyle } from "./[id]/edit/actions";

interface Style {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  bitterness: number | null;
  sweetness: number | null;
  body: number | null;
  aroma: number | null;
  sourness: number | null;
  history: string | null;
  origin: string | null;
  abvMin: string | null;
  abvMax: string | null;
  ibuMin: number | null;
  ibuMax: number | null;
  srmMin: number | null;
  srmMax: number | null;
  servingTempMin: number | null;
  servingTempMax: number | null;
  status: string;
  otherNames: string[];
}

interface Props {
  style?: Style;
}

export function StyleForm({ style }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!style;

  // 基本情報
  const [name, setName] = useState(style?.name || "");
  const [origin, setOrigin] = useState(style?.origin || "");
  const [shortDescription, setShortDescription] = useState(
    style?.shortDescription || ""
  );
  const [description, setDescription] = useState(style?.description || "");
  const [history, setHistory] = useState(style?.history || "");

  // 別名
  const [otherNames, setOtherNames] = useState<string[]>(
    style?.otherNames || []
  );
  const [newOtherName, setNewOtherName] = useState("");

  // 味の特性
  const [bitterness, setBitterness] = useState<number | null>(
    style?.bitterness ?? null
  );
  const [sweetness, setSweetness] = useState<number | null>(
    style?.sweetness ?? null
  );
  const [body, setBody] = useState<number | null>(style?.body ?? null);
  const [aroma, setAroma] = useState<number | null>(style?.aroma ?? null);
  const [sourness, setSourness] = useState<number | null>(
    style?.sourness ?? null
  );

  // スペック
  const [abvMin, setAbvMin] = useState(style?.abvMin || "");
  const [abvMax, setAbvMax] = useState(style?.abvMax || "");
  const [ibuMin, setIbuMin] = useState(style?.ibuMin?.toString() || "");
  const [ibuMax, setIbuMax] = useState(style?.ibuMax?.toString() || "");
  const [srmMin, setSrmMin] = useState(style?.srmMin?.toString() || "");
  const [srmMax, setSrmMax] = useState(style?.srmMax?.toString() || "");
  const [servingTempMin, setServingTempMin] = useState(
    style?.servingTempMin?.toString() || ""
  );
  const [servingTempMax, setServingTempMax] = useState(
    style?.servingTempMax?.toString() || ""
  );

  const handleAddOtherName = () => {
    if (newOtherName.trim() && !otherNames.includes(newOtherName.trim())) {
      setOtherNames([...otherNames, newOtherName.trim()]);
      setNewOtherName("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("スタイル名を入力してください");
      return;
    }

    startTransition(async () => {
      const data = {
        name: name.trim(),
        description: description || null,
        shortDescription: shortDescription || null,
        otherNames,
        bitterness,
        sweetness,
        body,
        aroma,
        sourness,
        history: history || null,
        origin: origin || null,
        abvMin: abvMin || null,
        abvMax: abvMax || null,
        ibuMin: ibuMin ? parseInt(ibuMin) : null,
        ibuMax: ibuMax ? parseInt(ibuMax) : null,
        srmMin: srmMin ? parseInt(srmMin) : null,
        srmMax: srmMax ? parseInt(srmMax) : null,
        servingTempMin: servingTempMin ? parseInt(servingTempMin) : null,
        servingTempMax: servingTempMax ? parseInt(servingTempMax) : null,
      };

      const result = isEdit
        ? await updateStyle(style.id, data)
        : await createStyle(data);

      if (result.success) {
        router.push("/admin/styles");
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
          {/* スタイル名 */}
          <div>
            <label htmlFor="style-name" className="label">
              <span className="text-base label-text">スタイル名 *</span>
            </label>
            <input
              id="style-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full input input-bordered"
              placeholder="例: ペールエール"
              required
            />
          </div>

          {/* 発祥地 */}
          <div>
            <label htmlFor="style-origin" className="label">
              <span className="text-base label-text">発祥地</span>
            </label>
            <input
              id="style-origin"
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full input input-bordered"
              placeholder="例: イギリス"
            />
          </div>

          {/* 短い説明 */}
          <div>
            <label htmlFor="style-short-description" className="label">
              <span className="text-base label-text">短い説明</span>
            </label>
            <input
              id="style-short-description"
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full input input-bordered"
              maxLength={100}
              placeholder="一覧ページ用の短い説明"
            />
            <p className="text-sm text-base-content/60 mt-1">
              一覧用・100文字以内
            </p>
          </div>

          {/* 説明 */}
          <div>
            <label htmlFor="style-description" className="label">
              <span className="text-base label-text">説明</span>
            </label>
            <textarea
              id="style-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full textarea textarea-bordered"
              rows={4}
              placeholder="スタイルの詳細な説明を入力..."
            />
          </div>

          {/* 歴史 */}
          <div>
            <label htmlFor="style-history" className="label">
              <span className="text-base label-text">歴史・起源</span>
            </label>
            <textarea
              id="style-history"
              value={history}
              onChange={(e) => setHistory(e.target.value)}
              className="w-full textarea textarea-bordered"
              rows={4}
              placeholder="スタイルの歴史や起源について..."
            />
          </div>
        </div>
      </fieldset>

      {/* 別名 */}
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
        <legend className="fieldset-legend">別名</legend>

        <div className="flex flex-wrap gap-2 mb-4">
          {otherNames.map((otherName, index) => (
            <span key={index} className="badge badge-lg gap-2">
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
            id="style-other-name"
            type="text"
            value={newOtherName}
            onChange={(e) => setNewOtherName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddOtherName();
              }
            }}
            className="input input-bordered flex-1"
            placeholder="別名を入力してEnterまたは追加ボタン"
          />
          <button
            type="button"
            onClick={handleAddOtherName}
            className="btn btn-outline"
          >
            追加
          </button>
        </div>
      </fieldset>

      {/* 味の特性 */}
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
        <legend className="fieldset-legend">味の特性（1-5）</legend>

        <div className="space-y-4">
          <FlavorInput id="style-bitterness" label="苦味" value={bitterness} onChange={setBitterness} />
          <FlavorInput id="style-sweetness" label="甘味" value={sweetness} onChange={setSweetness} />
          <FlavorInput id="style-body" label="ボディ" value={body} onChange={setBody} />
          <FlavorInput id="style-aroma" label="香り" value={aroma} onChange={setAroma} />
          <FlavorInput id="style-sourness" label="酸味" value={sourness} onChange={setSourness} />
        </div>
      </fieldset>

      {/* スペック */}
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
        <legend className="fieldset-legend">スペック</legend>

        <div className="space-y-4">
          {/* ABV */}
          <div>
            <label htmlFor="style-abv-min" className="label">
              <span className="text-base label-text">ABV（%）</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                id="style-abv-min"
                type="number"
                step="0.1"
                value={abvMin}
                onChange={(e) => setAbvMin(e.target.value)}
                className="input input-bordered w-24"
                placeholder="最小"
              />
              <span>-</span>
              <input
                id="style-abv-max"
                type="number"
                step="0.1"
                value={abvMax}
                onChange={(e) => setAbvMax(e.target.value)}
                className="input input-bordered w-24"
                placeholder="最大"
              />
            </div>
            <p className="text-sm text-base-content/60 mt-1">
              アルコール度数の範囲
            </p>
          </div>

          {/* IBU */}
          <div>
            <label htmlFor="style-ibu-min" className="label">
              <span className="text-base label-text">IBU</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                id="style-ibu-min"
                type="number"
                value={ibuMin}
                onChange={(e) => setIbuMin(e.target.value)}
                className="input input-bordered w-24"
                placeholder="最小"
              />
              <span>-</span>
              <input
                id="style-ibu-max"
                type="number"
                value={ibuMax}
                onChange={(e) => setIbuMax(e.target.value)}
                className="input input-bordered w-24"
                placeholder="最大"
              />
            </div>
            <p className="text-sm text-base-content/60 mt-1">
              苦味の指標（International Bitterness Units）
            </p>
          </div>

          {/* SRM */}
          <div>
            <label htmlFor="style-srm-min" className="label">
              <span className="text-base label-text">SRM</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                id="style-srm-min"
                type="number"
                value={srmMin}
                onChange={(e) => setSrmMin(e.target.value)}
                className="input input-bordered w-24"
                placeholder="最小"
              />
              <span>-</span>
              <input
                id="style-srm-max"
                type="number"
                value={srmMax}
                onChange={(e) => setSrmMax(e.target.value)}
                className="input input-bordered w-24"
                placeholder="最大"
              />
            </div>
            <p className="text-sm text-base-content/60 mt-1">
              色の濃さ（Standard Reference Method）
            </p>
          </div>

          {/* 適温 */}
          <div>
            <label htmlFor="style-serving-temp-min" className="label">
              <span className="text-base label-text">適温（°C）</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                id="style-serving-temp-min"
                type="number"
                value={servingTempMin}
                onChange={(e) => setServingTempMin(e.target.value)}
                className="input input-bordered w-24"
                placeholder="最小"
              />
              <span>-</span>
              <input
                id="style-serving-temp-max"
                type="number"
                value={servingTempMax}
                onChange={(e) => setServingTempMax(e.target.value)}
                className="input input-bordered w-24"
                placeholder="最大"
              />
            </div>
            <p className="text-sm text-base-content/60 mt-1">
              推奨の提供温度
            </p>
          </div>
        </div>
      </fieldset>

      {/* ボタン */}
      <div className="flex gap-4 justify-end">
        <Link href="/admin/styles" className="btn btn-ghost">
          キャンセル
        </Link>
        <button type="submit" className="btn btn-primary" disabled={isPending}>
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

function FlavorInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="label">
        <span className="text-base label-text">{label}</span>
      </label>
      <select
        id={id}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
        className="w-full select select-bordered"
      >
        <option value="">未設定</option>
        <option value="1">1（弱め）</option>
        <option value="2">2（やや弱め）</option>
        <option value="3">3（普通）</option>
        <option value="4">4（やや強め）</option>
        <option value="5">5（強め）</option>
      </select>
    </div>
  );
}
