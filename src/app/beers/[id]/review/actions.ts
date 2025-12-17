"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { reviews, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

interface SubmitReviewInput {
  beerId: number;
  rating: number;
  bitterness: number | null;
  sweetness: number | null;
  body: number | null;
  aroma: number | null;
  sourness: number | null;
  comment: string | null;
  imageUrl: string | null;
}

interface UpdateReviewInput {
  reviewId: number;
  beerId: number;
  rating: number;
  bitterness: number | null;
  sweetness: number | null;
  body: number | null;
  aroma: number | null;
  sourness: number | null;
  comment: string | null;
  imageUrl: string | null;
}

export async function submitReview(input: SubmitReviewInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/beers/" + input.beerId + "/review");
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

  // バリデーション
  if (input.rating < 1 || input.rating > 5) {
    return { success: false, error: "評価は1〜5の間で入力してください" };
  }

  const validateFlavor = (value: number | null) => {
    if (value === null) return true;
    return value >= 1 && value <= 5;
  };

  if (
    !validateFlavor(input.bitterness) ||
    !validateFlavor(input.sweetness) ||
    !validateFlavor(input.body) ||
    !validateFlavor(input.aroma) ||
    !validateFlavor(input.sourness)
  ) {
    return { success: false, error: "味の評価は1〜5の間で入力してください" };
  }

  try {
    await db.insert(reviews).values({
      userId: user.id,
      beerId: input.beerId,
      rating: input.rating,
      bitterness: input.bitterness,
      sweetness: input.sweetness,
      body: input.body,
      aroma: input.aroma,
      sourness: input.sourness,
      comment: input.comment,
      imageUrl: input.imageUrl,
    });

    revalidatePath(`/beers/${input.beerId}`);
    revalidatePath("/mypage");
    return { success: true };
  } catch (error) {
    console.error("Failed to submit review:", error);
    return { success: false, error: "レビューの投稿に失敗しました" };
  }
}

export async function updateReview(input: UpdateReviewInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "認証が必要です" };
  }

  // レビューの所有者を確認
  const [existingReview] = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.id, input.reviewId), eq(reviews.userId, user.id)));

  if (!existingReview) {
    return { success: false, error: "レビューが見つからないか、編集権限がありません" };
  }

  // バリデーション
  if (input.rating < 1 || input.rating > 5) {
    return { success: false, error: "評価は1〜5の間で入力してください" };
  }

  const validateFlavor = (value: number | null) => {
    if (value === null) return true;
    return value >= 1 && value <= 5;
  };

  if (
    !validateFlavor(input.bitterness) ||
    !validateFlavor(input.sweetness) ||
    !validateFlavor(input.body) ||
    !validateFlavor(input.aroma) ||
    !validateFlavor(input.sourness)
  ) {
    return { success: false, error: "味の評価は1〜5の間で入力してください" };
  }

  try {
    await db
      .update(reviews)
      .set({
        rating: input.rating,
        bitterness: input.bitterness,
        sweetness: input.sweetness,
        body: input.body,
        aroma: input.aroma,
        sourness: input.sourness,
        comment: input.comment,
        imageUrl: input.imageUrl,
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, input.reviewId));

    revalidatePath(`/beers/${input.beerId}`);
    revalidatePath("/mypage");
    return { success: true };
  } catch (error) {
    console.error("Failed to update review:", error);
    return { success: false, error: "レビューの更新に失敗しました" };
  }
}

export async function deleteReview(reviewId: number, beerId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "認証が必要です" };
  }

  // レビューの所有者を確認
  const [existingReview] = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.id, reviewId), eq(reviews.userId, user.id)));

  if (!existingReview) {
    return { success: false, error: "レビューが見つからないか、削除権限がありません" };
  }

  try {
    await db
      .delete(reviews)
      .where(eq(reviews.id, reviewId));

    revalidatePath(`/beers/${beerId}`);
    revalidatePath("/mypage");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete review:", error);
    return { success: false, error: "レビューの削除に失敗しました" };
  }
}

export async function getReview(reviewId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [review] = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.id, reviewId), eq(reviews.userId, user.id)));

  return review || null;
}
