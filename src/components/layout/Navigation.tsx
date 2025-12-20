import { createClient } from "@/lib/supabase/server";
import { NavigationClient } from "./NavigationClient";

export async function Navigation() {
  const supabase = await createClient();

  // サーバーサイドでユーザー情報を取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 環境変数を取得してpropsとして渡す
  const logoUrl = `${process.env.NEXT_PUBLIC_R2_ASSETS_URL}/7fde81d3-c2be-4b41-8485-7ab75bf50055.webp`;

  return <NavigationClient user={user} logoUrl={logoUrl} />;
}
