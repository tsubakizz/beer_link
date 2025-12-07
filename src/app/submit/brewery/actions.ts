"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { breweries, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

interface SubmitBreweryInput {
  name: string;
}

export async function submitBrewery(input: SubmitBreweryInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/submit/brewery");
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

  try {
    await db.insert(breweries).values({
      name: input.name,
      status: "pending", // 管理者の確認待ち
    });

    revalidatePath("/submit/beer");
    revalidatePath("/breweries");
    return { success: true };
  } catch (error) {
    console.error("Failed to submit brewery:", error);
    return { success: false, error: "ブルワリーの追加に失敗しました" };
  }
}
