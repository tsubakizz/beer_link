import { db } from "@/lib/db";
import { breweries, prefectures } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BreweryForm } from "../../BreweryForm";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBreweryPage({ params }: Props) {
  const { id } = await params;
  const breweryId = parseInt(id, 10);

  if (isNaN(breweryId)) {
    notFound();
  }

  // ブルワリー情報を取得
  const [brewery] = await db
    .select({
      id: breweries.id,
      name: breweries.name,
      shortDescription: breweries.shortDescription,
      description: breweries.description,
      prefectureId: breweries.prefectureId,
      address: breweries.address,
      websiteUrl: breweries.websiteUrl,
      imageUrl: breweries.imageUrl,
      imageSourceUrl: breweries.imageSourceUrl,
      amazonUrl: breweries.amazonUrl,
      rakutenUrl: breweries.rakutenUrl,
      otherShopUrl: breweries.otherShopUrl,
      status: breweries.status,
    })
    .from(breweries)
    .where(eq(breweries.id, breweryId));

  if (!brewery) {
    notFound();
  }

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
          <li>編集</li>
        </ul>
      </div>

      <h1 className="text-3xl font-bold mb-8">ブルワリーを編集</h1>

      <BreweryForm brewery={brewery} prefectures={prefectureList} />
    </div>
  );
}
