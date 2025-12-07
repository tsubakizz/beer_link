"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { submitBeer } from "./actions";

interface BeerSubmitFormProps {
  breweries: { id: number; name: string }[];
  styles: { id: number; name: string }[];
}

export function BeerSubmitForm({ breweries, styles }: BeerSubmitFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState("");
  const [breweryId, setBreweryId] = useState("");
  const [brewerySearch, setBrewerySearch] = useState("");
  const [styleId, setStyleId] = useState("");
  const [styleSearch, setStyleSearch] = useState("");
  const [showBreweryDropdown, setShowBreweryDropdown] = useState(false);
  const [showStyleDropdown, setShowStyleDropdown] = useState(false);

  // ブルワリーのフィルタリング
  const filteredBreweries = useMemo(() => {
    if (!brewerySearch) return breweries;
    const search = brewerySearch.toLowerCase();
    return breweries.filter((b) => b.name.toLowerCase().includes(search));
  }, [breweries, brewerySearch]);

  // スタイルのフィルタリング
  const filteredStyles = useMemo(() => {
    if (!styleSearch) return styles;
    const search = styleSearch.toLowerCase();
    return styles.filter((s) => s.name.toLowerCase().includes(search));
  }, [styles, styleSearch]);

  const selectedBrewery = breweries.find((b) => b.id.toString() === breweryId);
  const selectedStyle = styles.find((s) => s.id.toString() === styleId);

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
      const result = await submitBeer({
        name: name.trim(),
        breweryId: parseInt(breweryId, 10),
        styleId: styleId ? parseInt(styleId, 10) : null,
      });

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || "追加に失敗しました");
      }
    });
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🍺</div>
        <h2 className="text-2xl font-bold mb-2">ビールを追加しました</h2>
        <p className="text-base-content/70 mb-6">
          ビール一覧に掲載されました。
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => {
              setSuccess(false);
              setName("");
              setBreweryId("");
              setBrewerySearch("");
              setStyleId("");
              setStyleSearch("");
            }}
            className="btn btn-primary"
          >
            続けて追加
          </button>
          <button onClick={() => router.push("/beers")} className="btn btn-ghost">
            ビール一覧へ
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          className="input input-bordered w-full"
          placeholder="例：よなよなエール"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
      </div>

      {/* ブルワリー（ライブサーチ） */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">ブルワリー *</span>
        </label>
        <div className="relative">
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="ブルワリー名で検索..."
            value={selectedBrewery ? selectedBrewery.name : brewerySearch}
            onChange={(e) => {
              setBrewerySearch(e.target.value);
              setBreweryId("");
              setShowBreweryDropdown(true);
            }}
            onFocus={() => setShowBreweryDropdown(true)}
            onBlur={() => setTimeout(() => setShowBreweryDropdown(false), 200)}
          />
          {showBreweryDropdown && (
            <ul className="absolute z-10 w-full bg-base-100 border border-base-300 rounded-box shadow-lg mt-1 max-h-48 overflow-y-auto">
              {filteredBreweries.length > 0 ? (
                filteredBreweries.slice(0, 10).map((brewery) => (
                  <li key={brewery.id}>
                    <button
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-base-200"
                      onClick={() => {
                        setBreweryId(brewery.id.toString());
                        setBrewerySearch("");
                        setShowBreweryDropdown(false);
                      }}
                    >
                      {brewery.name}
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-base-content/60">
                  該当するブルワリーがありません
                </li>
              )}
            </ul>
          )}
        </div>
        <label className="label">
          <span className="label-text-alt">
            見つからない場合は{" "}
            <Link href="/submit/brewery" className="link link-primary">
              ブルワリーを追加
            </Link>
          </span>
        </label>
      </div>

      {/* ビアスタイル（任意・ライブサーチ） */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">ビアスタイル（任意）</span>
        </label>
        <div className="relative">
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="スタイル名で検索..."
            value={selectedStyle ? selectedStyle.name : styleSearch}
            onChange={(e) => {
              setStyleSearch(e.target.value);
              setStyleId("");
              setShowStyleDropdown(true);
            }}
            onFocus={() => setShowStyleDropdown(true)}
            onBlur={() => setTimeout(() => setShowStyleDropdown(false), 200)}
          />
          {selectedStyle && (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs"
              onClick={() => {
                setStyleId("");
                setStyleSearch("");
              }}
            >
              ✕
            </button>
          )}
          {showStyleDropdown && (
            <ul className="absolute z-10 w-full bg-base-100 border border-base-300 rounded-box shadow-lg mt-1 max-h-48 overflow-y-auto">
              {filteredStyles.length > 0 ? (
                filteredStyles.slice(0, 10).map((style) => (
                  <li key={style.id}>
                    <button
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-base-200"
                      onClick={() => {
                        setStyleId(style.id.toString());
                        setStyleSearch("");
                        setShowStyleDropdown(false);
                      }}
                    >
                      {style.name}
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-base-content/60">
                  該当するスタイルがありません
                </li>
              )}
            </ul>
          )}
        </div>
        <label className="label">
          <span className="label-text-alt">
            見つからない場合は{" "}
            <Link href="/submit/style" className="link link-primary">
              スタイルを追加
            </Link>
          </span>
        </label>
      </div>

      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={isPending}
      >
        {isPending ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : (
          "追加する"
        )}
      </button>
    </form>
  );
}
