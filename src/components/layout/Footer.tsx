import { createClient } from "@/lib/supabase/server";
import { FooterClient } from "./FooterClient";

export async function Footer() {
  const supabase = await createClient();

  // サーバーサイドでユーザー情報を取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 管理者権限を確認
  let isAdmin = false;
  if (user) {
    const { data } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = data?.role === "admin";
  }

  return <FooterClient user={user} isAdmin={isAdmin} />;
}
