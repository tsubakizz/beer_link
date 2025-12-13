import Link from "next/link";

interface Props {
  currentPage: number;
  totalPages: number;
  status: string;
}

export function ContactPagination({ currentPage, totalPages, status }: Props) {
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams();
    params.set("status", status);
    if (page > 1) {
      params.set("page", page.toString());
    }
    return `/admin/contacts?${params.toString()}`;
  };

  // 表示するページ番号を計算
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    const showPages = 5; // 表示するページ数

    if (totalPages <= showPages + 2) {
      // 全ページ表示
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 先頭
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // 現在のページ周辺
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // 末尾
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex justify-center mt-8">
      <div className="join">
        {currentPage > 1 && (
          <Link href={createPageUrl(currentPage - 1)} className="join-item btn">
            «
          </Link>
        )}

        {pageNumbers.map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} className="join-item btn btn-disabled">
              ...
            </span>
          ) : (
            <Link
              key={page}
              href={createPageUrl(page)}
              className={`join-item btn ${currentPage === page ? "btn-active" : ""}`}
            >
              {page}
            </Link>
          )
        )}

        {currentPage < totalPages && (
          <Link href={createPageUrl(currentPage + 1)} className="join-item btn">
            »
          </Link>
        )}
      </div>
    </div>
  );
}
