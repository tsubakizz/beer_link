"use client";

import { useState, useTransition, useMemo } from "react";
import { updateBeer } from "./actions";
import { ImageUploader } from "@/components/ui/ImageUploader";

interface Beer {
  id: number;
  name: string;
  shortDescription: string | null;
  description: string | null;
  abv: string | null;
  ibu: number | null;
  imageUrl: string | null;
  status: string;
  brewery: { id: number | null; name: string | null } | null;
  style: { id: number | null; name: string | null } | null;
}

interface Props {
  beer: Beer;
  styles: { id: number; name: string }[];
  breweries: { id: number; name: string }[];
  onClose: () => void;
}

export function BeerEditModal({ beer, styles, breweries, onClose }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(beer.name);
  const [breweryId, setBreweryId] = useState<number | null>(beer.brewery?.id || null);
  const [styleId, setStyleId] = useState<number | null>(beer.style?.id || null);
  const [abv, setAbv] = useState(beer.abv || "");
  const [ibu, setIbu] = useState(beer.ibu?.toString() || "");
  const [shortDescription, setShortDescription] = useState(beer.shortDescription || "");
  const [description, setDescription] = useState(beer.description || "");
  const [status, setStatus] = useState(beer.status);
  const [imageUrl, setImageUrl] = useState<string | null>(beer.imageUrl);

  // ブルワリー検索
  const [brewerySearch, setBrewerySearch] = useState("");
  const [isBreweryDropdownOpen, setIsBreweryDropdownOpen] = useState(false);
  const selectedBrewery = breweries.find((b) => b.id === breweryId);

  const filteredBreweries = useMemo(() => {
    if (!brewerySearch) return breweries;
    const search = brewerySearch.toLowerCase();
    return breweries.filter((b) => b.name.toLowerCase().includes(search));
  }, [breweries, brewerySearch]);

  // スタイル検索
  const [styleSearch, setStyleSearch] = useState("");
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
  const selectedStyle = styles.find((s) => s.id === styleId);

  const filteredStyles = useMemo(() => {
    if (!styleSearch) return styles;
    const search = styleSearch.toLowerCase();
    return styles.filter((s) => s.name.toLowerCase().includes(search));
  }, [styles, styleSearch]);

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
      const result = await updateBeer(beer.id, {
        name: name.trim(),
        breweryId,
        styleId,
        abv: abv || null,
        ibu: ibu ? parseInt(ibu) : null,
        shortDescription: shortDescription || null,
        description: description || null,
        status,
        imageUrl,
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
        <h3 className="font-bold text-lg mb-4">ビールを編集</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          {/* ビール名 */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">ビール名 *</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input input-bordered"
              required
            />
          </div>

          {/* ブルワリー */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">ブルワリー *</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={isBreweryDropdownOpen ? brewerySearch : (selectedBrewery?.name || "")}
                onChange={(e) => {
                  setBrewerySearch(e.target.value);
                  setIsBreweryDropdownOpen(true);
                }}
                onFocus={() => setIsBreweryDropdownOpen(true)}
                placeholder="ブルワリーを検索..."
                className="input input-bordered w-full"
              />
              {isBreweryDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsBreweryDropdownOpen(false)}
                  />
                  <ul className="absolute z-20 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredBreweries.map((brewery) => (
                      <li key={brewery.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setBreweryId(brewery.id);
                            setBrewerySearch("");
                            setIsBreweryDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-2 text-left hover:bg-base-200 ${breweryId === brewery.id ? "bg-primary/10" : ""}`}
                        >
                          {brewery.name}
                        </button>
                      </li>
                    ))}
                    {filteredBreweries.length === 0 && (
                      <li className="px-4 py-2 text-base-content/50">
                        見つかりませんでした
                      </li>
                    )}
                  </ul>
                </>
              )}
            </div>
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
                className="input input-bordered w-full"
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
                          setStyleId(null);
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
                            setStyleId(style.id);
                            setStyleSearch("");
                            setIsStyleDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-2 text-left hover:bg-base-200 ${styleId === style.id ? "bg-primary/10" : ""}`}
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
                value={abv}
                onChange={(e) => setAbv(e.target.value)}
                className="input input-bordered"
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
                value={ibu}
                onChange={(e) => setIbu(e.target.value)}
                className="input input-bordered"
                placeholder="40"
              />
            </div>
          </div>

          {/* 短い説明 */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">短い説明（一覧・メタデータ用、100文字以内）</span>
            </label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="input input-bordered"
              maxLength={100}
              placeholder="一覧ページやOGPに表示される短い説明..."
            />
          </div>

          {/* 説明 */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">詳細説明</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea textarea-bordered"
              rows={3}
              placeholder="ビールの詳細説明を入力..."
            />
          </div>

          {/* 画像 */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">画像</span>
            </label>
            <ImageUploader
              category="beers"
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
