"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useRef, useEffect } from "react";

// 再エクスポート（互換性のため）
export {
  BITTERNESS_OPTIONS,
  ABV_OPTIONS,
  type BitternessLevel,
  type AbvLevel,
} from "@/lib/constants/beer-filters";

interface FilterOption {
  id: number;
  name: string;
}

interface StyleOption extends FilterOption {
  otherNames?: string[];
}

interface SimpleFilterOption {
  value: string;
  label: string;
}

interface BeerFilterProps {
  styles: StyleOption[];
  breweries: FilterOption[];
  prefectures?: FilterOption[];
  bitternessOptions?: SimpleFilterOption[];
  abvOptions?: SimpleFilterOption[];
  currentQuery?: string;
  currentStyle?: string;
  currentBrewery?: string;
  currentPrefecture?: string;
  currentBitterness?: string;
  currentAbv?: string;
}

// 検索可能なドロップダウンコンポーネント
function FilterDropdown({
  options,
  value,
  onChange,
  label,
  placeholder,
  emptyLabel = "すべて",
}: {
  options: { id: number | string; name: string; otherNames?: string[] }[];
  value?: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  emptyLabel?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => String(opt.id) === value);

  const filteredOptions = searchTerm
    ? options.filter((opt) => {
        const search = searchTerm.toLowerCase();
        const nameMatch = opt.name.toLowerCase().includes(search);
        const otherNameMatch = (opt as StyleOption).otherNames?.some((name) =>
          name.toLowerCase().includes(search)
        );
        return nameMatch || otherNameMatch;
      })
    : options;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isComposing) return;
      if (e.key === "Escape") {
        setIsOpen(false);
        setSearchTerm("");
      } else if (e.key === "Enter" && filteredOptions.length > 0) {
        e.preventDefault();
        onChange(String(filteredOptions[0].id));
        setIsOpen(false);
        setSearchTerm("");
      }
    },
    [filteredOptions, onChange, isComposing]
  );

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleOpen = () => {
    setIsOpen(true);
    setSearchTerm("");
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  return (
    <div className="relative" ref={containerRef}>
      <label className="label py-1">
        <span className="label-text text-xs font-medium">{label}</span>
      </label>
      <div
        className="select select-bordered select-sm w-full flex items-center cursor-pointer"
        onClick={!isOpen ? handleOpen : undefined}
      >
        {isOpen ? (
          <input
            ref={inputRef}
            type="text"
            className="grow bg-transparent outline-none min-w-0 text-sm"
            placeholder={placeholder || "検索..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
          />
        ) : (
          <span
            className={`grow truncate text-sm ${!selectedOption ? "text-base-content/50" : ""}`}
          >
            {selectedOption?.name || emptyLabel}
          </span>
        )}
      </div>

      {isOpen && (
        <ul className="absolute top-full left-0 right-0 mt-1 bg-base-100 rounded-box z-[100] max-h-48 overflow-y-auto shadow-lg border border-base-300">
          <li>
            <button
              type="button"
              className={`w-full px-3 py-2 text-left text-sm hover:bg-base-200 ${!value ? "bg-primary/10 font-medium" : ""}`}
              onClick={() => handleSelect("")}
            >
              {emptyLabel}
            </button>
          </li>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-base-200 ${String(option.id) === value ? "bg-primary/10 font-medium" : ""}`}
                  onClick={() => handleSelect(String(option.id))}
                >
                  {option.name}
                </button>
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-base-content/50">
              該当なし
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

// シンプルなセレクトコンポーネント
function SimpleSelect({
  options,
  value,
  onChange,
  label,
  emptyLabel = "すべて",
}: {
  options: { value: string; label: string }[];
  value?: string;
  onChange: (value: string) => void;
  label: string;
  emptyLabel?: string;
}) {
  return (
    <div>
      <label className="label py-1">
        <span className="label-text text-xs font-medium">{label}</span>
      </label>
      <select
        className="select select-bordered select-sm w-full"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{emptyLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function BeerFilter({
  styles,
  breweries,
  prefectures,
  bitternessOptions,
  abvOptions,
  currentQuery,
  currentStyle,
  currentBrewery,
  currentPrefecture,
  currentBitterness,
  currentAbv,
}: BeerFilterProps) {
  const router = useRouter();
  const [query, setQuery] = useState(currentQuery || "");
  const [isComposing, setIsComposing] = useState(false);

  const navigateWithFilter = useCallback(
    (
      newStyle?: string,
      newBrewery?: string,
      newPrefecture?: string,
      newQuery?: string,
      newBitterness?: string,
      newAbv?: string
    ) => {
      const activeFilters = [
        newStyle,
        newBrewery,
        newPrefecture,
        newQuery,
        newBitterness,
        newAbv,
      ].filter(Boolean).length;

      if (activeFilters === 1 && !newQuery) {
        if (newStyle) {
          router.push(`/beers/style/${newStyle}`);
          return;
        }
        if (newBrewery) {
          router.push(`/beers/brewery/${newBrewery}`);
          return;
        }
        if (newPrefecture) {
          router.push(`/beers/prefecture/${newPrefecture}`);
          return;
        }
        if (newBitterness) {
          router.push(`/beers/bitterness/${newBitterness}`);
          return;
        }
        if (newAbv) {
          router.push(`/beers/abv/${newAbv}`);
          return;
        }
      }

      const params = new URLSearchParams();
      if (newQuery) params.set("q", newQuery);
      if (newStyle) params.set("style", newStyle);
      if (newBrewery) params.set("brewery", newBrewery);
      if (newPrefecture) params.set("prefecture", newPrefecture);
      if (newBitterness) params.set("bitterness", newBitterness);
      if (newAbv) params.set("abv", newAbv);

      const queryString = params.toString();
      router.push(queryString ? `/beers?${queryString}` : "/beers");
    },
    [router]
  );

  const handleStyleChange = useCallback(
    (value: string) => {
      navigateWithFilter(
        value || undefined,
        currentBrewery,
        currentPrefecture,
        currentQuery,
        currentBitterness,
        currentAbv
      );
    },
    [
      navigateWithFilter,
      currentBrewery,
      currentPrefecture,
      currentQuery,
      currentBitterness,
      currentAbv,
    ]
  );

  const handleBreweryChange = useCallback(
    (value: string) => {
      navigateWithFilter(
        currentStyle,
        value || undefined,
        currentPrefecture,
        currentQuery,
        currentBitterness,
        currentAbv
      );
    },
    [
      navigateWithFilter,
      currentStyle,
      currentPrefecture,
      currentQuery,
      currentBitterness,
      currentAbv,
    ]
  );

  const handlePrefectureChange = useCallback(
    (value: string) => {
      navigateWithFilter(
        currentStyle,
        currentBrewery,
        value || undefined,
        currentQuery,
        currentBitterness,
        currentAbv
      );
    },
    [
      navigateWithFilter,
      currentStyle,
      currentBrewery,
      currentQuery,
      currentBitterness,
      currentAbv,
    ]
  );

  const handleBitternessChange = useCallback(
    (value: string) => {
      navigateWithFilter(
        currentStyle,
        currentBrewery,
        currentPrefecture,
        currentQuery,
        value || undefined,
        currentAbv
      );
    },
    [
      navigateWithFilter,
      currentStyle,
      currentBrewery,
      currentPrefecture,
      currentQuery,
      currentAbv,
    ]
  );

  const handleAbvChange = useCallback(
    (value: string) => {
      navigateWithFilter(
        currentStyle,
        currentBrewery,
        currentPrefecture,
        currentQuery,
        currentBitterness,
        value || undefined
      );
    },
    [
      navigateWithFilter,
      currentStyle,
      currentBrewery,
      currentPrefecture,
      currentQuery,
      currentBitterness,
    ]
  );

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (isComposing) return;
      navigateWithFilter(
        currentStyle,
        currentBrewery,
        currentPrefecture,
        query || undefined,
        currentBitterness,
        currentAbv
      );
    },
    [
      isComposing,
      query,
      navigateWithFilter,
      currentStyle,
      currentBrewery,
      currentPrefecture,
      currentBitterness,
      currentAbv,
    ]
  );

  const clearFilters = useCallback(() => {
    setQuery("");
    router.push("/beers");
  }, [router]);

  const hasFilters =
    currentQuery ||
    currentStyle ||
    currentBrewery ||
    currentPrefecture ||
    currentBitterness ||
    currentAbv;

  return (
    <div className="card bg-base-100 shadow mb-8">
      <div className="card-body p-4 sm:p-6">
        {/* 検索バー */}
        <form onSubmit={handleSearch}>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="ビール名で検索..."
              className="input input-bordered input-sm flex-1"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              <svg
                className="w-4 h-4"
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
              <span className="hidden sm:inline">検索</span>
            </button>
          </div>
        </form>

        {/* フィルターグリッド */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
          <FilterDropdown
            options={styles}
            value={currentStyle}
            onChange={handleStyleChange}
            label="スタイル"
            placeholder="スタイルを検索..."
            emptyLabel="すべて"
          />

          <FilterDropdown
            options={breweries}
            value={currentBrewery}
            onChange={handleBreweryChange}
            label="ブルワリー"
            placeholder="ブルワリーを検索..."
            emptyLabel="すべて"
          />

          {prefectures && prefectures.length > 0 && (
            <FilterDropdown
              options={prefectures}
              value={currentPrefecture}
              onChange={handlePrefectureChange}
              label="都道府県"
              placeholder="都道府県を検索..."
              emptyLabel="すべて"
            />
          )}

          {bitternessOptions && bitternessOptions.length > 0 && (
            <SimpleSelect
              options={bitternessOptions}
              value={currentBitterness}
              onChange={handleBitternessChange}
              label="苦味"
              emptyLabel="すべて"
            />
          )}

          {abvOptions && abvOptions.length > 0 && (
            <SimpleSelect
              options={abvOptions}
              value={currentAbv}
              onChange={handleAbvChange}
              label="アルコール度数"
              emptyLabel="すべて"
            />
          )}

          {/* クリアボタン */}
          {hasFilters && (
            <div className="flex items-end">
              <button
                type="button"
                className="btn btn-ghost btn-sm w-full"
                onClick={clearFilters}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                クリア
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
