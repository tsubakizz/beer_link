import { db } from "@/lib/db";
import { beerStyles, beerStyleOtherNames } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StyleForm } from "../../StyleForm";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditStylePage({ params }: Props) {
  const { id } = await params;
  const styleId = parseInt(id, 10);

  if (isNaN(styleId)) {
    notFound();
  }

  // スタイル情報を取得
  const [style] = await db.select().from(beerStyles).where(eq(beerStyles.id, styleId));

  if (!style) {
    notFound();
  }

  // 別名を取得
  const otherNamesList = await db
    .select({ name: beerStyleOtherNames.name })
    .from(beerStyleOtherNames)
    .where(eq(beerStyleOtherNames.styleId, styleId));

  const styleWithOtherNames = {
    ...style,
    otherNames: otherNamesList.map((n) => n.name),
  };

  return (
    <div>
      {/* パンくずリスト */}
      <div className="breadcrumbs text-sm mb-6">
        <ul>
          <li>
            <Link href="/admin">管理画面</Link>
          </li>
          <li>
            <Link href="/admin/styles">スタイル管理</Link>
          </li>
          <li>編集</li>
        </ul>
      </div>

      <h1 className="text-3xl font-bold mb-8">スタイルを編集</h1>

      <StyleForm style={styleWithOtherNames} />
    </div>
  );
}
