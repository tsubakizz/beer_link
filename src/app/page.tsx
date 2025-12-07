import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* ヒーローセクション */}
      <section className="relative min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-yellow-100 via-yellow-200 to-amber-200 overflow-hidden">
        {/* 泡のような装飾 */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
          <div className="absolute top-20 right-20 w-48 h-48 bg-yellow-400 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-amber-900">
            クラフトビールの世界へようこそ
          </h1>
          <p className="text-lg md:text-xl mb-8 text-amber-800">
            beer_linkは、クラフトビール愛好家のための情報サイトです。
            <br className="hidden md:block" />
            ビール、ブルワリー、ビアスタイルの一覧と、
            <br className="hidden md:block" />
            ユーザーによる口コミ・レビュー機能を提供しています。
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/beers"
              className="btn btn-lg bg-amber-600 text-white hover:bg-amber-700 border-none shadow-lg"
            >
              ビール一覧を見る
            </Link>
            <Link
              href="/styles"
              className="btn btn-lg bg-transparent border-2 border-amber-600 text-amber-700 hover:bg-amber-600 hover:text-white"
            >
              ビアスタイルを学ぶ
            </Link>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">
            beer_linkの特徴
          </h2>
          <p className="text-center text-gray-600 mb-12">
            クラフトビールをもっと楽しむための3つの機能
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {/* 一覧機能 */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4 text-center">📚</div>
              <h3 className="text-xl font-bold text-center mb-4 text-gray-800">
                充実の一覧機能
              </h3>
              <p className="text-gray-600 text-center">
                ビール、ブルワリー、ビアスタイルの情報を網羅。
                味わいの特徴をレーダーチャートで視覚的に表示します。
              </p>
            </div>

            {/* レビュー機能 */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4 text-center">⭐</div>
              <h3 className="text-xl font-bold text-center mb-4 text-gray-800">
                口コミ・レビュー
              </h3>
              <p className="text-gray-600 text-center">
                実際に飲んだビールの感想を投稿。
                味の評価を細かく記録して、お気に入りを見つけましょう。
              </p>
            </div>

            {/* 追加申請機能 */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4 text-center">🍺</div>
              <h3 className="text-xl font-bold text-center mb-4 text-gray-800">
                みんなで作る一覧
              </h3>
              <p className="text-gray-600 text-center">
                まだ掲載されていないビールは追加申請が可能。
                ユーザーの力で一覧を充実させていきます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 初心者向けセクション */}
      <section className="py-20 px-4 bg-amber-50/50">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-6 text-gray-800">
                クラフトビール初心者の方へ
              </h2>
              <p className="text-lg mb-6 text-gray-600 leading-relaxed">
                「クラフトビールに興味があるけど、何から始めればいいかわからない...」
                <br />
                そんな方のために、初心者向けガイドを用意しています。
                <br />
                ビアスタイルの違いや、自分好みのビールの見つけ方を学びましょう。
              </p>
              <Link
                href="/guides"
                className="btn bg-amber-600 text-white hover:bg-amber-700 border-none"
              >
                ガイドを見る
              </Link>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="text-[10rem] leading-none">🍻</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-20 px-4 bg-gradient-to-r from-yellow-100 via-yellow-200 to-amber-200">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-amber-900">
            さあ、始めましょう
          </h2>
          <p className="text-xl mb-8 text-amber-800">
            アカウントを作成して、レビューの投稿やお気に入り登録を始めましょう。
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/register"
              className="btn btn-lg bg-amber-900 text-yellow-100 hover:bg-amber-800 border-none shadow-lg"
            >
              無料で登録する
            </Link>
            <Link
              href="/beers"
              className="btn btn-lg bg-transparent border-2 border-amber-900 text-amber-900 hover:bg-amber-900 hover:text-yellow-100"
            >
              まずは一覧を見る
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
