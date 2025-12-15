"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { logout } from "@/app/(auth)/login/actions";
import type { User } from "@supabase/supabase-js";
import { Bubbles } from "./Bubbles";

const navItems = [
  { href: "/beers", label: "ビール" },
  { href: "/breweries", label: "ブルワリー" },
  { href: "/styles", label: "スタイル" },
  { href: "/guides", label: "ガイド" },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // 初期ユーザー取得
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        checkAdminRole(user.id);
      }
    });

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminRole(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // ユーザーの管理者権限を確認
  const checkAdminRole = async (userId: string) => {
    const { data } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();
    setIsAdmin(data?.role === "admin");
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-400 shadow-lg relative overflow-hidden">
      {/* 泡の装飾 */}
      <Bubbles count={10} variant="header" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="navbar min-h-16">
          {/* モバイルメニューボタン */}
          <div className="flex-none lg:hidden">
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

          {/* ロゴ */}
          <div className="flex-1">
            <Link
              href="/"
              className="hover:opacity-80 transition-opacity flex items-center gap-2"
            >
              <Image
                src={`${process.env.NEXT_PUBLIC_R2_ASSETS_URL}/7fde81d3-c2be-4b41-8485-7ab75bf50055.webp`}
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

          {/* 認証ボタン */}
          <div className="flex-none ml-4">
            {user ? (
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-circle bg-amber-900 text-yellow-100 hover:bg-amber-800 border-none"
                >
                  <span className="text-lg font-bold">
                    {user.email?.[0].toUpperCase() || "U"}
                  </span>
                </div>
                <ul
                  tabIndex={0}
                  className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-lg bg-white rounded-box w-52 border border-gray-200"
                >
                  <li>
                    <Link href="/mypage" className="text-gray-700 hover:bg-yellow-100">
                      マイページ
                    </Link>
                  </li>
                  {isAdmin && (
                    <li>
                      <Link href="/admin" className="text-amber-700 hover:bg-yellow-100 font-medium">
                        管理画面
                      </Link>
                    </li>
                  )}
                  <li>
                    <button
                      onClick={async () => {
                        await logout();
                        router.refresh();
                      }}
                      className="text-gray-700 hover:bg-yellow-100"
                    >
                      ログアウト
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <Link
                href="/login"
                className="btn bg-amber-900 text-yellow-100 hover:bg-amber-800 border-none"
              >
                ログイン
              </Link>
            )}
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
          </ul>
        </div>
      )}
    </header>
  );
}
