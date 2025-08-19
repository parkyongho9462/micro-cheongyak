import { createClient } from "@supabase/supabase-js";

// 클라이언트/서버 공용(익명 읽기용)
export const supabaseAnon = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// 서버 전용 쓰기/업서트용 (API 라우트 내부에서만)
export const supabaseService = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
