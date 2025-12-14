import Link from "next/link";
import { Bubbles } from "./Bubbles";

export function Footer() {
  const currentYear = new Date().getFullYear();

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
