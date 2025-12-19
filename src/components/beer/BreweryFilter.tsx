"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

interface FilterOption {
  id: number;
  name: string;
}

interface BreweryFilterProps {
  prefectures: FilterOption[];
  currentQuery?: string;
  currentPrefecture?: string;
}

export function BreweryFilter({
  prefectures,
  currentQuery,
  currentPrefecture,
}: BreweryFilterProps) {
  const router = useRouter();
  const [query, setQuery] = useState(currentQuery || "");
  const [isComposing, setIsComposing] = useState(false);

  // 構造化URLを生成するか、クエリパラメータを使用するか判断
  const navigateWithFilter = useCallback(
    (newPrefecture?: string, newQuery?: string) => {
      // 単一フィルター（都道府県のみ）かつ検索クエリなしの場合は構造化URLへ
      if (newPrefecture && !newQuery) {
        router.push(`/breweries/prefecture/${newPrefecture}`);
        return;
      }

      // 検索クエリありの場合はクエリパラメータ
      const params = new URLSearchParams();
      if (newQuery) params.set("q", newQuery);
      if (newPrefecture) params.set("prefecture", newPrefecture);

      const queryString = params.toString();
      router.push(queryString ? `/breweries?${queryString}` : "/breweries");
    },
    [router]
  );

  const handlePrefectureChange = useCallback(
    (value: string) => {
      navigateWithFilter(value || undefined, currentQuery);
    },
    [navigateWithFilter, currentQuery]
  );

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (isComposing) return;
      navigateWithFilter(currentPrefecture, query || undefined);
    },
    [isComposing, query, navigateWithFilter, currentPrefecture]
  );

  const clearFilters = useCallback(() => {
    setQuery("");
    router.push("/breweries");
  }, [router]);

  const hasFilters = currentQuery || currentPrefecture;

  return (
    <div className="card bg-base-100 shadow mb-8">
      <div className="card-body">
        {/* 検索フォーム */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="join w-full">
            <input
              type="text"
              placeholder="ブルワリー名で検索..."
              className="input input-bordered join-item flex-1"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
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
          <SearchableSelect
            options={prefectures}
            value={currentPrefecture}
            onChange={handlePrefectureChange}
            label="都道府県"
            placeholder="都道府県を検索..."
            emptyLabel="すべての都道府県"
          />

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
