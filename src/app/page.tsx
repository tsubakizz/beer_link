import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      {/* ヒーローセクション */}
      <section className="relative min-h-[50vh] md:min-h-[60vh] flex items-center justify-center overflow-hidden">
        {/* KV背景画像 */}
        <Image
          src={`${process.env.NEXT_PUBLIC_R2_ASSETS_URL}/a15279c4-18a7-434c-a4cf-1d23945fdd9c.webp`}
          alt="Beer Link キービジュアル"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
        {/* オーバーレイ */}
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 text-center px-4 max-w-3xl">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 text-white drop-shadow-lg">
            Beer Link
          </h1>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium mb-6 text-white/90 drop-shadow">
            知って繋がる、ビールの楽しさ
          </h2>
          <p className="text-lg md:text-xl mb-8 text-white/90 drop-shadow">
            Beer Linkは、クラフトビール愛好家のための情報サイトです。
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
              className="btn btn-lg bg-white/90 border-2 border-white text-amber-700 hover:bg-white"
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
            Beer Linkの特徴
          </h2>
          <p className="text-center text-gray-600 mb-12">
            クラフトビールをもっと楽しむための3つの機能
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {/* 一覧機能 */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-4">
                <Image
                  src={`${process.env.NEXT_PUBLIC_R2_ASSETS_URL}/663adb8a-c867-47da-bea7-ace4f266ba75.webp`}
                  alt="一覧機能"
                  width={120}
                  height={120}
                />
              </div>
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
              <div className="flex justify-center mb-4">
                <Image
                  src={`${process.env.NEXT_PUBLIC_R2_ASSETS_URL}/288284bf-c706-475f-98c5-c0fa26afd9cd.webp`}
                  alt="レビュー機能"
                  width={120}
                  height={120}
                />
              </div>
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
              <div className="flex justify-center mb-4">
                <Image
                  src={`${process.env.NEXT_PUBLIC_R2_ASSETS_URL}/0fd4da87-6a9b-4447-9b24-0707bd323abc.webp`}
                  alt="みんなで作る一覧"
                  width={120}
                  height={120}
                />
              </div>
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
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">
            クラフトビール初心者の方へ
          </h2>
          <div className="flex justify-center mb-8">
            <Image
              src={`${process.env.NEXT_PUBLIC_R2_ASSETS_URL}/4a9c3c2e-25f8-47c7-b1e7-d7b9f54e4466.webp`}
              alt="初心者ガイド"
              width={280}
              height={280}
            />
          </div>
          <p className="text-lg mb-8 text-gray-600 leading-relaxed">
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
