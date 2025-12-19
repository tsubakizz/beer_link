import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "送信完了 | beer_link",
  description: "お問い合わせの送信が完了しました",
};

export default function ContactCompletePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* パンくずリスト */}
        <Breadcrumb
          items={[
            { label: "お問い合わせ", href: "/contact" },
            { label: "送信完了" },
          ]}
        />

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✉️</div>
              <h1 className="text-2xl font-bold mb-2">送信完了</h1>
              <p className="text-base-content/70 mb-6">
                お問い合わせいただきありがとうございます。
                <br />
                個人運営のサイトのため、ご返信できない場合がございます。
                <br />
                あらかじめご了承ください。
              </p>
              <Link href="/" className="btn btn-primary">
                トップページへ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
