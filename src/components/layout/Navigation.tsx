import { createClient } from "@/lib/supabase/server";
import { NavigationClient } from "./NavigationClient";

export async function Navigation() {
  const supabase = await createClient();

  // サーバーサイドでユーザー情報を取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <NavigationClient user={user} />;
}
