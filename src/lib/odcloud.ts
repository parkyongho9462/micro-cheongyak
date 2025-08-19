// src/lib/odcloud.ts
export const OD = {
  BASE: process.env.OD_BASE!,              // 예: https://api.odcloud.kr/api
  KEY: process.env.DATA_GO_KR_KEY!,        // data.go.kr 일반 서비스키(인코딩 안 된 원문)
  DETAIL: 'ApplyhomeInfoDetailSvc/v1',
  CMPET:  'ApplyhomeInfoCmpetRtSvc/v1',
  EP: {
    // 분양정보 조회 (DetailSvc)
    APT_DETAIL:        'getAPTLttotPblancDetail',        // APT 상세 :contentReference[oaicite:5]{index=5}
    APT_MODEL:         'getAPTLttotPblancMdl',           // APT 주택형별 :contentReference[oaicite:6]{index=6}
    URBTY_DETAIL:      'getUrbtyOfctlLttotPblancDetail', // 오피/도시형 등 상세 :contentReference[oaicite:7]{index=7}
    URBTY_MODEL:       'getUrbtyOfctlLttotPblancMdl',    // 오피/도시형 등 주택형별 :contentReference[oaicite:8]{index=8}
    REMNDR_DETAIL:     'getRemndrLttotPblancDetail',     // 잔여세대 상세 :contentReference[oaicite:9]{index=9}
    REMNDR_MODEL:      'getRemndrLttotPblancMdl',        // 잔여세대 주택형별 :contentReference[oaicite:10]{index=10}
    PBLPVT_DETAIL:     'getPblPvtRentLttotPblancDetail', // 공공지원 민간임대 상세 :contentReference[oaicite:11]{index=11}
    PBLPVT_MODEL:      'getPblPvtRentLttotPblancMdl',    // 공공지원 민간임대 주택형별 :contentReference[oaicite:12]{index=12}
    OPT_DETAIL:        'getOPTLttotPblancDetail',        // 임의공급 상세 :contentReference[oaicite:13]{index=13}
    OPT_MODEL:         'getOPTLttotPblancMdl',           // 임의공급 주택형별 :contentReference[oaicite:14]{index=14}

    // 경쟁률/가점 (CmpetRtSvc)
    APT_CMPET:         'getAPTLttotPblancCmpet',         // APT 경쟁률 :contentReference[oaicite:15]{index=15}
    URBTY_CMPET:       'getUrbtyOfctlLttotPblancCmpet',  // 오피/도시형 경쟁률 :contentReference[oaicite:16]{index=16}
    REMNDR_CMPET:      'getRemndrLttotPblancCmpet',      // 잔여세대 경쟁률 :contentReference[oaicite:17]{index=17}
    OPT_CMPET:         'getOPTLttotPblancCmpet',         // 임의공급 경쟁률 :contentReference[oaicite:18]{index=18}
    APT_SCORE:         'getAPTLttotPblancScore',         // APT 당첨가점 :contentReference[oaicite:19]{index=19}
  }
};

export type Conds = Record<string, string | number | undefined>;

/** cond[FIELD::OP]=VALUE 형태로 직렬화 */
function buildConds(conds: Conds) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(conds)) {
    if (v === undefined || v === null) continue;
    params.append(`cond[${k}]`, String(v));
  }
  return params;
}

/**
 * 서비스키 정규화:
 * - .env가 "인코딩된 키(%2F,%3D…)"면 decode해서 원문(/,=…)으로 되돌린 뒤,
 * - URLSearchParams가 한 번만 인코딩하게 맡긴다.
 * - .env가 원문키면 decode가 변화 없이 통과.
 */
function normalizeServiceKey(raw: string) {
  if (!raw) throw new Error("Missing env: DATA_GO_KR_KEY");
  try {
    const decoded = decodeURIComponent(raw);
    return decoded; // 원문(/,= 포함). set() 시 URLSearchParams가 알아서 1회 인코딩
  } catch {
    return raw; // 이상한 값이면 있는 그대로 사용
  }
}

/** 페이지 단위 호출 (ODCloud 공통 포맷) */
export async function fetchPaged(
  endpoint: string,
  args: { page?: number; perPage?: number; conds?: Conds }
) {
  const base = process.env.OD_BASE || "https://api.odcloud.kr/api";
  const rawKey = process.env.DATA_GO_KR_KEY;
  const keyPlain = normalizeServiceKey(rawKey || "");

  const page = args.page ?? 1;
  const perPage = args.perPage ?? 100;

  const url = new URL(`${base}/${endpoint}`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("perPage", String(perPage));

  if (args.conds) {
    const c = buildConds(args.conds);
    c.forEach((v, k) => url.searchParams.append(k, v));
  }

  // ⚠️ 여기서는 "원문"을 넣는다 → URLSearchParams가 단 1회만 인코딩
  url.searchParams.set("serviceKey", keyPlain);

  // 키는 인코딩되어 URL에 들어가기 때문에, 마스킹할 땐 '인코딩된 값'으로 대체
  const encodedInUrl = encodeURIComponent(keyPlain);
  const debugUrl = url.toString().replace(encodedInUrl, "***SERVICE_KEY***");

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[odcloud] ${endpoint} ${res.status} :: ${debugUrl}\n${body}`);
    throw new Error(`${endpoint} ${res.status}`);
  }

  const json = await res.json();
  const rows = json.data || json.records || [];
  return {
    rows,
    currentCount: json.currentCount ?? rows.length,
    perPage: json.perPage ?? perPage,
  };
}

/** 페이지네이션 전체 수집 */
export async function fetchAll(
  endpoint: string,
  conds?: Conds,
  perPage = 100,
  maxPages = 50
) {
  let page = 1;
  let out: any[] = [];
  while (page <= maxPages) {
    const { rows, currentCount } = await fetchPaged(endpoint, { page, perPage, conds });
    out = out.concat(rows);
    if (!rows.length || (currentCount && currentCount < perPage)) break;
    page++;
  }
  return out;
}
