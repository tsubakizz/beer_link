interface FlavorData {
  bitterness?: number | null;
  sweetness?: number | null;
  body?: number | null;
  aroma?: number | null;
  sourness?: number | null;
}

interface FlavorBarsProps {
  data: FlavorData;
  size?: "sm" | "md";
}

const FLAVOR_ITEMS = [
  { key: "bitterness" as const, label: "苦味" },
  { key: "sweetness" as const, label: "甘味" },
  { key: "body" as const, label: "ボディ" },
  { key: "aroma" as const, label: "香り" },
  { key: "sourness" as const, label: "酸味" },
];

export function FlavorBars({ data, size = "md" }: FlavorBarsProps) {
  const activeItems = FLAVOR_ITEMS.filter((item) => data[item.key] != null);

  if (activeItems.length === 0) return null;

  const barHeight = size === "sm" ? "h-1.5" : "h-2";
  const labelSize = size === "sm" ? "text-xs" : "text-sm";
  const gap = size === "sm" ? "gap-1" : "gap-1.5";

  return (
    <div className={`flex flex-col ${gap} w-full`}>
      {activeItems.map((item) => {
        const value = data[item.key] ?? 0;
        const percentage = (value / 5) * 100;

        return (
          <div key={item.key} className="flex items-center gap-2">
            <span className={`${labelSize} text-base-content/60 w-12 shrink-0`}>
              {item.label}
            </span>
            <div className={`flex-1 bg-base-200 rounded-full ${barHeight}`}>
              <div
                className={`bg-amber-500 ${barHeight} rounded-full transition-all`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className={`${labelSize} text-base-content/60 w-4 text-right`}>
              {value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
