// src/pages/programs/ProgramDetail.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/lib/api";

type Program = {
  id: string;
  title: string;
  provider?: string;
  type?: string;
  region?: { si?: string; gu?: string };
  deadlineAt?: string;        // D-Day 텍스트나 날짜 문자열
  deadline?: string | null;   // 원본 마감일(yyyy-MM-dd)
  benefit?: string;
  link?: string;
};

function toDday(dateStr?: string | null): string | undefined {
  if (!dateStr) return undefined;
  const end = new Date(dateStr);
  end.setHours(23, 59, 59, 999);
  const diff = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "마감";
  if (diff === 0) return "D-Day";
  return `D-${diff}`;
}

export default function ProgramDetail() {
  const { id } = useParams();
  const [data, setData] = useState<Program | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // 주 엔드포인트
        const res = await api.get(`/api/incubation-centers/${id}`).catch(() =>
          // 레거시/폴백
          api.get(`/api/programs/${id}`)
        );

        const r: any = res.data ?? {};
        const loc = (r.region || r.location || "").toString().trim();
        const [si, gu] = loc ? loc.split(/\s+/, 2) : [undefined, undefined];
        const deadline = r.receiptEndDate ?? r.deadline ?? null;

        const mapped: Program = {
          id: String(r.id ?? id),
          title: r.title ?? r.name ?? "(제목 없음)",
          provider: r.provider ?? r.host ?? r.supportField ?? r.region ?? "",
          type: r.type ?? r.category ?? r.supportField ?? "",
          region: { si, gu },
          deadline,
          deadlineAt: toDday(deadline) ?? deadline ?? undefined,
          benefit: r.benefit ?? r.supportField ?? "",
          link: r.applyUrl ?? r.link ?? r.url ?? "",
        };
        setData(mapped);
      } catch (e) {
        console.error(e);
        setData(null);
      }
    })();
  }, [id]);

  if (!data) return <p className="py-6 text-center">로딩중…</p>;

  return (
    <section className="grid gap-4">
      <h1 className="text-xl font-bold">{data.title}</h1>
      <div className="card text-sm">
        <div>주최: {data.provider ?? "-"}</div>
        <div>유형: {data.type ?? "-"}</div>
        <div>
          지역: {data.region?.si ?? ""}{data.region?.gu ? `/${data.region.gu}` : ""}
        </div>
        <div>마감: {data.deadlineAt ?? "-"}</div>
        <div>혜택: {data.benefit ?? "-"}</div>
        {data.link && (
          <a className="brand underline" href={data.link} target="_blank" rel="noreferrer">
            신청 링크
          </a>
        )}
      </div>
    </section>
  );
}
