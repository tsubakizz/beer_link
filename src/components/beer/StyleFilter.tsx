"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface FlavorRange {
  min: string;
  max: string;
}

interface StyleFilterProps {
  currentQuery?: string;
  currentBitternessMin?: string;
  currentBitternessMax?: string;
  currentSweetnessMin?: string;
  currentSweetnessMax?: string;
  currentBodyMin?: string;
  currentBodyMax?: string;
  currentAromaMin?: string;
  currentAromaMax?: string;
  currentSournessMin?: string;
  currentSournessMax?: string;
}

const FLAVOR_OPTIONS = [
  { value: "", label: "-" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
];

const FLAVOR_LABELS: Record<string, string> = {
  "1": "弱め",
  "2": "やや弱め",
  "3": "普通",
  "4": "やや強め",
  "5": "強め",
};

export function StyleFilter({
  currentQuery,
  currentBitternessMin,
  currentBitternessMax,
  currentSweetnessMin,
  currentSweetnessMax,
  currentBodyMin,
  currentBodyMax,
  currentAromaMin,
  currentAromaMax,
  currentSournessMin,
  currentSournessMax,
}: StyleFilterProps) {
  const router = useRouter();

  const [query, setQuery] = useState(currentQuery || "");
  const [bitterness, setBitterness] = useState<FlavorRange>({
    min: currentBitternessMin || "",
    max: currentBitternessMax || "",
  });
  const [sweetness, setSweetness] = useState<FlavorRange>({
    min: currentSweetnessMin || "",
    max: currentSweetnessMax || "",
  });
  const [body, setBody] = useState<FlavorRange>({
    min: currentBodyMin || "",
    max: currentBodyMax || "",
  });
  const [aroma, setAroma] = useState<FlavorRange>({
    min: currentAromaMin || "",
    max: currentAromaMax || "",
  });
  const [sourness, setSourness] = useState<FlavorRange>({
    min: currentSournessMin || "",
    max: currentSournessMax || "",
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (query) params.set("q", query);

    // 範囲パラメータを設定
    if (bitterness.min) params.set("bitterness_min", bitterness.min);
    if (bitterness.max) params.set("bitterness_max", bitterness.max);
    if (sweetness.min) params.set("sweetness_min", sweetness.min);
    if (sweetness.max) params.set("sweetness_max", sweetness.max);
    if (body.min) params.set("body_min", body.min);
    if (body.max) params.set("body_max", body.max);
    if (aroma.min) params.set("aroma_min", aroma.min);
    if (aroma.max) params.set("aroma_max", aroma.max);
    if (sourness.min) params.set("sourness_min", sourness.min);
    if (sourness.max) params.set("sourness_max", sourness.max);

    const queryString = params.toString();
    router.push(queryString ? `/styles?${queryString}` : "/styles");
  };

  const clearFilters = () => {
    setQuery("");
    setBitterness({ min: "", max: "" });
    setSweetness({ min: "", max: "" });
    setBody({ min: "", max: "" });
    setAroma({ min: "", max: "" });
    setSourness({ min: "", max: "" });
    router.push("/styles");
  };

  const hasFilters =
    query ||
    bitterness.min ||
    bitterness.max ||
    sweetness.min ||
    sweetness.max ||
    body.min ||
    body.max ||
    aroma.min ||
    aroma.max ||
    sourness.min ||
    sourness.max;

  return (
    <form onSubmit={handleSearch} className="card bg-base-100 shadow mb-8">
      <div className="card-body">
        {/* キーワード検索 */}
        <div className="form-control w-full mb-4">
          <label className="label">
            <span className="label-text">キーワード検索</span>
          </label>
          <input
            type="text"
            placeholder="スタイル名で検索..."
            className="input input-bordered w-full"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* 味の特性フィルター（範囲指定） */}
        <div className="space-y-3 mb-4">
          <FlavorRangeSelect
            label="苦味"
            value={bitterness}
            onChange={setBitterness}
          />
          <FlavorRangeSelect
            label="甘味"
            value={sweetness}
            onChange={setSweetness}
          />
          <FlavorRangeSelect
            label="ボディ"
            value={body}
            onChange={setBody}
          />
          <FlavorRangeSelect
            label="香り"
            value={aroma}
            onChange={setAroma}
          />
          <FlavorRangeSelect
            label="酸味"
            value={sourness}
            onChange={setSourness}
          />
        </div>

        {/* ボタン */}
        <div className="flex gap-2 justify-end">
          {hasFilters && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={clearFilters}
            >
              クリア
            </button>
          )}
          <button type="submit" className="btn btn-primary">
            <svg
              className="w-5 h-5 mr-1"
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
            検索
          </button>
        </div>
      </div>
    </form>
  );
}

function FlavorRangeSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: FlavorRange;
  onChange: (value: FlavorRange) => void;
}) {
  const getDescription = () => {
    if (!value.min && !value.max) return null;
    if (value.min && value.max && value.min === value.max) {
      return FLAVOR_LABELS[value.min];
    }
    if (value.min && value.max) {
      return `${FLAVOR_LABELS[value.min]}〜${FLAVOR_LABELS[value.max]}`;
    }
    if (value.min) {
      return `${FLAVOR_LABELS[value.min]}以上`;
    }
    if (value.max) {
      return `${FLAVOR_LABELS[value.max]}以下`;
    }
    return null;
  };

  const description = getDescription();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm w-16 shrink-0">{label}</span>
      <select
        className="select select-bordered select-sm w-20"
        value={value.min}
        onChange={(e) => onChange({ ...value, min: e.target.value })}
      >
        {FLAVOR_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="text-sm text-base-content/60">〜</span>
      <select
        className="select select-bordered select-sm w-20"
        value={value.max}
        onChange={(e) => onChange({ ...value, max: e.target.value })}
      >
        {FLAVOR_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {description && (
        <span className="text-sm text-base-content/60">({description})</span>
      )}
    </div>
  );
}
