import Link from "next/link";
import type { BeerStyle } from "@/lib/db/schema";

interface RelatedStylesProps {
  parentStyles: Pick<BeerStyle, "id" | "slug" | "name">[];
  childStyles: Pick<BeerStyle, "id" | "slug" | "name">[];
  siblingStyles: Pick<BeerStyle, "id" | "slug" | "name">[];
}

export function RelatedStyles({
  parentStyles,
  childStyles,
  siblingStyles,
}: RelatedStylesProps) {
  // 関連スタイルがない場合は表示しない
  if (
    parentStyles.length === 0 &&
    childStyles.length === 0 &&
    siblingStyles.length === 0
  ) {
    return null;
  }

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <h2 className="card-title">関連するビアスタイル</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {/* 派生元スタイル（親） */}
          {parentStyles.length > 0 && (
            <div>
              <h3 className="font-semibold text-base-content/80 mb-3 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
                派生元スタイル
              </h3>
              <ul className="space-y-2">
                {parentStyles.map((style) => (
                  <li key={style.id}>
                    <Link
                      href={`/styles/${style.slug}`}
                      className="link link-hover text-primary flex items-center gap-1"
                    >
                      <span className="text-sm">→</span>
                      {style.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 派生スタイル（子） */}
          {childStyles.length > 0 && (
            <div>
              <h3 className="font-semibold text-base-content/80 mb-3 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
                派生スタイル
              </h3>
              <ul className="space-y-2">
                {childStyles.map((style) => (
                  <li key={style.id}>
                    <Link
                      href={`/styles/${style.slug}`}
                      className="link link-hover text-primary flex items-center gap-1"
                    >
                      <span className="text-sm">→</span>
                      {style.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 類似スタイル（兄弟） */}
          {siblingStyles.length > 0 && (
            <div>
              <h3 className="font-semibold text-base-content/80 mb-3 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
                類似スタイル
              </h3>
              <ul className="space-y-2">
                {siblingStyles.map((style) => (
                  <li key={style.id}>
                    <Link
                      href={`/styles/${style.slug}`}
                      className="link link-hover text-primary flex items-center gap-1"
                    >
                      <span className="text-sm">→</span>
                      {style.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
