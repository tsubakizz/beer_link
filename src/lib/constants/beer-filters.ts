// 苦味（IBU）フィルター定義
export const BITTERNESS_OPTIONS = [
  { value: "light", label: "弱め", description: "IBU 0-20" },
  { value: "medium", label: "普通", description: "IBU 21-45" },
  { value: "strong", label: "強め", description: "IBU 46+" },
] as const;

// アルコール度数（ABV）フィルター定義
export const ABV_OPTIONS = [
  { value: "light", label: "弱め", description: "4.5%以下" },
  { value: "medium", label: "普通", description: "4.6-7%" },
  { value: "strong", label: "強め", description: "7%超" },
] as const;

export type BitternessLevel = (typeof BITTERNESS_OPTIONS)[number]["value"];
export type AbvLevel = (typeof ABV_OPTIONS)[number]["value"];

// 苦味フィルターのIBU範囲
export const BITTERNESS_RANGES: Record<
  BitternessLevel,
  { min: number; max: number | null }
> = {
  light: { min: 0, max: 20 },
  medium: { min: 21, max: 45 },
  strong: { min: 46, max: null },
};

// ABVフィルターの範囲
export const ABV_RANGES: Record<AbvLevel, { min: number; max: number | null }> =
  {
    light: { min: 0, max: 4.5 },
    medium: { min: 4.6, max: 7 },
    strong: { min: 7.1, max: null },
  };
