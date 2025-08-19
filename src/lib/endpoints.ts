// src/lib/endpoints.ts

// 서비스 루트
export const DETAIL_ROOT = "ApplyhomeInfoDetailSvc/v1";     // 분양정보(상세/주택형)
export const CMPET_ROOT  = "ApplyhomeInfoCmpetRtSvc/v1";    // 경쟁률/가점

// 상세/모델(주택형) 엔드포인트 (APT만 우선)
export const EP = {
  APT_DETAIL: "getAPTLttotPblancDetail",   // APT 분양정보 상세
  APT_MODEL:  "getAPTLttotPblancMdl",      // APT 주택형별 상세
  APT_CMPET:  "getAPTLttotPblancCmpet",    // APT 경쟁률
} as const;
