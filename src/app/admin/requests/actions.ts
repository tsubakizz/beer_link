"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { beers, beerStyles, beerStyleRequests, users } from "@/lib/db/schema";
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

interface BeerDetails {
  name: string;
  styleId: number | null;
  abv: string | null;
  ibu: number | null;
  description: string | null;
}

// ビール申請の承認（詳細情報付き）
export async function approveBeerWithDetails(beerId: number, details: BeerDetails) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }

  try {
    await db
      .update(beers)
      .set({
        name: details.name,
        styleId: details.styleId,
        abv: details.abv,
        ibu: details.ibu,
        description: details.description,
        status: "approved",
        updatedAt: new Date(),
      })
      .where(eq(beers.id, beerId));

    revalidatePath("/admin/requests");
    revalidatePath("/admin");
    revalidatePath("/beers");
    return { success: true };
  } catch (error) {
    console.error("Failed to approve beer:", error);
    return { success: false, error: "承認に失敗しました" };
  }
}

// ビール申請の承認（シンプル）
export async function approveBeer(beerId: number) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }

  try {
    await db
      .update(beers)
      .set({
        status: "approved",
        updatedAt: new Date(),
      })
      .where(eq(beers.id, beerId));

    revalidatePath("/admin/requests");
    revalidatePath("/admin");
    revalidatePath("/beers");
    return { success: true };
  } catch (error) {
    console.error("Failed to approve beer:", error);
    return { success: false, error: "承認に失敗しました" };
  }
}

// ビール申請の却下
export async function rejectBeer(beerId: number) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }

  try {
    await db
      .update(beers)
      .set({
        status: "rejected",
        updatedAt: new Date(),
      })
      .where(eq(beers.id, beerId));

    revalidatePath("/admin/requests");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to reject beer:", error);
    return { success: false, error: "却下に失敗しました" };
  }
}

// スタイル申請の承認（beerStylesテーブルにも追加）
export async function approveStyle(requestId: number) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }

  try {
    // 申請内容を取得
    const [request] = await db
      .select()
      .from(beerStyleRequests)
      .where(eq(beerStyleRequests.id, requestId));

    if (!request) {
      return { success: false, error: "申請が見つかりません" };
    }

    // beerStylesテーブルに追加
    await db.insert(beerStyles).values({
      name: request.name,
      description: request.description,
      status: "approved",
    });

    // 申請ステータスを更新
    await db
      .update(beerStyleRequests)
      .set({
        status: "approved",
        updatedAt: new Date(),
      })
      .where(eq(beerStyleRequests.id, requestId));

    revalidatePath("/admin/requests");
    revalidatePath("/admin");
    revalidatePath("/styles");
    return { success: true };
  } catch (error) {
    console.error("Failed to approve style:", error);
    return { success: false, error: "承認に失敗しました" };
  }
}

// スタイル申請の却下
export async function rejectStyle(requestId: number) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }

  try {
    await db
      .update(beerStyleRequests)
      .set({
        status: "rejected",
        updatedAt: new Date(),
      })
      .where(eq(beerStyleRequests.id, requestId));

    revalidatePath("/admin/requests");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to reject style:", error);
    return { success: false, error: "却下に失敗しました" };
  }
}
