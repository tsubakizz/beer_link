"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { breweries, users } from "@/lib/db/schema";
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

interface UpdateBreweryInput {
  name: string;
  description: string | null;
  prefectureId: number | null;
  address: string | null;
  websiteUrl: string | null;
  imageUrl: string | null;
  status: string;
}

// ブルワリーの更新
export async function updateBrewery(breweryId: number, input: UpdateBreweryInput) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }

  try {
    await db
      .update(breweries)
      .set({
        name: input.name,
        description: input.description,
        prefectureId: input.prefectureId,
        address: input.address,
        websiteUrl: input.websiteUrl,
        imageUrl: input.imageUrl,
        status: input.status,
        updatedAt: new Date(),
      })
      .where(eq(breweries.id, breweryId));

    revalidatePath("/admin/breweries");
    revalidatePath("/breweries");
    return { success: true };
  } catch (error) {
    console.error("Failed to update brewery:", error);
    return { success: false, error: "更新に失敗しました" };
  }
}

// ブルワリーの削除
export async function deleteBrewery(breweryId: number) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }

  try {
    await db.delete(breweries).where(eq(breweries.id, breweryId));

    revalidatePath("/admin/breweries");
    revalidatePath("/breweries");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete brewery:", error);
    return { success: false, error: "削除に失敗しました（このブルワリーに登録されているビールがある可能性があります）" };
  }
}

// ブルワリーのステータス変更
export async function updateBreweryStatus(breweryId: number, status: string) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }

  try {
    await db
      .update(breweries)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(breweries.id, breweryId));

    revalidatePath("/admin/breweries");
    revalidatePath("/breweries");
    return { success: true };
  } catch (error) {
    console.error("Failed to update brewery status:", error);
    return { success: false, error: "ステータス更新に失敗しました" };
  }
}
