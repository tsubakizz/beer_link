import Link from "next/link";

const ITEMS_PER_PAGE = 30;

interface PaginationProps {
  currentPage: number;
  totalCount: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}

function buildUrl(
  basePath: string,
  page: number,
  searchParams?: Record<string, string | undefined>
): string {
  const params = new URLSearchParams();

  // 既存の検索パラメータを追加
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== "page") {
        params.set(key, value);
      }
    });
  }

  // ページ番号を追加（1ページ目は省略）
  if (page > 1) {
    params.set("page", String(page));
  }

  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

export function Pagination({
  currentPage,
  totalCount,
  basePath,
  searchParams,
}: PaginationProps) {
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // 1ページ以下の場合は表示しない
  if (totalPages <= 1) {
    return null;
  }

  // 表示するページ番号を計算（現在ページを中心に最大5ページ）
  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    // 終端に達した場合は開始位置を調整
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();
  const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalCount);

  return (
    <div className="flex flex-col items-center gap-4 mt-8">
      {/* 件数表示 */}
      <p className="text-sm text-base-content/70">
        全{totalCount}件中 {startItem}-{endItem}件を表示
      </p>

      {/* ページネーションボタン */}
      <div className="join">
        {/* 前へボタン */}
        {currentPage > 1 ? (
          <Link
            href={buildUrl(basePath, currentPage - 1, searchParams)}
            className="join-item btn btn-sm"
          >
            «
          </Link>
        ) : (
          <button className="join-item btn btn-sm btn-disabled" disabled>
            «
          </button>
        )}

        {/* 最初のページ（省略記号付き） */}
        {pageNumbers[0] > 1 && (
          <>
            <Link
              href={buildUrl(basePath, 1, searchParams)}
              className="join-item btn btn-sm"
            >
              1
            </Link>
            {pageNumbers[0] > 2 && (
              <button className="join-item btn btn-sm btn-disabled" disabled>
                ...
              </button>
            )}
          </>
        )}

        {/* ページ番号 */}
        {pageNumbers.map((page) => (
          <Link
            key={page}
            href={buildUrl(basePath, page, searchParams)}
            className={`join-item btn btn-sm ${
              page === currentPage ? "btn-active" : ""
            }`}
          >
            {page}
          </Link>
        ))}

        {/* 最後のページ（省略記号付き） */}
        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <button className="join-item btn btn-sm btn-disabled" disabled>
                ...
              </button>
            )}
            <Link
              href={buildUrl(basePath, totalPages, searchParams)}
              className="join-item btn btn-sm"
            >
              {totalPages}
            </Link>
          </>
        )}

        {/* 次へボタン */}
        {currentPage < totalPages ? (
          <Link
            href={buildUrl(basePath, currentPage + 1, searchParams)}
            className="join-item btn btn-sm"
          >
            »
          </Link>
        ) : (
          <button className="join-item btn btn-sm btn-disabled" disabled>
            »
          </button>
        )}
      </div>
    </div>
  );
}

export { ITEMS_PER_PAGE };
