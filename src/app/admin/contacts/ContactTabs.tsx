"use client";

import Link from "next/link";

interface ContactTabsProps {
  activeStatus: string;
  counts: {
    pending: number;
    read: number;
    replied: number;
    closed: number;
  };
}

export function ContactTabs({ activeStatus, counts }: ContactTabsProps) {
  const tabs = [
    { key: "pending", label: "未対応", count: counts.pending },
    { key: "read", label: "確認済み", count: counts.read },
    { key: "replied", label: "返信済み", count: counts.replied },
    { key: "closed", label: "完了", count: counts.closed },
  ];

  return (
    <div role="tablist" className="tabs tabs-boxed">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={`/admin/contacts?status=${tab.key}`}
          role="tab"
          className={`tab ${activeStatus === tab.key ? "tab-active" : ""}`}
        >
          {tab.label}
          {tab.count > 0 && (
            <span className="badge badge-sm ml-2">{tab.count}</span>
          )}
        </Link>
      ))}
    </div>
  );
}
