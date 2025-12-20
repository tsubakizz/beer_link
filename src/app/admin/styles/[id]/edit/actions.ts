"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { beerStyles, beerStyleOtherNames, users } from "@/lib/db/schema";
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

// スタイルを取得
export async function getStyleById(styleId: number) {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) {
    return adminCheck;
  }

  try {
    const [style] = await db
      .select()
      .from(beerStyles)
      .where(eq(beerStyles.id, styleId));

    if (!style) {
      return { success: false, error: "スタイルが見つかりません" };
    }

    // 別名を取得
    const otherNames = await db
      .select({ name: beerStyleOtherNames.name })
      .from(beerStyleOtherNames)
      .where(eq(beerStyleOtherNames.styleId, styleId));

    return {
      success: true,
      style: {
        ...style,
        otherNames: otherNames.map((n) => n.name),
      },
    };
  } catch (error) {
    console.error("Failed to get style:", error);
    return { success: false, error: "取得に失敗しました" };
  }
}

interface StyleInput {
  name: string;
  description: string | null;
  shortDescription: string | null;
  otherNames: string[];
  bitterness: number | null;
  sweetness: number | null;
  body: number | null;
  aroma: number | null;
  sourness: number | null;
  history: string | null;
  origin: string | null;
  abvMin: string | null;
  abvMax: string | null;
  ibuMin: number | null;
  ibuMax: number | null;
  srmMin: number | null;
  srmMax: number | null;
  servingTempMin: number | null;
  servingTempMax: number | null;
}

// スタイルの作成
export async function createStyle(input: StyleInput) {
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
      .replace(/^-|-$/g, "") || `style-${Date.now()}`;

    // 重複チェック
    const [existingStyle] = await db
      .select()
      .from(beerStyles)
      .where(eq(beerStyles.name, input.name));

    if (existingStyle) {
      return { success: false, error: "同じ名前のスタイルが既に登録されています" };
    }

    const [insertedStyle] = await db
      .insert(beerStyles)
      .values({
        name: input.name,
        slug,
        description: input.description,
        shortDescription: input.shortDescription,
        status: "approved",
        bitterness: input.bitterness,
        sweetness: input.sweetness,
        body: input.body,
        aroma: input.aroma,
        sourness: input.sourness,
        history: input.history,
        origin: input.origin,
        abvMin: input.abvMin,
        abvMax: input.abvMax,
        ibuMin: input.ibuMin,
        ibuMax: input.ibuMax,
        srmMin: input.srmMin,
        srmMax: input.srmMax,
        servingTempMin: input.servingTempMin,
        servingTempMax: input.servingTempMax,
      })
      .returning({ id: beerStyles.id });

    // 別名を追加
    if (input.otherNames.length > 0 && insertedStyle) {
      await db.insert(beerStyleOtherNames).values(
        input.otherNames.map((name) => ({
          styleId: insertedStyle.id,
          name,
        }))
      );
    }

    revalidatePath("/admin/styles");
    revalidatePath("/styles");
    return { success: true };
  } catch (error) {
    console.error("Failed to create style:", error);
    return { success: false, error: "作成に失敗しました" };
  }
}

// スタイルの更新
export async function updateStyle(styleId: number, input: StyleInput) {
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
        shortDescription: input.shortDescription,
        bitterness: input.bitterness,
        sweetness: input.sweetness,
        body: input.body,
        aroma: input.aroma,
        sourness: input.sourness,
        history: input.history,
        origin: input.origin,
        abvMin: input.abvMin,
        abvMax: input.abvMax,
        ibuMin: input.ibuMin,
        ibuMax: input.ibuMax,
        srmMin: input.srmMin,
        srmMax: input.srmMax,
        servingTempMin: input.servingTempMin,
        servingTempMax: input.servingTempMax,
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
    revalidatePath(`/styles/${slug}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update style:", error);
    return { success: false, error: "更新に失敗しました" };
  }
}
