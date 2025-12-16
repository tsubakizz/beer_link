"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "@/app/(auth)/login/actions";
import type { User } from "@supabase/supabase-js";
import { Bubbles } from "./Bubbles";

interface FooterClientProps {
  user: User | null;
  isAdmin: boolean;
}

export function FooterClient({ user, isAdmin }: FooterClientProps) {
  const currentYear = new Date().getFullYear();
  const router = useRouter();

  return (
    <footer className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-400 relative overflow-hidden">
      {/* 泡の装飾 */}
      <Bubbles count={8} variant="footer" />

      <div className="container mx-auto px-4 py-10 relative z-10">
        {/* リンク */}
        <nav className="flex flex-wrap justify-center gap-6 mb-6">
          <Link
            href="/about"
            className="text-amber-900 hover:text-amber-700 transition-colors"
          >
            サイトについて
          </Link>
          <Link
            href="/terms"
            className="text-amber-900 hover:text-amber-700 transition-colors"
          >
            利用規約
          </Link>
          <Link
            href="/privacy"
            className="text-amber-900 hover:text-amber-700 transition-colors"
          >
            プライバシーポリシー
          </Link>
          <Link
            href="/contact"
            className="text-amber-900 hover:text-amber-700 transition-colors"
          >
            お問い合わせ
          </Link>
        </nav>

        {/* ユーザー用リンク */}
        {user && (
          <nav className="flex flex-wrap justify-center gap-6 mb-6">
            {isAdmin && (
              <Link
                href="/admin"
                className="text-amber-800 hover:text-amber-600 transition-colors font-medium"
              >
                管理画面
              </Link>
            )}
            <button
              onClick={async () => {
                await logout();
                router.refresh();
              }}
              className="text-amber-800 hover:text-amber-600 transition-colors cursor-pointer"
            >
              ログアウト
            </button>
          </nav>
        )}

        {/* コピーライト */}
        <div className="text-center">
          <p className="text-amber-900">
            Copyright {currentYear} Beer Link. All rights reserved.
          </p>
          <p className="text-sm mt-2 text-amber-800">
            お酒は20歳になってから。飲酒運転は法律で禁止されています。
          </p>
        </div>
      </div>
    </footer>
  );
}
