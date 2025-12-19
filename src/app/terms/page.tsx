import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "利用規約",
  description: "Beer Linkの利用規約。サービスのご利用にあたっての規約をご確認ください。",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* パンくずリスト */}
      <Breadcrumb items={[{ label: "利用規約" }]} />

      <h1 className="text-3xl font-bold mb-8">利用規約</h1>

      <div className="prose prose-gray max-w-none">
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b">第1条（適用）</h2>
          <ol className="list-decimal list-inside text-gray-700 space-y-2">
            <li>
              本規約は、Beer
              Link（以下「当サイト」）が提供するすべてのサービス（以下「本サービス」）の利用条件を定めるものです。
            </li>
            <li>
              ユーザーは、本規約に同意した上で本サービスを利用するものとします。
            </li>
            <li>
              当サイトが別途定める個別規定やガイドラインは、本規約の一部を構成するものとします。
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b">
            第2条（アカウント）
          </h2>
          <ol className="list-decimal list-inside text-gray-700 space-y-2">
            <li>
              ユーザーは、自己の責任においてアカウントを管理するものとします。
            </li>
            <li>
              アカウントの不正利用による損害について、当サイトは一切の責任を負いません。
            </li>
            <li>
              ユーザーは、アカウントを第三者に譲渡、貸与、または共有することはできません。
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b">
            第3条（禁止事項）
          </h2>
          <p className="text-gray-700 mb-4">
            ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません。
          </p>
          <ol className="list-decimal list-inside text-gray-700 space-y-2">
            <li>法令または公序良俗に違反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>
              当サイトまたは第三者の知的財産権、肖像権、プライバシー、名誉その他の権利を侵害する行為
            </li>
            <li>
              虚偽または誤解を招く情報を投稿する行為
            </li>
            <li>
              他のユーザーまたは第三者を誹謗中傷する行為
            </li>
            <li>
              スパム、広告、勧誘、その他営利を目的とする行為（当サイトが許可したものを除く）
            </li>
            <li>
              不正アクセス、システムへの攻撃、またはサービスの運営を妨害する行為
            </li>
            <li>
              他のユーザーのアカウントを不正に使用する行為
            </li>
            <li>
              飲酒運転を助長または推奨する行為
            </li>
            <li>
              未成年者の飲酒を助長または推奨する行為
            </li>
            <li>
              その他、当サイトが不適切と判断する行為
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b">
            第4条（投稿コンテンツ）
          </h2>
          <ol className="list-decimal list-inside text-gray-700 space-y-2">
            <li>
              ユーザーが投稿したレビュー、コメント、画像等のコンテンツ（以下「投稿コンテンツ」）の著作権は、投稿したユーザーに帰属します。
            </li>
            <li>
              ユーザーは、当サイトに対し、投稿コンテンツを本サービスの提供、改善、宣伝のために無償で利用する権利を許諾するものとします。
            </li>
            <li>
              当サイトは、投稿コンテンツが本規約に違反すると判断した場合、事前の通知なく削除することができます。
            </li>
            <li>
              ユーザーは、投稿コンテンツについて、第三者の権利を侵害していないことを保証するものとします。
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b">
            第5条（サービスの変更・中断・終了）
          </h2>
          <ol className="list-decimal list-inside text-gray-700 space-y-2">
            <li>
              当サイトは、ユーザーへの事前の通知なく、本サービスの内容を変更または終了することができます。
            </li>
            <li>
              当サイトは、以下の場合に本サービスの全部または一部を中断することができます。
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>システムの保守、更新を行う場合</li>
                <li>天災、停電、その他の不可抗力により提供が困難な場合</li>
                <li>その他、当サイトが必要と判断した場合</li>
              </ul>
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b">
            第6条（免責事項）
          </h2>
          <ol className="list-decimal list-inside text-gray-700 space-y-2">
            <li>
              当サイトは、本サービスに関して、その正確性、完全性、有用性、特定目的への適合性等について、いかなる保証も行いません。
            </li>
            <li>
              当サイトは、ユーザーが本サービスを利用したことにより生じた損害について、一切の責任を負いません。
            </li>
            <li>
              当サイトは、ユーザー間または第三者との間で生じたトラブルについて、一切の責任を負いません。
            </li>
            <li>
              本サービスに掲載されているビール、ブルワリー等の情報は、ユーザーの投稿や公開情報に基づくものであり、当サイトがその正確性を保証するものではありません。
            </li>
            <li>
              本サービスでは、AI（人工知能）によって生成された情報を表示している箇所があります。AI生成コンテンツの正確性、信頼性について、当サイトは一切の保証を行いません。
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b">
            第7条（アカウントの停止・削除）
          </h2>
          <ol className="list-decimal list-inside text-gray-700 space-y-2">
            <li>
              当サイトは、ユーザーが以下のいずれかに該当すると判断した場合、事前の通知なくアカウントの停止または削除を行うことができます。
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>本規約に違反した場合</li>
                <li>登録情報に虚偽があった場合</li>
                <li>その他、当サイトがアカウントの継続を不適当と判断した場合</li>
              </ul>
            </li>
            <li>
              アカウントの停止または削除により生じた損害について、当サイトは一切の責任を負いません。
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b">
            第8条（規約の変更）
          </h2>
          <ol className="list-decimal list-inside text-gray-700 space-y-2">
            <li>
              当サイトは、必要に応じて本規約を変更することができます。
            </li>
            <li>
              変更後の規約は、当サイト上に掲載した時点から効力を生じるものとします。
            </li>
            <li>
              重要な変更がある場合は、当サイト上でお知らせします。
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b">
            第9条（準拠法・管轄）
          </h2>
          <ol className="list-decimal list-inside text-gray-700 space-y-2">
            <li>本規約の解釈は、日本法に準拠するものとします。</li>
            <li>
              本サービスに関して紛争が生じた場合、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b">
            第10条（お問い合わせ）
          </h2>
          <p className="text-gray-700 leading-relaxed">
            本規約に関するお問い合わせは、
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
