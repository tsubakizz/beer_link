"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

interface FilterOption {
  id: number;
  name: string;
}

interface BeerFilterProps {
  styles: FilterOption[];
  breweries: FilterOption[];
  currentQuery?: string;
  currentStyle?: string;
  currentBrewery?: string;
}

export function BeerFilter({
  styles,
  breweries,
  currentQuery,
  currentStyle,
  currentBrewery,
}: BeerFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(currentQuery || "");

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/beers?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      updateFilter("q", query);
    },
    [query, updateFilter]
  );

  const clearFilters = useCallback(() => {
    setQuery("");
    router.push("/beers");
  }, [router]);

  const hasFilters = currentQuery || currentStyle || currentBrewery;

  return (
    <div className="card bg-base-100 shadow mb-8">
      <div className="card-body">
        {/* 検索フォーム */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="join w-full">
            <input
              type="text"
              placeholder="ビール名で検索..."
              className="input input-bordered join-item flex-1"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary join-item">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </form>

        {/* フィルター */}
        <div className="flex flex-wrap gap-4">
          <div className="form-control w-full sm:w-auto sm:min-w-48">
            <label className="label">
              <span className="label-text">ビアスタイル</span>
            </label>
            <select
              className="select select-bordered"
              value={currentStyle || ""}
              onChange={(e) => updateFilter("style", e.target.value)}
            >
              <option value="">すべてのスタイル</option>
              {styles.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control w-full sm:w-auto sm:min-w-48">
            <label className="label">
              <span className="label-text">ブルワリー</span>
            </label>
            <select
              className="select select-bordered"
              value={currentBrewery || ""}
              onChange={(e) => updateFilter("brewery", e.target.value)}
            >
              <option value="">すべてのブルワリー</option>
              {breweries.map((brewery) => (
                <option key={brewery.id} value={brewery.id}>
                  {brewery.name}
                </option>
              ))}
            </select>
          </div>

          {hasFilters && (
            <div className="form-control justify-end">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={clearFilters}
              >
                フィルターをクリア
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
