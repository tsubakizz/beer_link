import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "テイスティングガイド - ビールの味わい方 | beer_link",
  description:
    "ビールのテイスティング方法を学ぼう。香り、味、見た目の楽しみ方から、フードペアリングまで詳しく解説します。",
};

export default function TastingGuidePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* パンくず */}
      <div className="text-sm breadcrumbs mb-6">
        <ul>
          <li>
            <Link href="/guides">ガイド</Link>
          </li>
          <li>テイスティングガイド</li>
        </ul>
      </div>

      {/* ヘッダー */}
      <div className="text-center mb-12">
        <span className="text-6xl mb-4 block">👃</span>
        <h1 className="text-4xl font-bold mb-4">テイスティングガイド</h1>
        <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
          ビールをより深く楽しむためのテイスティング方法をマスターしよう
        </p>
      </div>

      {/* コンテンツ */}
      <article className="prose prose-lg max-w-3xl mx-auto">
        {/* テイスティングの準備 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span>🍻</span> テイスティングの準備
          </h2>
          <p>
            ビールを最大限に楽しむためには、適切な準備が大切です。
            以下のポイントを押さえて、ベストな状態でテイスティングしましょう。
          </p>
          <div className="not-prose grid md:grid-cols-2 gap-4">
            <div className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title text-lg">🌡️ 適切な温度</h3>
                <p className="text-sm text-base-content/70">
                  スタイルによって最適な温度が異なります。
                  ラガーは4〜7℃、エールは8〜12℃、スタウトは10〜14℃が目安。
                </p>
              </div>
            </div>
            <div className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title text-lg">🥂 グラス選び</h3>
                <p className="text-sm text-base-content/70">
                  グラスの形状で香りの立ち方が変わります。
                  迷ったらチューリップ型がおすすめ。清潔なグラスを使いましょう。
                </p>
              </div>
            </div>
            <div className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title text-lg">🫧 注ぎ方</h3>
                <p className="text-sm text-base-content/70">
                  グラスを45度に傾けてゆっくり注ぎ、最後は立てて泡を作ります。
                  泡は香りを閉じ込め、酸化を防ぐ役割があります。
                </p>
              </div>
            </div>
            <div className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title text-lg">🚫 避けるべきこと</h3>
                <p className="text-sm text-base-content/70">
                  強い香水や食後すぐのテイスティングは避けましょう。
                  タバコの煙や香りの強い食べ物も味覚に影響します。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* テイスティングの5ステップ */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span>📝</span> テイスティングの5ステップ
          </h2>
          <p>
            プロのテイスターも実践している基本的なステップです。
            順番に行うことで、ビールの特徴をより深く理解できます。
          </p>

          {/* Step 1: 見る */}
          <div className="not-prose my-8">
            <div className="flex flex-col sm:flex-row items-start gap-4 bg-amber-50 rounded-xl p-4 sm:p-6">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-lg sm:text-xl">
                1
              </div>
              <div>
                <h3 className="font-bold text-lg sm:text-xl mb-2">👁️ 見る (Appearance)</h3>
                <p className="text-base-content/70 mb-3">
                  グラスを光にかざして観察します。
                </p>
                <ul className="space-y-1 text-sm">
                  <li>• <strong>色</strong>: 薄い黄色から真っ黒まで様々</li>
                  <li>• <strong>透明度</strong>: クリア or にごり（ヘイジー）</li>
                  <li>• <strong>泡</strong>: きめ細かさ、持続性、色</li>
                  <li>• <strong>炭酸</strong>: 泡の立ち上がり具合</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 2: 嗅ぐ */}
          <div className="not-prose my-8">
            <div className="flex flex-col sm:flex-row items-start gap-4 bg-yellow-50 rounded-xl p-4 sm:p-6">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold text-lg sm:text-xl">
                2
              </div>
              <div>
                <h3 className="font-bold text-lg sm:text-xl mb-2">👃 嗅ぐ (Aroma)</h3>
                <p className="text-base-content/70 mb-3">
                  グラスを回して香りを立たせ、鼻を近づけて嗅ぎます。
                </p>
                <ul className="space-y-1 text-sm">
                  <li>• <strong>モルト由来</strong>: パン、ビスケット、カラメル、コーヒー、チョコレート</li>
                  <li>• <strong>ホップ由来</strong>: 柑橘、松、草、花、トロピカルフルーツ</li>
                  <li>• <strong>酵母由来</strong>: バナナ、クローブ、スパイス</li>
                  <li>• <strong>その他</strong>: アルコール、酸味、木樽の香りなど</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 3: 味わう */}
          <div className="not-prose my-8">
            <div className="flex flex-col sm:flex-row items-start gap-4 bg-orange-50 rounded-xl p-4 sm:p-6">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg sm:text-xl">
                3
              </div>
              <div>
                <h3 className="font-bold text-lg sm:text-xl mb-2">👅 味わう (Taste)</h3>
                <p className="text-base-content/70 mb-3">
                  一口含んで舌全体に行き渡らせます。
                </p>
                <ul className="space-y-1 text-sm">
                  <li>• <strong>甘味</strong>: モルトの残糖による甘さ</li>
                  <li>• <strong>苦味</strong>: ホップや焙煎麦芽の苦さ</li>
                  <li>• <strong>酸味</strong>: 特にサワービールやランビックで顕著</li>
                  <li>• <strong>塩味</strong>: ゴーゼなど一部のスタイル</li>
                  <li>• <strong>うま味</strong>: 熟成により生まれることも</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 4: 感じる */}
          <div className="not-prose my-8">
            <div className="flex flex-col sm:flex-row items-start gap-4 bg-red-50 rounded-xl p-4 sm:p-6">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-lg sm:text-xl">
                4
              </div>
              <div>
                <h3 className="font-bold text-lg sm:text-xl mb-2">✋ 感じる (Mouthfeel)</h3>
                <p className="text-base-content/70 mb-3">
                  口の中での触感や質感を感じ取ります。
                </p>
                <ul className="space-y-1 text-sm">
                  <li>• <strong>ボディ</strong>: ライト、ミディアム、フル（重さ・厚み）</li>
                  <li>• <strong>炭酸感</strong>: シャープ、クリーミー、フラット</li>
                  <li>• <strong>収斂性</strong>: 渋み、ドライ感</li>
                  <li>• <strong>温感</strong>: アルコールによる温かさ</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 5: 余韻 */}
          <div className="not-prose my-8">
            <div className="flex flex-col sm:flex-row items-start gap-4 bg-purple-50 rounded-xl p-4 sm:p-6">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-lg sm:text-xl">
                5
              </div>
              <div>
                <h3 className="font-bold text-lg sm:text-xl mb-2">⏳ 余韻 (Finish)</h3>
                <p className="text-base-content/70 mb-3">
                  飲み込んだ後に残る味わいを感じます。
                </p>
                <ul className="space-y-1 text-sm">
                  <li>• <strong>長さ</strong>: 短い、中程度、長い</li>
                  <li>• <strong>変化</strong>: 最初と最後で味が変わるか</li>
                  <li>• <strong>後味</strong>: 苦い、甘い、ドライ、クリーンなど</li>
                  <li>• <strong>次の一口</strong>: また飲みたくなるか</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* フードペアリング */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span>🍽️</span> フードペアリング
          </h2>
          <p>
            ビールと料理の組み合わせで、両方の美味しさが引き立ちます。
            基本的なペアリングの考え方を覚えておきましょう。
          </p>
          <div className="not-prose overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>ビアスタイル</th>
                  <th>相性の良い料理</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-medium">ピルスナー</td>
                  <td>寿司、天ぷら、サラダ、軽めの魚料理</td>
                </tr>
                <tr>
                  <td className="font-medium">ペールエール</td>
                  <td>ハンバーガー、フライドチキン、ピザ</td>
                </tr>
                <tr>
                  <td className="font-medium">IPA</td>
                  <td>スパイシーなカレー、タイ料理、メキシカン</td>
                </tr>
                <tr>
                  <td className="font-medium">ヴァイツェン</td>
                  <td>ソーセージ、シーフード、フルーツデザート</td>
                </tr>
                <tr>
                  <td className="font-medium">スタウト</td>
                  <td>牡蠣、BBQ、チョコレートデザート</td>
                </tr>
                <tr>
                  <td className="font-medium">サワービール</td>
                  <td>チーズ、前菜、デザート全般</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-base-200 rounded-lg p-4 mt-4 not-prose">
            <h4 className="font-bold mb-2">ペアリングの基本原則</h4>
            <ul className="text-sm space-y-1 text-base-content/70">
              <li>• <strong>同調</strong>: 似た風味を合わせる（チョコレートケーキ × スタウト）</li>
              <li>• <strong>対比</strong>: 異なる要素を引き立てる（辛い料理 × IPA）</li>
              <li>• <strong>洗い流し</strong>: 脂っこい料理をさっぱりさせる（揚げ物 × ピルスナー）</li>
            </ul>
          </div>
        </section>

        {/* 実践してみよう */}
        <section className="not-prose">
          <div className="bg-primary/10 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">実践してみよう！</h2>
            <p className="text-base-content/70 mb-6">
              知識を学んだら、実際にビールをテイスティングしてみましょう。
              感じたことをレビューに残すと、自分の好みが見えてきます。
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/beers" className="btn btn-primary">
                ビールを探す
              </Link>
              <Link href="/styles" className="btn btn-outline">
                スタイルから選ぶ
              </Link>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}
