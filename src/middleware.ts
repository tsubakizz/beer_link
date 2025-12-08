import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// メンテナンスモードのチェック
function checkMaintenanceMode(request: NextRequest): NextResponse | null {
  const maintenanceMode = process.env.MAINTENANCE_MODE;

  if (maintenanceMode !== "true") {
    return null;
  }

  // メンテナンスページ自体へのアクセスは許可
  if (request.nextUrl.pathname === "/maintenance") {
    return null;
  }

  // APIリクエストには503を返す
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503 }
    );
  }

  // その他のリクエストはメンテナンスページにリダイレクト
  return NextResponse.redirect(new URL("/maintenance", request.url));
}

// Staging環境のBasic認証
function checkBasicAuth(request: NextRequest): NextResponse | null {
  const host = request.headers.get("host") || "";

  // 本番環境（beer-link.com, www.beer-link.com）はBasic認証をスキップ
  const isProduction = host === "beer-link.com" || host === "www.beer-link.com";
  // ローカル環境もスキップ
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");

  if (isProduction || isLocal) {
    return null;
  }

  // Basic認証のチェック
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    const [scheme, encoded] = authHeader.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded);
      const [user, pass] = decoded.split(":");
      // 環境変数から認証情報を取得（デフォルト: staging:staging）
      const expectedUser = process.env.STAGING_AUTH_USER || "staging";
      const expectedPass = process.env.STAGING_AUTH_PASS || "staging";
      if (user === expectedUser && pass === expectedPass) {
        return null; // 認証成功
      }
    }
  }

  // 認証失敗 - Basic認証を要求
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Staging Environment"',
    },
  });
}

export async function middleware(request: NextRequest) {
  // メンテナンスモードチェック
  const maintenanceResponse = checkMaintenanceMode(request);
  if (maintenanceResponse) {
    return maintenanceResponse;
  }

  // Basic認証チェック（staging環境のみ）
  const authResponse = checkBasicAuth(request);
  if (authResponse) {
    return authResponse;
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * 以下を除くすべてのリクエストパスにマッチ:
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化ファイル)
     * - favicon.ico (ファビコン)
     * - 画像ファイル (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
