"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { beerStyles, beerStyleOtherNames, users } from "@/lib/db/schema";
import { eq, and, ne, inArray } from "drizzle-orm";
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
  otherNames: string[];
}

// スタイルの更新
export async function updateStyle(styleId: number, input: UpdateStyleInput) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }

  // 重複チェック（スタイル名 - 自分自身を除く）
  const [existingStyle] = await db
    .select()
    .from(beerStyles)
    .where(and(eq(beerStyles.name, input.name), ne(beerStyles.id, styleId)));

  if (existingStyle) {
    return { success: false, error: "同じ名前のスタイルが既に登録されています" };
  }

  // 重複チェック（入力名が既存の別名と被っていないか）
  const [existingOtherNameForName] = await db
    .select()
    .from(beerStyleOtherNames)
    .where(and(
      eq(beerStyleOtherNames.name, input.name),
      ne(beerStyleOtherNames.styleId, styleId)
    ));

  if (existingOtherNameForName) {
    return { success: false, error: "この名前は既に別のスタイルの別名として登録されています" };
  }

  // 重複チェック（入力別名が既存のスタイル名と被っていないか）
  if (input.otherNames.length > 0) {
    const conflictingStyles = await db
      .select()
      .from(beerStyles)
      .where(and(
        inArray(beerStyles.name, input.otherNames),
        ne(beerStyles.id, styleId)
      ));

    if (conflictingStyles.length > 0) {
      return { success: false, error: `別名「${conflictingStyles[0].name}」は既にスタイル名として登録されています` };
    }

    // 重複チェック（入力別名が既存の別名と被っていないか - 自分の別名は除く）
    const conflictingOtherNames = await db
      .select()
      .from(beerStyleOtherNames)
      .where(and(
        inArray(beerStyleOtherNames.name, input.otherNames),
        ne(beerStyleOtherNames.styleId, styleId)
      ));

    if (conflictingOtherNames.length > 0) {
      return { success: false, error: `別名「${conflictingOtherNames[0].name}」は既に別のスタイルの別名として登録されています` };
    }
  }

  try {
    await db
      .update(beerStyles)
      .set({
        name: input.name,
        description: input.description,
        status: input.status,
        updatedAt: new Date(),
      })
      .where(eq(beerStyles.id, styleId));

    // 別名を更新（既存の別名を削除して新しい別名を追加）
    await db
      .delete(beerStyleOtherNames)
      .where(eq(beerStyleOtherNames.styleId, styleId));

    if (input.otherNames.length > 0) {
      await db.insert(beerStyleOtherNames).values(
        input.otherNames.map((name) => ({
          styleId,
          name,
        }))
      );
    }

    revalidatePath("/admin/styles");
    revalidatePath("/styles");
    revalidatePath(`/styles/${styleId}`);
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
