"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { contacts, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// 管理者権限チェック
async function checkAdmin() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return { success: false, error: "認証が必要です" };
  }

  const [user] = await db.select().from(users).where(eq(users.id, authUser.id));

  if (!user || user.role !== "admin") {
    return { success: false, error: "管理者権限が必要です" };
  }

  return { success: true, user };
}

// ステータス更新
export async function updateContactStatus(contactId: number, status: string) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }

  const validStatuses = ["pending", "read", "replied", "closed"];
  if (!validStatuses.includes(status)) {
    return { success: false, error: "無効なステータスです" };
  }

  try {
    await db
      .update(contacts)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(contacts.id, contactId));

    revalidatePath("/admin/contacts");
    return { success: true };
  } catch (error) {
    console.error("Failed to update contact status:", error);
    return { success: false, error: "ステータスの更新に失敗しました" };
  }
}

// 管理者メモ更新
export async function updateAdminNote(contactId: number, note: string) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }

  try {
    await db
      .update(contacts)
      .set({
        adminNote: note,
        updatedAt: new Date(),
      })
      .where(eq(contacts.id, contactId));

    revalidatePath("/admin/contacts");
    return { success: true };
  } catch (error) {
    console.error("Failed to update admin note:", error);
    return { success: false, error: "メモの更新に失敗しました" };
  }
}
