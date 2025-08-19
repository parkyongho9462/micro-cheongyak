// src/app/api/etl/sync/route.ts
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase";
import { fetchAll } from "@/lib/odcloud";
import { DETAIL_ROOT, CMPET_ROOT, EP } from "@/lib/endpoints";

function dedupeBy<T>(rows: T[], keyFn: (x: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const r of rows) {
    const k = keyFn(r);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(r);
  }
  return out;
}

// ✅ 도우미: 숫자 변환
const N = (v: any) => (v == null ? null : Number(v));
// ✅ 도우미: 문자열 변환
const S = (v: any) => (v == null ? "" : String(v));

export async function GET(req: Request) {
  const url = new URL(req.url);
  const since = url.searchParams.get("since") ?? "2025-06-01";
  const until = url.searchParams.get("until") ?? new Date().toISOString().slice(0, 10);

  const db = supabaseService();

  try {
    // 1) APT 분양정보 상세: 날짜 구간으로 "목록처럼" 긁어서 키쌍(HOUSE_MANAGE_NO,PBLANC_NO) 수집
    // ⚠️ 여기서 cond 키에는 'cond[...]' 쓰지 말고, '필드::연산자'만 넣는다!
    const aptDetails = await fetchAll(`${DETAIL_ROOT}/${EP.APT_DETAIL}`, {
      "RCRIT_PBLANC_DE::GTE": since,     // 모집공고일 시작
      "RCRIT_PBLANC_DE::LTE": until,     // 모집공고일 종료
      "HOUSE_SECD::EQ": "01",            // APT 구분 (안전하게 박아둠)
    });

    // 1-1) projects 업서트 (최소 필드만 매핑해서 안정적으로 진행)
    //      announce_no는 과거 호환용: PBLANC_NO를 그대로 넣어주면 NULL 에러 방지 가능
    const projectRows = aptDetails.map((r: any) => ({
      house_manage_no: S(r.HOUSE_MANAGE_NO),
      pblanc_no: S(r.PBLANC_NO),
      announce_no: S(r.PBLANC_NO) || null,         // nullable이지만 채울 수 있으면 채우자
      proj_name: r.HOUSE_NM ?? null,
      builder: r.CNSTRCT_ENTRPS_NM ?? r.BSNS_MBY_NM ?? null,
      region_sig_cd: r.SUBSCRPT_AREA_CODE ?? null,
      announce_dt: r.RCRIT_PBLANC_DE ?? null,
      pblanc_url: r.PBLANC_URL ?? null,            // 타입에 따라 없을 수도 있음
    })).filter(p => p.house_manage_no && p.pblanc_no);

    if (projectRows.length) {
      const { error } = await db
        .from("projects")
        .upsert(projectRows, { onConflict: "house_manage_no,pblanc_no" });
      if (error) throw error;
    }

    // 2) 각 공고별 APT 주택형(MDL) 호출 → unit_models 업서트
    let mdlCount = 0;
    // 중복 키쌍 제거
    const keys = Array.from(new Set(projectRows.map(p => `${p.house_manage_no}::${p.pblanc_no}`)));
    for (const key of keys) {
      const [hm, pb] = key.split("::");
      const mdl = await fetchAll(`${DETAIL_ROOT}/${EP.APT_MODEL}`, {
        "HOUSE_MANAGE_NO::EQ": hm,
        "PBLANC_NO::EQ": pb,
      });

      if (mdl.length) {
        const mdlRows = mdl.map((m: any) => ({
          house_manage_no: S(m.HOUSE_MANAGE_NO),
          pblanc_no: S(m.PBLANC_NO),
          model_no: S(m.MODEL_NO),
          house_ty: m.HOUSE_TY ?? null,
          suply_ar: N(m.SUPLY_AR),
          suply_hshldco: N(m.SUPLY_HSHLDCO),
        })).filter((m: any) => m.house_manage_no && m.pblanc_no && m.model_no);

        if (mdlRows.length) {
          const { error } = await db.from("unit_models").upsert(mdlRows);
          if (error) throw error;
          mdlCount += mdlRows.length;
        }
      }
    }

// 3) APT 경쟁률 호출 → competitions 업서트
let cmpCount = 0;
for (const key of keys) {
  const [hm, pb] = key.split("::");
  for (const reside of ["01", "02", "03"]) {
    const cmp = await fetchAll(`${CMPET_ROOT}/${EP.APT_CMPET}`, {
      "HOUSE_MANAGE_NO::EQ": hm,
      "PBLANC_NO::EQ": pb,
      "RESIDE_SECD::EQ": reside,
    });

    if (cmp.length) {
      const rows = cmp.map((c: any) => ({
        svc: "APT",
        house_manage_no: String(c.HOUSE_MANAGE_NO),
        pblanc_no: String(c.PBLANC_NO),
        model_no: c.MODEL_NO ? String(c.MODEL_NO) : "-",         // PK 기본값 '-'
        house_ty: c.HOUSE_TY ?? null,
        reside_secd: String(c.RESIDE_SECD ?? reside) || "-",     // PK 기본값 '-'
        subscrpt_rank_code: String(c.SUBSCRPT_RANK_CODE ?? "-"), // ✅ PK에 포함
        req_cnt: c.REQ_CNT == null ? null : Number(c.REQ_CNT),
        cmpet_rate: c.CMPET_RATE == null ? null : Number(c.CMPET_RATE),
        suply_hshldco: c.SUPLY_HSHLDCO == null ? null : Number(c.SUPLY_HSHLDCO),
        extra_json: null,
      })).filter((r: any) => r.house_manage_no && r.pblanc_no);

      // ✅ 한 번 더 안전하게 메모리에서 중복 제거
      const uniqueRows = dedupeBy(rows, (r) =>
        `${r.svc}|${r.house_manage_no}|${r.pblanc_no}|${r.model_no}|${r.reside_secd}|${r.subscrpt_rank_code}`
      );

      if (uniqueRows.length) {
        const { error } = await db.from("competitions").upsert(uniqueRows);
        if (error) throw error;
        cmpCount += uniqueRows.length;
      }
    }
  }
}

    return NextResponse.json({
      ok: true,
      counts: {
        projects: projectRows.length,
        unit_models: mdlCount,
        competitions: cmpCount,
      },
    });
  } catch (e: any) {
    console.error("[etl/sync] error:", e);
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}
