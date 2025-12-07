import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ビール入門ガイド | beer_link",
  description:
    "クラフトビール初心者のためのガイド。ビールの基礎知識からテイスティング方法まで、ビールをもっと楽しむためのヒントをご紹介します。",
};

// 静的コンテンツ: 1日ごとに再検証
export const revalidate = 86400;

const guides = [
  {
    slug: "beginners",
    title: "ビール入門",
    description:
      "ビールの基礎知識を学ぼう。原材料、製造工程、ビアスタイルの違いなど、ビールの世界への第一歩。",
    icon: "🍺",
    color: "bg-amber-100",
  },
  {
    slug: "tasting",
    title: "テイスティングガイド",
    description:
      "ビールの味わい方を知ろう。香り、味、見た目の楽しみ方から、フードペアリングまで。",
    icon: "👃",
    color: "bg-yellow-100",
  },
  {
    slug: "styles",
    title: "ビアスタイル一覧",
    description:
      "世界中の様々なビアスタイルを紹介。あなたの好みのスタイルを見つけよう。",
    icon: "📚",
    color: "bg-orange-100",
    href: "/styles",
  },
];

export default function GuidesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">ビール入門ガイド</h1>
        <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
          クラフトビールの世界へようこそ！
          初心者の方でも楽しめるガイドを用意しました。
        </p>
      </div>

      {/* ガイド一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            href={guide.href || `/guides/${guide.slug}`}
            className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className={`${guide.color} rounded-t-2xl p-8 text-center`}>
              <span className="text-6xl">{guide.icon}</span>
            </div>
            <div className="card-body">
              <h2 className="card-title">{guide.title}</h2>
              <p className="text-base-content/70">{guide.description}</p>
              <div className="card-actions justify-end mt-4">
                <span className="text-primary font-medium">読む →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 補足セクション */}
      <div className="mt-16 text-center">
        <div className="bg-base-200 rounded-2xl p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">もっとビールを楽しもう</h2>
          <p className="text-base-content/70 mb-6">
            ガイドを読んだら、実際にビールを探してみましょう。
            お気に入りのビールを見つけて、レビューを投稿してみてください。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/beers" className="btn btn-primary">
              ビール一覧を見る
            </Link>
            <Link href="/breweries" className="btn btn-outline">
              ブルワリーを探す
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
