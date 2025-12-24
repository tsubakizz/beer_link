"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { beers, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

interface SubmitBeerInput {
  name: string;
  breweryId: number;
  styleId: number | null;
  customStyleText?: string | null;
}

export async function submitBeer(input: SubmitBeerInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/submit/beer");
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

  // 重複チェック
  const [existingBeer] = await db
    .select()
    .from(beers)
    .where(eq(beers.name, input.name));

  if (existingBeer) {
    return { success: false, error: "同じ名前のビールが既に登録されています" };
  }

  try {
    await db.insert(beers).values({
      name: input.name,
      breweryId: input.breweryId,
      styleId: input.styleId,
      customStyleText: input.customStyleText || null,
      status: "pending",
      submittedBy: user.id,
    });

    revalidatePath("/beers");
    revalidatePath("/admin/requests");
    return { success: true };
  } catch (error) {
    console.error("Failed to submit beer:", error);
    return { success: false, error: "ビールの追加に失敗しました" };
  }
}
