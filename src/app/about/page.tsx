import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "サイトについて",
  description:
    "Beer Linkはクラフトビール情報共有プラットフォームです。ビールの一覧、レビュー投稿、初心者ガイドなど、クラフトビールをもっと楽しむための機能を提供しています。",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* パンくずリスト */}
      <Breadcrumb items={[{ label: "サイトについて" }]} />

      <h1 className="text-3xl font-bold mb-8">サイトについて</h1>

      <div className="prose prose-gray max-w-none">
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b">
            Beer Linkとは
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Beer
            Linkは、クラフトビールをもっと楽しむための情報共有プラットフォームです。
            日本全国のクラフトビールやブルワリーの情報を集め、ビール好きの皆さんが気軽に情報交換できる場を目指しています。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b">できること</h2>
          <div className="space-y-4">
            <div className="bg-amber-50 rounded-lg p-4">
              <h3 className="font-bold text-amber-900 mb-2">
                ビール・ブルワリー・ビアスタイルの閲覧
              </h3>
              <p className="text-gray-700 text-sm">
                様々なクラフトビールの情報を一覧で確認できます。味わいの特徴をレーダーチャートで視覚的に表示し、自分好みのビールを見つけやすくしています。
              </p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <h3 className="font-bold text-amber-900 mb-2">レビュー投稿</h3>
              <p className="text-gray-700 text-sm">
                実際に飲んだビールの感想を投稿できます。味の評価を細かく記録して、他のユーザーと情報を共有しましょう。
              </p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <h3 className="font-bold text-amber-900 mb-2">
                ビール追加申請
              </h3>
              <p className="text-gray-700 text-sm">
                まだ掲載されていないビールがあれば、追加申請が可能です。ユーザーの皆さんの力で一覧を充実させていきます。
              </p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <h3 className="font-bold text-amber-900 mb-2">初心者ガイド</h3>
              <p className="text-gray-700 text-sm">
                クラフトビール初心者の方向けに、ビアスタイルの違いやテイスティングの方法などを解説したガイドを用意しています。
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b">
            サービスの特徴
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>
              <strong>味わいの可視化</strong>:
              苦味、甘味、酸味などの味わいをレーダーチャートで直感的に把握できます
            </li>
            <li>
              <strong>ユーザー参加型</strong>:
              レビュー投稿やビール追加申請など、ユーザーの皆さんと一緒にサイトを作り上げていきます
            </li>
            <li>
              <strong>無料で利用可能</strong>:
              アカウント登録から全ての機能まで、無料でご利用いただけます
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b">ご利用にあたって</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>
              お酒は20歳になってから。未成年者の飲酒は法律で禁止されています。
            </li>
            <li>飲酒運転は法律で禁止されています。</li>
            <li>
              本サイトでは、一部AIによって生成された情報を表示している箇所があります。情報の正確性については保証いたしかねますので、参考程度にご覧ください。
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b">関連リンク</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>
              <Link href="/guides" className="text-amber-600 hover:underline">
                ビール入門ガイド
              </Link>
              : クラフトビール初心者の方はこちら
            </li>
            <li>
              <Link href="/terms" className="text-amber-600 hover:underline">
                利用規約
              </Link>
              : サービスのご利用にあたっての規約
            </li>
            <li>
              <Link href="/privacy" className="text-amber-600 hover:underline">
                プライバシーポリシー
              </Link>
              : 個人情報の取り扱いについて
            </li>
            <li>
              <Link href="/contact" className="text-amber-600 hover:underline">
                お問い合わせ
              </Link>
              : ご質問・ご要望はこちら
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
