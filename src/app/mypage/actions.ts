"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface UpdateProfileInput {
  displayName: string;
  bio: string;
}

export async function updateProfile(input: UpdateProfileInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "認証が必要です" };
  }

  try {
    await db
      .update(users)
      .set({
        displayName: input.displayName || null,
        bio: input.bio || null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    revalidatePath("/mypage");
    return { success: true };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { success: false, error: "プロフィールの更新に失敗しました" };
  }
}
