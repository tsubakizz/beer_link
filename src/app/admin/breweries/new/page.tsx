import { db } from "@/lib/db";
import { prefectures } from "@/lib/db/schema";
import Link from "next/link";
import { BreweryForm } from "../BreweryForm";

export const dynamic = "force-dynamic";

export default async function NewBreweryPage() {
  // 都道府県一覧を取得
  const prefectureList = await db
    .select({ id: prefectures.id, name: prefectures.name })
    .from(prefectures)
    .orderBy(prefectures.id);

  return (
    <div>
      {/* パンくずリスト */}
      <div className="breadcrumbs text-sm mb-6">
        <ul>
          <li>
            <Link href="/admin">管理画面</Link>
          </li>
          <li>
            <Link href="/admin/breweries">ブルワリー管理</Link>
          </li>
          <li>新規作成</li>
        </ul>
      </div>

      <h1 className="text-3xl font-bold mb-8">ブルワリーを作成</h1>

      <BreweryForm prefectures={prefectureList} />
    </div>
  );
}
