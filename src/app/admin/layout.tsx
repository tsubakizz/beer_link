import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "管理画面 | beer_link",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login?redirectTo=/admin");
  }

  // ユーザーの権限を確認
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser.id));

  if (!user || user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* 管理者ナビゲーション */}
      <div className="bg-base-100 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6 h-14">
            <Link href="/admin" className="font-bold text-lg">
              管理画面
            </Link>
            <div className="flex gap-4">
              <Link href="/admin" className="link link-hover text-sm">
                ダッシュボード
              </Link>
              <Link href="/admin/beers" className="link link-hover text-sm">
                ビール管理
              </Link>
              <Link href="/admin/styles" className="link link-hover text-sm">
                スタイル管理
              </Link>
              <Link href="/admin/breweries" className="link link-hover text-sm">
                ブルワリー管理
              </Link>
            </div>
            <div className="ml-auto">
              <Link href="/" className="btn btn-ghost btn-sm">
                サイトへ戻る
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
