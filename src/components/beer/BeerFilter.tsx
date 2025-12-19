"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

interface FilterOption {
  id: number;
  name: string;
}

interface StyleOption extends FilterOption {
  slug?: string;
  otherNames?: string[];
}

interface BeerFilterProps {
  styles: StyleOption[];
  breweries: FilterOption[];
  prefectures?: FilterOption[];
  currentQuery?: string;
  currentStyle?: string;
  currentBrewery?: string;
  currentPrefecture?: string;
}

export function BeerFilter({
  styles,
  breweries,
  prefectures,
  currentQuery,
  currentStyle,
  currentBrewery,
  currentPrefecture,
}: BeerFilterProps) {
  const router = useRouter();
  const [query, setQuery] = useState(currentQuery || "");
  const [isComposing, setIsComposing] = useState(false);

  // 構造化URLを生成するか、クエリパラメータを使用するか判断
  const navigateWithFilter = useCallback(
    (
      newStyle?: string,
      newBrewery?: string,
      newPrefecture?: string,
      newQuery?: string
    ) => {
      // アクティブなフィルター数をカウント
      const activeFilters = [newStyle, newBrewery, newPrefecture, newQuery].filter(
        Boolean
      ).length;

      // 単一フィルターかつ検索クエリなしの場合は構造化URLへ
      if (activeFilters === 1 && !newQuery) {
        if (newStyle) {
          const style = styles.find((s) => String(s.id) === newStyle);
          if (style?.slug) {
            router.push(`/beers/style/${style.slug}`);
            return;
          }
        }
        if (newBrewery) {
          router.push(`/beers/brewery/${newBrewery}`);
          return;
        }
        if (newPrefecture) {
          router.push(`/beers/prefecture/${newPrefecture}`);
          return;
        }
      }

      // 複数フィルターまたは検索クエリありの場合はクエリパラメータ
      const params = new URLSearchParams();
      if (newQuery) params.set("q", newQuery);
      if (newStyle) params.set("style", newStyle);
      if (newBrewery) params.set("brewery", newBrewery);
      if (newPrefecture) params.set("prefecture", newPrefecture);

      const queryString = params.toString();
      router.push(queryString ? `/beers?${queryString}` : "/beers");
    },
    [router, styles]
  );

  const handleStyleChange = useCallback(
    (value: string) => {
      navigateWithFilter(
        value || undefined,
        currentBrewery,
        currentPrefecture,
        currentQuery
      );
    },
    [navigateWithFilter, currentBrewery, currentPrefecture, currentQuery]
  );

  const handleBreweryChange = useCallback(
    (value: string) => {
      navigateWithFilter(
        currentStyle,
        value || undefined,
        currentPrefecture,
        currentQuery
      );
    },
    [navigateWithFilter, currentStyle, currentPrefecture, currentQuery]
  );

  const handlePrefectureChange = useCallback(
    (value: string) => {
      navigateWithFilter(
        currentStyle,
        currentBrewery,
        value || undefined,
        currentQuery
      );
    },
    [navigateWithFilter, currentStyle, currentBrewery, currentQuery]
  );

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (isComposing) return;
      navigateWithFilter(
        currentStyle,
        currentBrewery,
        currentPrefecture,
        query || undefined
      );
    },
    [
      isComposing,
      query,
      navigateWithFilter,
      currentStyle,
      currentBrewery,
      currentPrefecture,
    ]
  );

  const clearFilters = useCallback(() => {
    setQuery("");
    router.push("/beers");
  }, [router]);

  const hasFilters =
    currentQuery || currentStyle || currentBrewery || currentPrefecture;

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
            options={styles}
            value={currentStyle}
            onChange={handleStyleChange}
            label="ビアスタイル"
            placeholder="スタイルを検索..."
            emptyLabel="すべてのスタイル"
          />

          <SearchableSelect
            options={breweries}
            value={currentBrewery}
            onChange={handleBreweryChange}
            label="ブルワリー"
            placeholder="ブルワリーを検索..."
            emptyLabel="すべてのブルワリー"
          />

          {prefectures && prefectures.length > 0 && (
            <SearchableSelect
              options={prefectures}
              value={currentPrefecture}
              onChange={handlePrefectureChange}
              label="都道府県"
              placeholder="都道府県を検索..."
              emptyLabel="すべての都道府県"
            />
          )}

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
