"use server";

import {
  createRememberToken,
  deleteRememberToken,
} from "@/lib/auth/remember-me";
import { createClient } from "@/lib/supabase/server";

/**
 * Remember meトークンを作成（ログイン成功後に呼び出し）
 */
export async function setRememberMeToken(): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false };
  }

  await createRememberToken(user.id);
  return { success: true };
}

/**
 * ログアウト処理（Supabaseログアウト + Remember meトークン削除）
 */
export async function logout(): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Remember meトークンを削除
    await deleteRememberToken(user.id);
  }

  // Supabaseからログアウト
  await supabase.auth.signOut();

  return { success: true };
}
