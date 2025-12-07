"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { beerStyles, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// 管理者権限チェック
async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return { success: false, error: "認証が必要です" };
  }

  const [user] = await db.select().from(users).where(eq(users.id, authUser.id));

  if (!user || user.role !== "admin") {
    return { success: false, error: "管理者権限が必要です" };
  }

  return { success: true, user };
}

interface UpdateStyleInput {
  name: string;
  description: string | null;
  status: string;
}

// スタイルの更新
export async function updateStyle(styleId: number, input: UpdateStyleInput) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }

  try {
    // スラグを生成
    const slug = input.name
      .toLowerCase()
      .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || `style-${styleId}`;

    await db
      .update(beerStyles)
      .set({
        name: input.name,
        slug,
        description: input.description,
        status: input.status,
        updatedAt: new Date(),
      })
      .where(eq(beerStyles.id, styleId));

    revalidatePath("/admin/styles");
    revalidatePath("/styles");
    return { success: true };
  } catch (error) {
    console.error("Failed to update style:", error);
    return { success: false, error: "更新に失敗しました" };
  }
}

// スタイルの削除
export async function deleteStyle(styleId: number) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }

  try {
    await db.delete(beerStyles).where(eq(beerStyles.id, styleId));

    revalidatePath("/admin/styles");
    revalidatePath("/styles");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete style:", error);
    return { success: false, error: "削除に失敗しました（このスタイルを使用しているビールがある可能性があります）" };
  }
}

// スタイルのステータス変更
export async function updateStyleStatus(styleId: number, status: string) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }

  try {
    await db
      .update(beerStyles)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(beerStyles.id, styleId));

    revalidatePath("/admin/styles");
    revalidatePath("/styles");
    return { success: true };
  } catch (error) {
    console.error("Failed to update style status:", error);
    return { success: false, error: "ステータス更新に失敗しました" };
  }
}
