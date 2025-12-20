import { db } from "@/lib/db";
import { rememberTokens, users } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import type { NextRequest } from "next/server";

export const REMEMBER_TOKEN_COOKIE_NAME = "remember_token";
const TOKEN_EXPIRY_DAYS = 30;

/**
 * ランダムトークンを生成（32バイト = 256bit）
 */
async function generateToken(): Promise<string> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

/**
 * トークンをSHA-256でハッシュ化
 */
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Remember meトークンを生成してDBとCookieに保存
 */
export async function createRememberToken(userId: string): Promise<void> {
  // 既存のトークンを削除（1ユーザー1トークン）
  await db.delete(rememberTokens).where(eq(rememberTokens.userId, userId));

  // 新しいトークンを生成
  const token = await generateToken();
  const tokenHash = await hashToken(token);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + TOKEN_EXPIRY_DAYS);

  // DBに保存
  await db.insert(rememberTokens).values({
    userId,
    tokenHash,
    expiresAt,
  });

  // Cookieに保存
  const cookieStore = await cookies();
  cookieStore.set(REMEMBER_TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TOKEN_EXPIRY_DAYS * 24 * 60 * 60, // 30日（秒）
    path: "/",
  });
}

/**
 * Remember meトークンを検証してユーザー情報を取得
 */
export async function validateRememberToken(): Promise<{
  userId: string;
  email: string;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(REMEMBER_TOKEN_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const tokenHash = await hashToken(token);
  const now = new Date();

  // DBからトークンを検索（有効期限内のもの）
  const [tokenRecord] = await db
    .select({
      userId: rememberTokens.userId,
    })
    .from(rememberTokens)
    .where(
      and(
        eq(rememberTokens.tokenHash, tokenHash),
        gt(rememberTokens.expiresAt, now)
      )
    );

  if (!tokenRecord) {
    // 無効なトークンはCookieから削除
    cookieStore.delete(REMEMBER_TOKEN_COOKIE_NAME);
    return null;
  }

  // ユーザー情報を取得
  const [user] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, tokenRecord.userId));

  if (!user) {
    cookieStore.delete(REMEMBER_TOKEN_COOKIE_NAME);
    return null;
  }

  return { userId: tokenRecord.userId, email: user.email };
}

/**
 * Remember meトークンを削除（ログアウト時に使用）
 */
export async function deleteRememberToken(userId: string): Promise<void> {
  // DBから削除
  await db.delete(rememberTokens).where(eq(rememberTokens.userId, userId));

  // Cookieから削除
  const cookieStore = await cookies();
  cookieStore.delete(REMEMBER_TOKEN_COOKIE_NAME);
}

/**
 * ミドルウェア用: Remember meトークンを検証してユーザー情報を取得
 * NextRequestのcookiesを直接使用
 */
export async function validateRememberTokenFromRequest(
  request: NextRequest
): Promise<{
  userId: string;
  email: string;
} | null> {
  const token = request.cookies.get(REMEMBER_TOKEN_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const tokenHash = await hashToken(token);
  const now = new Date();

  // DBからトークンを検索（有効期限内のもの）
  const [tokenRecord] = await db
    .select({
      userId: rememberTokens.userId,
    })
    .from(rememberTokens)
    .where(
      and(
        eq(rememberTokens.tokenHash, tokenHash),
        gt(rememberTokens.expiresAt, now)
      )
    );

  if (!tokenRecord) {
    return null;
  }

  // ユーザー情報を取得
  const [user] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, tokenRecord.userId));

  if (!user) {
    return null;
  }

  return { userId: tokenRecord.userId, email: user.email };
}

/**
 * トークンローテーション（セキュリティ向上のため、使用後に新しいトークンを発行）
 */
export async function rotateRememberToken(userId: string): Promise<void> {
  await createRememberToken(userId);
}

/**
 * Admin APIを使用してSupabaseセッションを発行
 * マジックリンクを生成し、そのトークンでセッションを作成
 */
export async function createSupabaseSessionForUser(email: string): Promise<{
  access_token: string;
  refresh_token: string;
} | null> {
  const supabaseAdmin = createAdminClient();

  // マジックリンクを生成（実際には送信せず、トークンのみ取得）
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (error || !data) {
    console.error("Failed to generate magic link:", error);
    return null;
  }

  // 生成されたトークンでセッションを確立
  const { data: sessionData, error: sessionError } =
    await supabaseAdmin.auth.verifyOtp({
      token_hash: data.properties.hashed_token,
      type: "magiclink",
    });

  if (sessionError || !sessionData.session) {
    console.error("Failed to verify OTP:", sessionError);
    return null;
  }

  return {
    access_token: sessionData.session.access_token,
    refresh_token: sessionData.session.refresh_token,
  };
}
