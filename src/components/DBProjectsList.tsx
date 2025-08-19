"use client";

import { useEffect, useState } from "react";
import { supabaseAnon } from "@/lib/supabase";

type Project = {
  announce_no: string;
  proj_name: string;
  region_sig_cd: string | null;
  builder: string | null;
  announce_dt: string | null;
};

export default function DBProjectsList() {
  const [rows, setRows] = useState<Project[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const db = supabaseAnon();
      const { data, error } = await db
        .from("projects")
        .select("*")
        .order("announce_dt", { ascending: false })
        .limit(20);
      if (error) setErr(error.message);
      else setRows(data as Project[]);
    };
    run();
  }, []);

  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold">DB에서 읽어온 프로젝트</h2>
      <p className="text-sm text-gray-500">/api/seed 호출 후 새로고침하면 데이터가 보입니다.</p>

      {err && <div className="mt-4 text-red-600">에러: {err}</div>}
      {!rows && !err && <div className="mt-4 text-gray-500">불러오는 중…</div>}
      {rows && rows.length === 0 && (
        <div className="mt-4 text-gray-500">아직 데이터가 없습니다. 먼저 /api/seed 를 호출하세요.</div>
      )}

      <div className="mt-4 grid gap-3">
        {rows?.map((p) => (
          <div key={p.announce_no} className="rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{p.proj_name}</div>
              <div className="text-sm text-gray-500">{p.announce_dt ?? "-"}</div>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              공고번호: {p.announce_no} · 시공사: {p.builder ?? "-"} · 지역코드: {p.region_sig_cd ?? "-"}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
