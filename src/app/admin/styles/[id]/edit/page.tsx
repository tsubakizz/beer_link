"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getStyleById, updateStyle } from "./actions";

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

export default function StyleEditPage() {
  const router = useRouter();
  const params = useParams();
  const styleId = Number(params.id);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [style, setStyle] = useState<Style | null>(null);

  // フォームの状態
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [otherNames, setOtherNames] = useState<string[]>([]);
  const [newOtherName, setNewOtherName] = useState("");

  // 味の特性
  const [bitterness, setBitterness] = useState<number | null>(null);
  const [sweetness, setSweetness] = useState<number | null>(null);
  const [body, setBody] = useState<number | null>(null);
  const [aroma, setAroma] = useState<number | null>(null);
  const [sourness, setSourness] = useState<number | null>(null);

  // スペック
  const [history, setHistory] = useState("");
  const [origin, setOrigin] = useState("");
  const [abvMin, setAbvMin] = useState("");
  const [abvMax, setAbvMax] = useState("");
  const [ibuMin, setIbuMin] = useState("");
  const [ibuMax, setIbuMax] = useState("");
  const [srmMin, setSrmMin] = useState("");
  const [srmMax, setSrmMax] = useState("");
  const [servingTempMin, setServingTempMin] = useState("");
  const [servingTempMax, setServingTempMax] = useState("");

  useEffect(() => {
    async function loadStyle() {
      const result = await getStyleById(styleId);
      if (result.success && "style" in result && result.style) {
        const s = result.style;
        setStyle(s);
        setName(s.name);
        setDescription(s.description || "");
        setShortDescription(s.shortDescription || "");
        setStatus(s.status);
        setOtherNames(s.otherNames);
        setBitterness(s.bitterness);
        setSweetness(s.sweetness);
        setBody(s.body);
        setAroma(s.aroma);
        setSourness(s.sourness);
        setHistory(s.history || "");
        setOrigin(s.origin || "");
        setAbvMin(s.abvMin || "");
        setAbvMax(s.abvMax || "");
        setIbuMin(s.ibuMin?.toString() || "");
        setIbuMax(s.ibuMax?.toString() || "");
        setSrmMin(s.srmMin?.toString() || "");
        setSrmMax(s.srmMax?.toString() || "");
        setServingTempMin(s.servingTempMin?.toString() || "");
        setServingTempMax(s.servingTempMax?.toString() || "");
      } else {
        setError("スタイルが見つかりません");
      }
      setLoading(false);
    }
    loadStyle();
  }, [styleId]);

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
      const result = await updateStyle(styleId, {
        name: name.trim(),
        description: description || null,
        shortDescription: shortDescription || null,
        status,
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
      });

      if (result.success) {
        router.push("/admin/styles");
      } else {
        setError("error" in result && result.error ? result.error : "更新に失敗しました");
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!style) {
    return (
      <div className="text-center py-12">
        <p className="text-error mb-4">{error || "スタイルが見つかりません"}</p>
        <Link href="/admin/styles" className="btn btn-ghost">
          一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* パンくずリスト */}
      <div className="breadcrumbs text-sm mb-6">
        <ul>
          <li><Link href="/admin">管理画面</Link></li>
          <li><Link href="/admin/styles">スタイル管理</Link></li>
          <li>編集</li>
        </ul>
      </div>

      <h1 className="text-3xl font-bold mb-8">スタイルを編集</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        {/* 基本情報 */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title mb-4">基本情報</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* 発祥地 */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">発祥地</span>
                </label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="input input-bordered"
                  placeholder="例：ドイツ"
                />
              </div>

              {/* 短い説明 */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">短い説明（一覧用・100文字以内）</span>
                </label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="input input-bordered"
                  maxLength={100}
                  placeholder="一覧ページ用の短い説明"
                />
              </div>
            </div>

            {/* 説明 */}
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">説明</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea textarea-bordered"
                rows={4}
                placeholder="スタイルの詳細な説明を入力..."
              />
            </div>

            {/* 歴史 */}
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">歴史・起源</span>
              </label>
              <textarea
                value={history}
                onChange={(e) => setHistory(e.target.value)}
                className="textarea textarea-bordered"
                rows={4}
                placeholder="スタイルの歴史や起源について..."
              />
            </div>
          </div>
        </div>

        {/* 別名 */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title mb-4">別名</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {otherNames.map((otherName, index) => (
                <span key={index} className="badge badge-lg gap-2">
                  {otherName}
                  <button
                    type="button"
                    onClick={() => setOtherNames(otherNames.filter((_, i) => i !== index))}
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
          </div>
        </div>

        {/* 味の特性 */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title mb-4">味の特性（1-5）</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <FlavorInput label="苦味" value={bitterness} onChange={setBitterness} />
              <FlavorInput label="甘味" value={sweetness} onChange={setSweetness} />
              <FlavorInput label="ボディ" value={body} onChange={setBody} />
              <FlavorInput label="香り" value={aroma} onChange={setAroma} />
              <FlavorInput label="酸味" value={sourness} onChange={setSourness} />
            </div>
          </div>
        </div>

        {/* スペック */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title mb-4">スペック</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* ABV */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">ABV（%）</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={abvMin}
                    onChange={(e) => setAbvMin(e.target.value)}
                    className="input input-bordered input-sm w-20"
                    placeholder="最小"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    step="0.1"
                    value={abvMax}
                    onChange={(e) => setAbvMax(e.target.value)}
                    className="input input-bordered input-sm w-20"
                    placeholder="最大"
                  />
                </div>
              </div>

              {/* IBU */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">IBU</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={ibuMin}
                    onChange={(e) => setIbuMin(e.target.value)}
                    className="input input-bordered input-sm w-20"
                    placeholder="最小"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    value={ibuMax}
                    onChange={(e) => setIbuMax(e.target.value)}
                    className="input input-bordered input-sm w-20"
                    placeholder="最大"
                  />
                </div>
              </div>

              {/* SRM */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">SRM</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={srmMin}
                    onChange={(e) => setSrmMin(e.target.value)}
                    className="input input-bordered input-sm w-20"
                    placeholder="最小"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    value={srmMax}
                    onChange={(e) => setSrmMax(e.target.value)}
                    className="input input-bordered input-sm w-20"
                    placeholder="最大"
                  />
                </div>
              </div>

              {/* 適温 */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">適温（°C）</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={servingTempMin}
                    onChange={(e) => setServingTempMin(e.target.value)}
                    className="input input-bordered input-sm w-20"
                    placeholder="最小"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    value={servingTempMax}
                    onChange={(e) => setServingTempMax(e.target.value)}
                    className="input input-bordered input-sm w-20"
                    placeholder="最大"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ボタン */}
        <div className="flex gap-4 justify-end">
          <Link href="/admin/styles" className="btn btn-ghost">
            キャンセル
          </Link>
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
  );
}

function FlavorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
        className="select select-bordered select-sm"
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
