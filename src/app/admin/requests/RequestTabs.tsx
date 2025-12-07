"use client";

import Link from "next/link";

interface RequestTabsProps {
  activeTab: string;
  beerCount: number;
  styleCount: number;
}

export function RequestTabs({ activeTab, beerCount, styleCount }: RequestTabsProps) {
  return (
    <div role="tablist" className="tabs tabs-boxed bg-base-100 w-fit">
      <Link
        href="/admin/requests?type=beer"
        role="tab"
        className={`tab ${activeTab === "beer" ? "tab-active" : ""}`}
      >
        ビール申請
        {beerCount > 0 && (
          <span className="badge badge-warning badge-sm ml-2">{beerCount}</span>
        )}
      </Link>
      <Link
        href="/admin/requests?type=style"
        role="tab"
        className={`tab ${activeTab === "style" ? "tab-active" : ""}`}
      >
        スタイル申請
        {styleCount > 0 && (
          <span className="badge badge-warning badge-sm ml-2">{styleCount}</span>
        )}
      </Link>
    </div>
  );
}
