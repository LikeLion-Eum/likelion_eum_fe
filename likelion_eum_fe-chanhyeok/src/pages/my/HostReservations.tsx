import { useState } from "react";
import Button from "@/components/Button";
import { fetchOfficeReservations, OfficeReservation } from "@/services/reservations";

function Badge({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "green" | "gray" }) {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  const map = {
    blue: "bg-blue-50 text-blue-700 border border-blue-100",
    green: "bg-green-50 text-green-700 border border-green-100",
    gray: "bg-gray-100 text-gray-700 border border-gray-200",
  } as const;
  return <span className={`${base} ${map[tone]}`}>{children}</span>;
}

export default function HostReservations() {
  const [officeIdInput, setOfficeIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<OfficeReservation[]>([]);

  const load = async () => {
    const id = Number(officeIdInput);
    if (!id) {
      alert("오피스 ID를 숫자로 입력해주세요.");
      return;
    }
    try {
      setLoading(true);
      const res = await fetchOfficeReservations(id);
      setList(res);
    } catch (e: any) {
      alert(e?.response?.data?.error || "불러오기 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <header className="rounded-2xl bg-white p-6 ring-1 ring-[var(--c-card-border)]">
        <h1 className="text-2xl font-bold">예약목록 관리</h1>
        <p className="muted mt-1">오피스 ID로 조회하여 신청 현황을 확인하세요.</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            className="input h-10 w-40"
            placeholder="오피스 ID"
            value={officeIdInput}
            onChange={(e) => setOfficeIdInput(e.target.value)}
          />
          <Button variant="outline" className="h-10" onClick={load}>조회</Button>
        </div>
      </header>

      <section className="rounded-2xl border border-[var(--c-card-border)] bg-white p-6">
        {loading ? (
          <p className="muted">불러오는 중…</p>
        ) : list.length === 0 ? (
          <p className="muted">표시할 예약이 없습니다.</p>
        ) : (
          <div className="grid gap-4">
            {list.map((r) => (
              <article key={r.id} className="rounded-xl border border-[var(--c-card-border)] p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-[var(--c-bg2)] text-sm font-semibold">
                      {r.reserverName.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-semibold">{r.reserverName}</div>
                      <div className="text-xs text-[var(--c-muted)]">
                        {r.reserverEmail} · {r.reserverPhone}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge tone="blue">{new Date(r.startAt).toLocaleDateString()}</Badge>
                    <Badge tone="green">{r.months}개월</Badge>
                  </div>
                </div>

                {r.inquiryNote && (
                  <p className="mt-3 rounded-lg bg-[var(--c-bg2)] px-3 py-2 text-sm">
                    문의: {r.inquiryNote}
                  </p>
                )}

                <div className="mt-2 text-xs text-[var(--c-muted)]">
                  신청일 {new Date(r.createdAt).toLocaleString()}
                </div>

                <div className="mt-3 flex justify-end gap-2">
                  <Button className="h-9">승인</Button>
                  <Button variant="outline" className="h-9">거절</Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
