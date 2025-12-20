import Link from "next/link";
import { StyleForm } from "../StyleForm";

export const dynamic = "force-dynamic";

export default function NewStylePage() {
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
          <li>新規作成</li>
        </ul>
      </div>

      <h1 className="text-3xl font-bold mb-8">スタイルを新規作成</h1>

      <StyleForm />
    </div>
  );
}
