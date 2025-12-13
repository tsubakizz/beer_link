import { createClient } from "@supabase/supabase-js";

/**
 * Admin権限を持つSupabaseクライアント（サーバーサイド専用）
 * RLSをバイパスできるため、取り扱い注意
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
