"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { beerFavorites, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function toggleFavorite(beerId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "ログインが必要です", isFavorited: false };
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
    // 既にお気に入りに追加されているか確認
    const [existing] = await db
      .select()
      .from(beerFavorites)
      .where(
        and(
          eq(beerFavorites.userId, user.id),
          eq(beerFavorites.beerId, beerId)
        )
      );

    if (existing) {
      // お気に入りから削除
      await db
        .delete(beerFavorites)
        .where(eq(beerFavorites.id, existing.id));

      revalidatePath(`/beers/${beerId}`);
      revalidatePath("/mypage");
      return { success: true, isFavorited: false };
    } else {
      // お気に入りに追加
      await db.insert(beerFavorites).values({
        userId: user.id,
        beerId,
      });

      revalidatePath(`/beers/${beerId}`);
      revalidatePath("/mypage");
      return { success: true, isFavorited: true };
    }
  } catch (error) {
    console.error("Failed to toggle favorite:", error);
    return { success: false, error: "お気に入りの更新に失敗しました", isFavorited: false };
  }
}

export async function checkFavorite(beerId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { isFavorited: false };
  }

  const [existing] = await db
    .select()
    .from(beerFavorites)
    .where(
      and(
        eq(beerFavorites.userId, user.id),
        eq(beerFavorites.beerId, beerId)
      )
    );

  return { isFavorited: !!existing };
}
