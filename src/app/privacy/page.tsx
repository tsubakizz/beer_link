import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description:
    "Beer Linkのプライバシーポリシー。個人情報の取り扱いについてご説明します。",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">プライバシーポリシー</h1>

      <div className="prose prose-gray max-w-none">
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b">1. はじめに</h2>
          <p className="text-gray-700 leading-relaxed">
            Beer
            Link（以下「当サイト」）は、ユーザーの個人情報の保護を重要視しています。本プライバシーポリシーは、当サイトがどのような情報を収集し、どのように利用・保護するかについて説明します。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b">
            2. 収集する情報
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            当サイトでは、以下の情報を収集することがあります。
          </p>

          <h3 className="text-lg font-semibold mb-2">2.1 アカウント情報</h3>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
            <li>メールアドレス</li>
            <li>表示名（ニックネーム）</li>
            <li>プロフィール画像</li>
            <li>
              Googleアカウント連携時に提供される情報（メールアドレス、名前、プロフィール画像）
            </li>
          </ul>

          <h3 className="text-lg font-semibold mb-2">
            2.2 ユーザーが投稿する情報
          </h3>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
            <li>ビールのレビュー・評価</li>
            <li>コメント</li>
            <li>アップロードした画像</li>
          </ul>

          <h3 className="text-lg font-semibold mb-2">2.3 お問い合わせ情報</h3>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
            <li>お問い合わせ時に入力されたメールアドレス</li>
            <li>お問い合わせ内容</li>
          </ul>

          <h3 className="text-lg font-semibold mb-2">
            2.4 自動的に収集される情報
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>アクセスログ（IPアドレス、ブラウザ情報、アクセス日時）</li>
            <li>Cookie情報</li>
            <li>Google Analyticsによる利用統計情報</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b">
            3. 情報の利用目的
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            収集した情報は、以下の目的で利用します。
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>サービスの提供・運営</li>
            <li>ユーザー認証・アカウント管理</li>
            <li>ユーザーサポートへの対応</li>
            <li>お問い合わせへの回答メール送信</li>
            <li>サービスの改善・新機能の開発</li>
            <li>利用状況の分析</li>
            <li>不正利用の防止</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b">
            4. 第三者サービスの利用
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            当サイトでは、以下の第三者サービスを利用しています。各サービスのプライバシーポリシーもご確認ください。
          </p>
          <div className="overflow-x-auto">
            <table className="table-auto w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">サービス</th>
                  <th className="px-4 py-2 text-left">用途</th>
                  <th className="px-4 py-2 text-left">プライバシーポリシー</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b">
                  <td className="px-4 py-2">Supabase</td>
                  <td className="px-4 py-2">認証・データベース</td>
                  <td className="px-4 py-2">
                    <a
                      href="https://supabase.com/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 hover:underline"
                    >
                      リンク
                    </a>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2">Cloudflare</td>
                  <td className="px-4 py-2">ホスティング・画像配信</td>
                  <td className="px-4 py-2">
                    <a
                      href="https://www.cloudflare.com/privacypolicy/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 hover:underline"
                    >
                      リンク
                    </a>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2">Google Analytics</td>
                  <td className="px-4 py-2">アクセス解析</td>
                  <td className="px-4 py-2">
                    <a
                      href="https://policies.google.com/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 hover:underline"
                    >
                      リンク
                    </a>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2">Google OAuth</td>
                  <td className="px-4 py-2">ソーシャルログイン</td>
                  <td className="px-4 py-2">
                    <a
                      href="https://policies.google.com/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 hover:underline"
                    >
                      リンク
                    </a>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2">Resend</td>
                  <td className="px-4 py-2">メール送信</td>
                  <td className="px-4 py-2">
                    <a
                      href="https://resend.com/legal/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 hover:underline"
                    >
                      リンク
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b">
            5. Cookieの使用
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            当サイトでは、以下の目的でCookieを使用しています。
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
            <li>ログイン状態の維持</li>
            <li>ユーザー設定の保存</li>
            <li>アクセス解析（Google Analytics）</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            ブラウザの設定によりCookieを無効にすることができますが、一部の機能が利用できなくなる場合があります。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b">
            6. 情報の共有・開示
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            当サイトは、以下の場合を除き、ユーザーの個人情報を第三者に提供しません。
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>ユーザーの同意がある場合</li>
            <li>法令に基づく場合</li>
            <li>人の生命、身体または財産の保護のために必要な場合</li>
            <li>
              サービス提供に必要な業務委託先への提供（機密保持契約を締結）
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b">
            7. ユーザーの権利
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            ユーザーは、以下の権利を有します。
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
            <li>
              <strong>アクセス権</strong>: 自身の個人情報へのアクセス
            </li>
            <li>
              <strong>訂正権</strong>: 不正確な情報の訂正を求める権利
            </li>
            <li>
              <strong>削除権</strong>:
              アカウントおよび関連データの削除を求める権利
            </li>
            <li>
              <strong>データポータビリティ</strong>:
              自身のデータのエクスポートを求める権利
            </li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            これらの権利を行使する場合は、
            <Link href="/contact" className="text-amber-600 hover:underline">
              お問い合わせフォーム
            </Link>
            よりご連絡ください。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b">
            8. データの保管
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>ユーザーデータは、アカウントが有効な間保管されます</li>
            <li>アカウント削除後、個人情報は30日以内に削除されます</li>
            <li>
              匿名化された統計データは、サービス改善のため保持することがあります
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b">
            9. セキュリティ
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            当サイトでは、以下のセキュリティ対策を実施しています。
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>SSL/TLSによる通信の暗号化</li>
            <li>パスワードのハッシュ化</li>
            <li>アクセス制御とログ監視</li>
            <li>定期的なセキュリティ更新</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b">
            10. 未成年者の利用
          </h2>
          <p className="text-gray-700 leading-relaxed">
            当サイトは、20歳未満の方の利用を想定していません。20歳未満の方は、保護者の同意を得た上でご利用ください。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b">
            11. プライバシーポリシーの変更
          </h2>
          <p className="text-gray-700 leading-relaxed">
            本ポリシーは、法令の改正やサービス内容の変更に伴い、予告なく変更することがあります。重要な変更がある場合は、当サイト上でお知らせします。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b">
            12. お問い合わせ
          </h2>
          <p className="text-gray-700 leading-relaxed">
            本ポリシーに関するお問い合わせは、
            <Link href="/contact" className="text-amber-600 hover:underline">
              お問い合わせフォーム
            </Link>
            よりご連絡ください。
          </p>
        </section>

        <div className="mt-12 pt-8 border-t text-sm text-gray-500">
          <p>制定日: 2025年12月15日</p>
          <p>最終更新日: 2025年12月15日</p>
        </div>
      </div>
    </div>
  );
}
