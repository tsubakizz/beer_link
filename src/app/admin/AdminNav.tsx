"use client";

import { useState } from "react";
import Link from "next/link";

const navItems = [
  { href: "/admin", label: "ダッシュボード" },
  { href: "/admin/beers", label: "ビール管理" },
  { href: "/admin/styles", label: "スタイル管理" },
  { href: "/admin/breweries", label: "ブルワリー管理" },
  { href: "/admin/contacts", label: "お問い合わせ" },
];

export function AdminDesktopNav() {
  return (
    <div className="hidden md:flex items-center gap-4">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="link link-hover text-sm"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export function AdminMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="メニュー"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-14 left-0 right-0 bg-base-100 border-b shadow-lg z-50">
          <div className="container mx-auto px-4 py-2">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="py-2 px-3 rounded hover:bg-base-200 text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <hr className="my-2 border-base-200" />
              <Link
                href="/"
                className="py-2 px-3 rounded hover:bg-base-200 text-sm"
                onClick={() => setIsOpen(false)}
              >
                サイトへ戻る
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
