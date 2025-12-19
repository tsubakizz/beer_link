import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StyleSubmitForm } from "./StyleSubmitForm";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ビアスタイル追加 | beer_link",
  description: "新しいビアスタイルを追加できます",
};

// 認証チェックのため動的レンダリング
export const dynamic = "force-dynamic";

export default async function StyleSubmitPage() {
  // 認証チェック
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* パンくずリスト */}
        <Breadcrumb
          items={[
            { label: "ビアスタイル", href: "/styles" },
            { label: "追加" },
          ]}
        />

        <h1 className="text-3xl font-bold mb-2">ビアスタイル追加</h1>
        <p className="text-base-content/70 mb-8">
          サイトに掲載されていないビアスタイルを追加できます。
        </p>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <StyleSubmitForm />
          </div>
        </div>
      </div>
    </div>
  );
}
