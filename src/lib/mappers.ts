export function mapProject(row: any) {
  const house_manage_no = String(row.HOUSE_MANAGE_NO ?? row.house_manage_no ?? "");
  const pblanc_no = String(row.PBLANC_NO ?? row.pblanc_no ?? "");
  return {
    house_manage_no,
    pblanc_no,
    // 있으면 채우고, 없어도 OK (nullable)
    announce_no: row.ANNOUNCE_NO ?? row.announce_no ?? row.PBLANC_NO ?? null,
    proj_name: row.HOUSE_NM ?? null,
    builder: row.CNSTRCT_ENTRPS_NM ?? row.BSNS_MBY_NM ?? null,
    region_sig_cd: row.SUBSCRPT_AREA_CODE ?? null,
    announce_dt: row.RCRIT_PBLANC_DE ?? null,
    pblanc_url: row.PBLANC_URL ?? row.pblanc_url ?? null,
  };
}

export function mapModel(row: any) {
  return {
    house_manage_no: String(row.HOUSE_MANAGE_NO ?? ""),
    pblanc_no: String(row.PBLANC_NO ?? ""),
    model_no: String(row.MODEL_NO ?? ""),
    house_ty: row.HOUSE_TY ?? null,
    suply_ar: row.SUPLY_AR ?? row.SUPLY_AR ?? null,
    suply_hshldco: row.SUPLY_HSHLDCO ?? null,
  };
}

export function mapCmpet(svc: string, row: any, reside?: string) {
  return {
    svc,
    house_manage_no: String(row.HOUSE_MANAGE_NO ?? ""),
    pblanc_no: String(row.PBLANC_NO ?? ""),
    model_no: row.MODEL_NO ? String(row.MODEL_NO) : null,
    house_ty: row.HOUSE_TY ?? null,
    reside_secd: reside ?? row.RESIDE_SECD ?? null,
    req_cnt: row.REQ_CNT != null ? Number(row.REQ_CNT) : null,
    cmpet_rate: row.CMPET_RATE != null ? Number(row.CMPET_RATE) : null,
    suply_hshldco: row.SUPLY_HSHLDCO != null ? Number(row.SUPLY_HSHLDCO) : null,
    extra_json: null,
  };
}
