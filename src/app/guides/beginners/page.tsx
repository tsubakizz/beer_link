import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ビール入門 - 基礎知識を学ぼう | beer_link",
  description:
    "ビールの基礎知識を学ぼう。原材料、製造工程、ビアスタイルの違いなど、ビールの世界への第一歩を踏み出しましょう。",
};

export default function BeginnersGuidePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* パンくず */}
      <div className="text-sm breadcrumbs mb-6">
        <ul>
          <li>
            <Link href="/guides">ガイド</Link>
          </li>
          <li>ビール入門</li>
        </ul>
      </div>

      {/* ヘッダー */}
      <div className="text-center mb-12">
        <span className="text-6xl mb-4 block">🍺</span>
        <h1 className="text-4xl font-bold mb-4">ビール入門</h1>
        <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
          ビールの基礎知識を学んで、クラフトビールの世界をもっと楽しもう
        </p>
      </div>

      {/* コンテンツ */}
      <article className="prose prose-lg max-w-3xl mx-auto">
        {/* ビールとは */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span>🌾</span> ビールとは？
          </h2>
          <p>
            ビールは、麦芽（モルト）、ホップ、水、酵母の4つの基本原料から作られる醸造酒です。
            世界中で最も広く飲まれているアルコール飲料の一つで、その歴史は紀元前数千年にまで遡ります。
          </p>
          <div className="bg-base-200 rounded-lg p-6 not-prose">
            <h3 className="font-bold mb-4">ビールの4大原料</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <span className="text-3xl block mb-2">🌾</span>
                <span className="font-medium">麦芽</span>
                <p className="text-sm text-base-content/60">甘みと色の元</p>
              </div>
              <div className="text-center">
                <span className="text-3xl block mb-2">🌿</span>
                <span className="font-medium">ホップ</span>
                <p className="text-sm text-base-content/60">苦味と香り</p>
              </div>
              <div className="text-center">
                <span className="text-3xl block mb-2">💧</span>
                <span className="font-medium">水</span>
                <p className="text-sm text-base-content/60">90%以上を占める</p>
              </div>
              <div className="text-center">
                <span className="text-3xl block mb-2">🦠</span>
                <span className="font-medium">酵母</span>
                <p className="text-sm text-base-content/60">発酵を促す</p>
              </div>
            </div>
          </div>
        </section>

        {/* エールとラガー */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span>🔬</span> エールとラガーの違い
          </h2>
          <p>
            ビールは大きく「エール」と「ラガー」の2種類に分類されます。
            この違いは使用する酵母と発酵温度によって決まります。
          </p>
          <div className="grid md:grid-cols-2 gap-6 not-prose">
            <div className="card bg-amber-50 border border-amber-200">
              <div className="card-body">
                <h3 className="card-title text-amber-800">エール (Ale)</h3>
                <ul className="space-y-2 text-sm">
                  <li>• 上面発酵酵母を使用</li>
                  <li>• 15〜25℃の温度で発酵</li>
                  <li>• フルーティーで複雑な香り</li>
                  <li>• IPA、ペールエール、スタウトなど</li>
                </ul>
              </div>
            </div>
            <div className="card bg-yellow-50 border border-yellow-200">
              <div className="card-body">
                <h3 className="card-title text-yellow-800">ラガー (Lager)</h3>
                <ul className="space-y-2 text-sm">
                  <li>• 下面発酵酵母を使用</li>
                  <li>• 5〜10℃の低温で発酵</li>
                  <li>• すっきりとクリアな味わい</li>
                  <li>• ピルスナー、ヘレス、ボックなど</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ビアスタイル */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span>📚</span> 代表的なビアスタイル
          </h2>
          <p>
            世界には100種類以上のビアスタイルがあります。
            ここでは初心者におすすめの代表的なスタイルを紹介します。
          </p>
          <div className="space-y-4 not-prose">
            <div className="bg-base-200 rounded-lg p-4">
              <h4 className="font-bold text-lg">ピルスナー (Pilsner)</h4>
              <p className="text-base-content/70 text-sm mt-1">
                チェコ発祥の黄金色のラガー。すっきりとした苦味とキレの良さが特徴。
                日本の大手ビールもこのスタイルがベース。初心者に最もおすすめ。
              </p>
            </div>
            <div className="bg-base-200 rounded-lg p-4">
              <h4 className="font-bold text-lg">ペールエール (Pale Ale)</h4>
              <p className="text-base-content/70 text-sm mt-1">
                イギリス発祥のエール。ホップの香りと程よい苦味が特徴。
                クラフトビール入門に最適なバランスの取れたスタイル。
              </p>
            </div>
            <div className="bg-base-200 rounded-lg p-4">
              <h4 className="font-bold text-lg">IPA (India Pale Ale)</h4>
              <p className="text-base-content/70 text-sm mt-1">
                ホップを大量に使用した苦味の強いエール。
                柑橘系やトロピカルな香りが特徴。クラフトビールの代表格。
              </p>
            </div>
            <div className="bg-base-200 rounded-lg p-4">
              <h4 className="font-bold text-lg">ヴァイツェン (Weizen)</h4>
              <p className="text-base-content/70 text-sm mt-1">
                小麦を使ったドイツのエール。バナナやクローブのような香りが特徴。
                苦味が少なく、ビールが苦手な人にもおすすめ。
              </p>
            </div>
            <div className="bg-base-200 rounded-lg p-4">
              <h4 className="font-bold text-lg">スタウト (Stout)</h4>
              <p className="text-base-content/70 text-sm mt-1">
                焙煎した麦芽を使った黒ビール。コーヒーやチョコレートのような風味。
                ギネスが有名。意外と飲みやすく、甘いデザートとも相性◎。
              </p>
            </div>
          </div>
          <div className="mt-6 text-center not-prose">
            <Link href="/styles" className="btn btn-primary">
              すべてのビアスタイルを見る
            </Link>
          </div>
        </section>

        {/* 用語集 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span>📖</span> 知っておきたい用語
          </h2>
          <div className="not-prose">
            <dl className="space-y-4">
              <div className="bg-base-200 rounded-lg p-4">
                <dt className="font-bold">ABV (Alcohol By Volume)</dt>
                <dd className="text-base-content/70 text-sm mt-1">
                  アルコール度数。一般的なビールは4〜6%、ストロングエールは8%以上のものも。
                </dd>
              </div>
              <div className="bg-base-200 rounded-lg p-4">
                <dt className="font-bold">IBU (International Bitterness Units)</dt>
                <dd className="text-base-content/70 text-sm mt-1">
                  苦味の指標。数値が高いほど苦い。ピルスナーは20〜40、IPAは40〜100程度。
                </dd>
              </div>
              <div className="bg-base-200 rounded-lg p-4">
                <dt className="font-bold">SRM (Standard Reference Method)</dt>
                <dd className="text-base-content/70 text-sm mt-1">
                  ビールの色の指標。数値が高いほど濃い色。ピルスナーは2〜4、スタウトは30以上。
                </dd>
              </div>
              <div className="bg-base-200 rounded-lg p-4">
                <dt className="font-bold">ドライホッピング</dt>
                <dd className="text-base-content/70 text-sm mt-1">
                  発酵後にホップを追加する技法。苦味を増やさずに香りを強くできる。
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* 次のステップ */}
        <section className="not-prose">
          <div className="bg-primary/10 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">次のステップへ</h2>
            <p className="text-base-content/70 mb-6">
              基礎知識を学んだら、実際にビールを味わってみましょう。
              テイスティングガイドで、より深くビールを楽しむ方法を学べます。
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/guides/tasting" className="btn btn-primary">
                テイスティングガイドへ
              </Link>
              <Link href="/beers" className="btn btn-outline">
                ビールを探す
              </Link>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}
