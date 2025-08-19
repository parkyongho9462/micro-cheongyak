import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const srv  = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  // 민감값은 내용을 안 보여주고 길이만 노출
  const mask = (s: string) => (s ? `${s.slice(0, 3)}…(len:${s.length})` : "(missing)");

  return NextResponse.json({
    NEXT_PUBLIC_SUPABASE_URL: url ? `${url.split(".supabase.co")[0]}.supabase.co` : "(missing)",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: mask(anon),
    SUPABASE_SERVICE_ROLE_KEY: mask(srv),
    urlLooksValid: /^https:\/\/.+\.supabase\.co$/.test(url),
  });
}
