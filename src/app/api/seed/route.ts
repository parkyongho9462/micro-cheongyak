import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase";

export async function GET() {
  const db = supabaseService();
  const rows = [
    {
      announce_no: "2025-0001",
      proj_name: "예시자이 가든",
      region_sig_cd: "27230", // 대구 달서구 예시
      builder: "GS건설",
      announce_dt: "2025-08-01",
    },
    {
      announce_no: "2025-0002",
      proj_name: "힐스테이트 센트럴",
      region_sig_cd: "41135", // 경기 성남시 분당구 예시
      builder: "현대건설",
      announce_dt: "2025-08-10",
    },
    {
      announce_no: "2025-0003",
      proj_name: "푸르지오 리버뷰",
      region_sig_cd: "11680", // 서울 강남구 예시
      builder: "대우건설",
      announce_dt: "2025-08-15",
    },
  ];

  const { error } = await db.from("projects").upsert(rows, { onConflict: "announce_no" });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, count: rows.length });
}