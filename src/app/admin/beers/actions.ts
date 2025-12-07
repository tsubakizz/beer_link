"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { beers, users } from "@/lib/db/schema";
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

interface UpdateBeerInput {
  name: string;
  breweryId: number;
  styleId: number | null;
  abv: string | null;
  ibu: number | null;
  description: string | null;
  status: string;
  imageUrl: string | null;
}

// ビールの更新
export async function updateBeer(beerId: number, input: UpdateBeerInput) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }

  try {
    await db
      .update(beers)
      .set({
        name: input.name,
        breweryId: input.breweryId,
        styleId: input.styleId,
        abv: input.abv,
        ibu: input.ibu,
        description: input.description,
        status: input.status,
        imageUrl: input.imageUrl,
        updatedAt: new Date(),
      })
      .where(eq(beers.id, beerId));

    revalidatePath("/admin/beers");
    revalidatePath("/beers");
    return { success: true };
  } catch (error) {
    console.error("Failed to update beer:", error);
    return { success: false, error: "更新に失敗しました" };
  }
}

// ビールの削除
export async function deleteBeer(beerId: number) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }

  try {
    await db.delete(beers).where(eq(beers.id, beerId));

    revalidatePath("/admin/beers");
    revalidatePath("/beers");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete beer:", error);
    return { success: false, error: "削除に失敗しました" };
  }
}

// ビールのステータス変更
export async function updateBeerStatus(beerId: number, status: string) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }

  try {
    await db
      .update(beers)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(beers.id, beerId));

    revalidatePath("/admin/beers");
    revalidatePath("/beers");
    return { success: true };
  } catch (error) {
    console.error("Failed to update beer status:", error);
    return { success: false, error: "ステータス更新に失敗しました" };
  }
}
