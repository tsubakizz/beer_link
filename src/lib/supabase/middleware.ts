import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  validateRememberTokenFromRequest,
  createSupabaseSessionForUser,
  REMEMBER_TOKEN_COOKIE_NAME,
} from "@/lib/auth/remember-me";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let {
    data: { user },
  } = await supabase.auth.getUser();

  // Supabaseセッションがない場合、Remember meトークンで自動ログイン
  if (!user) {
    const rememberUser = await validateRememberTokenFromRequest(request);

    if (rememberUser) {
      // Admin APIでセッションを発行
      const session = await createSupabaseSessionForUser(rememberUser.email);

      if (session) {
        // セッションを設定
        const { data, error } = await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });

        if (!error && data.user) {
          user = data.user;
        }
      } else {
        // セッション発行に失敗した場合、無効なトークンとしてCookieを削除
        supabaseResponse.cookies.delete(REMEMBER_TOKEN_COOKIE_NAME);
      }
    }
  }

  // 認証が必要なパスの保護
  const protectedPaths = ["/mypage", "/submit"];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // 管理者専用パスの保護
  if (request.nextUrl.pathname.startsWith("/admin") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
