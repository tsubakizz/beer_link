import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BrewerySubmitForm } from "./BrewerySubmitForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ブルワリー追加 | beer_link",
  description: "新しいブルワリーを追加できます",
};

// 認証チェックのため動的レンダリング
export const dynamic = "force-dynamic";

export default async function BrewerySubmitPage() {
  // 認証チェック
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-2">ブルワリー追加</h1>
        <p className="text-base-content/70 mb-8">
          サイトに掲載されていないブルワリーを追加できます。
        </p>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <BrewerySubmitForm />
          </div>
        </div>
      </div>
    </div>
  );
}
