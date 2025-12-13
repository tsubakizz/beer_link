import { db } from "@/lib/db";
import { contacts, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { ContactCard } from "./ContactCard";
import { ContactTabs } from "./ContactTabs";
import { ContactPagination } from "./ContactPagination";

// ビルド時にDBに接続できないため動的レンダリング
export const dynamic = "force-dynamic";

const PER_PAGE = 20;

interface Props {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function ContactsPage({ searchParams }: Props) {
  const params = await searchParams;
  const activeStatus = params.status || "pending";
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const offset = (currentPage - 1) * PER_PAGE;

  // 問い合わせ一覧を取得（ページング付き）
  const contactList = await db
    .select({
      id: contacts.id,
      name: contacts.name,
      email: contacts.email,
      subject: contacts.subject,
      message: contacts.message,
      status: contacts.status,
      adminNote: contacts.adminNote,
      createdAt: contacts.createdAt,
      submitter: {
        id: users.id,
        displayName: users.displayName,
        email: users.email,
      },
    })
    .from(contacts)
    .leftJoin(users, eq(contacts.submittedBy, users.id))
    .where(eq(contacts.status, activeStatus))
    .orderBy(desc(contacts.createdAt))
    .limit(PER_PAGE)
    .offset(offset);

  // ステータスごとの件数を取得
  const allContacts = await db.select({ status: contacts.status }).from(contacts);
  const counts = {
    pending: allContacts.filter((c) => c.status === "pending").length,
    read: allContacts.filter((c) => c.status === "read").length,
    replied: allContacts.filter((c) => c.status === "replied").length,
    closed: allContacts.filter((c) => c.status === "closed").length,
  };

  // 現在のステータスの総件数からページ数を計算
  const totalCount = counts[activeStatus as keyof typeof counts] || 0;
  const totalPages = Math.ceil(totalCount / PER_PAGE);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">問い合わせ管理</h1>

      <ContactTabs activeStatus={activeStatus} counts={counts} />

      <div className="mt-6">
        {contactList.length > 0 ? (
          <div className="space-y-4">
            {contactList.map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-base-100 rounded-lg">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-base-content/60">
              {activeStatus === "pending" && "未対応の問い合わせはありません"}
              {activeStatus === "read" && "確認済みの問い合わせはありません"}
              {activeStatus === "replied" && "返信済みの問い合わせはありません"}
              {activeStatus === "closed" && "完了した問い合わせはありません"}
            </p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <ContactPagination
          currentPage={currentPage}
          totalPages={totalPages}
          status={activeStatus}
        />
      )}
    </div>
  );
}
