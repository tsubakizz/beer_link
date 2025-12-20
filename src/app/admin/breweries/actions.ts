"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { breweries, users } from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";
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

interface BreweryInput {
  name: string;
  shortDescription: string | null;
  description: string | null;
  prefectureId: number | null;
  address: string | null;
  websiteUrl: string | null;
  imageUrl: string | null;
  imageSourceUrl: string | null;
}

// ブルワリーの作成
export async function createBrewery(input: BreweryInput) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }

  // 重複チェック
  const [existingBrewery] = await db
    .select()
    .from(breweries)
    .where(eq(breweries.name, input.name));

  if (existingBrewery) {
    return { success: false, error: "同じ名前のブルワリーが既に登録されています" };
  }

  try {
    await db.insert(breweries).values({
      name: input.name,
      shortDescription: input.shortDescription,
      description: input.description,
      prefectureId: input.prefectureId,
      address: input.address,
      websiteUrl: input.websiteUrl,
      imageUrl: input.imageUrl,
      imageSourceUrl: input.imageSourceUrl,
      status: "approved",
    });

    revalidatePath("/admin/breweries");
    revalidatePath("/breweries");
    return { success: true };
  } catch (error) {
    console.error("Failed to create brewery:", error);
    return { success: false, error: "作成に失敗しました" };
  }
}

// ブルワリーの更新
export async function updateBrewery(breweryId: number, input: BreweryInput) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }

  // 重複チェック（自分自身を除く）
  const [existingBrewery] = await db
    .select()
    .from(breweries)
    .where(and(eq(breweries.name, input.name), ne(breweries.id, breweryId)));

  if (existingBrewery) {
    return { success: false, error: "同じ名前のブルワリーが既に登録されています" };
  }

  try {
    await db
      .update(breweries)
      .set({
        name: input.name,
        shortDescription: input.shortDescription,
        description: input.description,
        prefectureId: input.prefectureId,
        address: input.address,
        websiteUrl: input.websiteUrl,
        imageUrl: input.imageUrl,
        imageSourceUrl: input.imageSourceUrl,
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
