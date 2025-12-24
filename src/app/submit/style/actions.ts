"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { beerStyles, beerStyleOtherNames, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

interface SubmitStyleInput {
  name: string;
}

export async function submitStyle(input: SubmitStyleInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/submit/style");
  }

  // ユーザーが存在するか確認（なければ作成）
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id));

  if (!existingUser) {
    await db.insert(users).values({
      id: user.id,
      email: user.email!,
      displayName: user.user_metadata.display_name || user.email?.split("@")[0],
    });
  }

  // 重複チェック（スタイル名）
  const [existingStyle] = await db
    .select()
    .from(beerStyles)
    .where(eq(beerStyles.name, input.name));

  if (existingStyle) {
    return { success: false, error: "同じ名前のスタイルが既に登録されています" };
  }

  // 重複チェック（別名）
  const [existingOtherName] = await db
    .select()
    .from(beerStyleOtherNames)
    .where(eq(beerStyleOtherNames.name, input.name));

  if (existingOtherName) {
    return { success: false, error: "この名前は既に別のスタイルの別名として登録されています" };
  }

  try {
    await db.insert(beerStyles).values({
      name: input.name,
      status: "pending", // 管理者の確認待ち
    });

    revalidatePath("/submit/beer");
    revalidatePath("/styles");
    return { success: true };
  } catch (error) {
    console.error("Failed to submit style:", error);
    return { success: false, error: "ビアスタイルの追加に失敗しました" };
  }
}
