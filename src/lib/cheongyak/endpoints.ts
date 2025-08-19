export const DETAIL = {
  APT: "ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail",
  URB: "ApplyhomeInfoDetailSvc/v1/getUrbtyOfctlLttotPblancDetail",
  PBLPVT: "ApplyhomeInfoDetailSvc/v1/getPblPvtRentLttotPblancDetail",
  REMD: "ApplyhomeInfoDetailSvc/v1/getRemndrLttotPblancDetail",
  OPT: "ApplyhomeInfoDetailSvc/v1/getOPTLttotPblancDetail",
} as const;

export const CMPET = {
  APT: "ApplyhomeInfoCmpetRtSvc/v1/getAPTLttotPblancCmpet",
  URB: "ApplyhomeInfoCmpetRtSvc/v1/getUrbtyOfctlLttotPblancCmpet",
  PBLPVT: "ApplyhomeInfoCmpetRtSvc/v1/getPblPvtRentLttotPblancCmpet",
  CANCEL: "ApplyhomeInfoCmpetRtSvc/v1/getCancResplLttotPblancCmpet",
  REMD: "ApplyhomeInfoCmpetRtSvc/v1/getRemndrLttotPblancCmpet",
  OPT: "ApplyhomeInfoCmpetRtSvc/v1/getOPTLttotPblancCmpet",
} as const;

// APT 특별공급 신청현황은 별도 엔드포인트가 있으므로(문서 '8) APT 특별공급 신청현황 조회')
// 필요 시 아래에 추가 구현 예정.
// export const SPSPLY_APT = "ApplyhomeInfoCmpetRtSvc/v1/getAPTSpsplyReqstStus";
