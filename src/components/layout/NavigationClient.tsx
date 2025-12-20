"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Bubbles } from "./Bubbles";

const navItems = [
  { href: "/beers", label: "ビール" },
  { href: "/breweries", label: "ブルワリー" },
  { href: "/styles", label: "スタイル" },
  { href: "/guides", label: "ガイド" },
];

interface NavigationClientProps {
  user: User | null;
  logoUrl: string;
}

export function NavigationClient({ user, logoUrl }: NavigationClientProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-400 shadow-lg relative">
      {/* 泡の装飾 */}
      <Bubbles count={10} variant="header" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="navbar min-h-16">
          {/* ロゴ */}
          <div className="flex-1">
            <Link
              href="/"
              className="hover:opacity-80 transition-opacity flex items-center gap-2"
            >
              <Image
                src={logoUrl}
                alt="Beer Link"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
                priority
              />
              <span className="text-xl font-bold text-amber-900">Beer Link</span>
            </Link>
          </div>

          {/* デスクトップナビゲーション */}
          <nav className="flex-none hidden lg:flex">
            <ul className="flex items-center gap-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      pathname.startsWith(item.href)
                        ? "bg-amber-900 text-yellow-100"
                        : "text-amber-900 hover:bg-yellow-600/30"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ログイン/マイページボタン */}
          <div className="flex-none ml-4 hidden lg:block">
            {user ? (
              <Link
                href="/mypage"
                className="btn bg-amber-900 text-yellow-100 hover:bg-amber-800 border-none"
              >
                マイページ
              </Link>
            ) : (
              <Link
                href="/login"
                className="btn bg-amber-900 text-yellow-100 hover:bg-amber-800 border-none"
              >
                ログイン
              </Link>
            )}
          </div>

          {/* モバイルメニューボタン（右側） */}
          <div className="flex-none lg:hidden ml-2">
            <button
              className="btn btn-square btn-ghost text-amber-900 hover:bg-yellow-600/30"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="メニューを開く"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-6 h-6 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* モバイルメニュー */}
      {isMenuOpen && (
        <div className="lg:hidden bg-yellow-400 border-t border-yellow-600/30">
          <ul className="container mx-auto px-4 py-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block px-4 py-3 rounded-lg font-medium transition-all ${
                    pathname.startsWith(item.href)
                      ? "bg-amber-900 text-yellow-100"
                      : "text-amber-900 hover:bg-yellow-600/30"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {/* ログイン/マイページリンク */}
            <li className="mt-2 pt-2 border-t border-yellow-600/30">
              {user ? (
                <Link
                  href="/mypage"
                  className="block px-4 py-3 rounded-lg font-medium text-amber-900 hover:bg-yellow-600/30 transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  マイページ
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="block px-4 py-3 rounded-lg font-medium text-amber-900 hover:bg-yellow-600/30 transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ログイン
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
