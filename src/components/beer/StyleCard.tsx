import Link from "next/link";
import type { BeerStyle } from "@/lib/db/schema";

interface StyleCardProps {
  style: BeerStyle;
}

// SRM値に基づいてビールの色を返す
function getSrmColor(srmMin: number | null, srmMax: number | null): string {
  // SRM中央値を使用
  const srm = srmMin && srmMax ? (srmMin + srmMax) / 2 : srmMin || srmMax || 5;

  // SRM色マッピング（実際のビール色に近い色）
  if (srm <= 2) return "#F8F4B4"; // Very Pale / Straw
  if (srm <= 4) return "#F5E687"; // Pale Straw
  if (srm <= 6) return "#F0D84A"; // Pale Gold
  if (srm <= 8) return "#E8C82A"; // Gold
  if (srm <= 10) return "#D9A81C"; // Deep Gold
  if (srm <= 13) return "#C48A0F"; // Amber
  if (srm <= 17) return "#A86E0A"; // Deep Amber
  if (srm <= 20) return "#8B5408"; // Copper
  if (srm <= 24) return "#6D3E06"; // Deep Copper / Brown
  if (srm <= 30) return "#4E2A04"; // Brown
  if (srm <= 40) return "#361E03"; // Dark Brown
  return "#1A0F02"; // Black
}

// SRM値に基づいてテキスト色を決定
function getSrmTextColor(srmMin: number | null, srmMax: number | null): string {
  const srm = srmMin && srmMax ? (srmMin + srmMax) / 2 : srmMin || srmMax || 5;
  return srm > 15 ? "#FFFFFF" : "#1A1A1A";
}

export function StyleCard({ style }: StyleCardProps) {
  const bgColor = getSrmColor(style.srmMin, style.srmMax);
  const textColor = getSrmTextColor(style.srmMin, style.srmMax);

  return (
    <Link href={`/styles/${style.id}`}>
      <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer h-full overflow-hidden">
        {/* SRM色のヘッダー */}
        <div
          className="h-16 flex items-center justify-center px-4"
          style={{ backgroundColor: bgColor }}
        >
          <h3
            className="card-title text-lg text-center line-clamp-2"
            style={{ color: textColor }}
          >
            {style.name}
          </h3>
        </div>

        <div className="card-body pt-4">
          {style.origin && (
            <p className="text-sm text-base-content/60">発祥: {style.origin}</p>
          )}
          <p className="text-sm text-base-content/80 line-clamp-3">
            {style.shortDescription || style.description || "説明はまだありません"}
          </p>

          <div className="flex flex-wrap gap-2 mt-auto pt-2">
            {style.abvMin && style.abvMax && (
              <span className="badge badge-outline badge-sm">
                ABV: {style.abvMin}-{style.abvMax}%
              </span>
            )}
            {style.ibuMin && style.ibuMax && (
              <span className="badge badge-outline badge-sm">
                IBU: {style.ibuMin}-{style.ibuMax}
              </span>
            )}
            {style.srmMin && style.srmMax && (
              <span className="badge badge-outline badge-sm">
                SRM: {style.srmMin}-{style.srmMax}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
