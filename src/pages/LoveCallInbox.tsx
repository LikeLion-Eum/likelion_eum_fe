// src/pages/LoveCallInbox.tsx
import { useEffect, useState } from "react";
import clsx from "clsx";
import Button from "@/components/Button";
import {
  fetchReceivedLoveCalls,
  fetchSentLoveCalls,
  markLoveCallRead,
  LoveCall,
  PageResult,
} from "@/services/loveCall";

type Box = "received" | "sent";

export default function LoveCallInbox() {
  const [box, setBox] = useState<Box>("received");
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<LoveCall[]>([]);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const pageSize = 20;

  async function load(p = page, reset = false) {
    if (loading) return;
    setLoading(true);
    setErr(null);
    try {
      let res: PageResult<LoveCall>;
      if (box === "received") res = await fetchReceivedLoveCalls(p, pageSize);
      else                    res = await fetchSentLoveCalls(p, pageSize);

      const next = reset ? res.items : [...items, ...res.items];
      setItems(next);
      setDone(res.items.length < pageSize || (!!res.totalPages && p + 1 >= (res.totalPages ?? 0)));
      setPage(p);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // 박스 전환 시 처음부터
    setItems([]);
    setPage(0);
    setDone(false);
    load(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [box]);

  const onMarkRead = async (id: number) => {
    try {
      await markLoveCallRead(id);
      setItems((arr) => arr.map((x) => (x.id === id ? { ...x, read: true } : x)));
    } catch {}
  };

  return (
    <section className="card grid gap-4">
      {/* 탭 */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            className={clsx("rounded-full px-3 py-1 text-sm",
              box === "received" ? "bg-[var(--c-outline-hover-bg)]" : "bg-white border border-[var(--c-card-border)]")}
            onClick={() => setBox("received")}
          >
            받은 러브콜
          </button>
          <button
            className={clsx("rounded-full px-3 py-1 text-sm",
              box === "sent" ? "bg-[var(--c-outline-hover-bg)]" : "bg-white border border-[var(--c-card-border)]")}
            onClick={() => setBox("sent")}
          >
            보낸 러브콜
          </button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => load(0, true)}>새로고침</Button>
        </div>
      </div>

      {/* 목록 */}
      <div className="overflow-hidden rounded-xl border border-[var(--c-card-border)] bg-white">
        <div className="grid grid-cols-[1fr_140px_160px_90px] items-center border-b border-[var(--c-card-border)] bg-[var(--c-card)] px-3 py-2 text-sm font-semibold">
          <div>메시지 / 관련</div>
          <div className="text-center">{box === "received" ? "보낸 사람" : "받는 사람"}</div>
          <div className="text-center">시간</div>
          <div className="text-center">상태</div>
        </div>

        <ul className="divide-y divide-[var(--c-card-border)]">
          {items.map((lc) => (
            <li key={lc.id} className="grid grid-cols-[1fr_140px_160px_90px] items-center px-3 py-3">
              <div className="min-w-0">
                <div className="truncate text-[var(--c-text)]">{lc.message || lc.title || `(ID ${lc.id})`}</div>
                <div className="mt-1 text-xs muted">
                  {lc.recruitmentId ? `모집글 #${lc.recruitmentId}` : ""}
                </div>
              </div>
              <div className="text-center text-sm">
                {box === "received" ? (lc.senderName ?? lc.senderId ?? "-") : "수신자"}
              </div>
              <div className="text-center text-sm">
                {lc.createdAt ? new Date(lc.createdAt).toLocaleString() : "-"}
              </div>
              <div className="text-center">
                {lc.read ? (
                  <span className="rounded-full bg-[var(--c-outline-hover-bg)] px-2 py-0.5 text-xs">읽음</span>
                ) : (
                  <button onClick={() => onMarkRead(lc.id)} className="btn btn-outline h-7 px-2 text-xs">읽기</button>
                )}
              </div>
            </li>
          ))}
          {!loading && items.length === 0 && (
            <li className="px-3 py-6 text-center text-sm muted">표시할 항목이 없습니다.</li>
          )}
          {loading && (
            <li className="px-3 py-6 text-center text-sm muted">불러오는 중…</li>
          )}
          {err && (
            <li className="px-3 py-6 text-center text-sm accent">{err}</li>
          )}
        </ul>
      </div>

      {!done && !loading && items.length > 0 && (
        <button className="justify-self-center rounded-lg border px-4 py-2" onClick={() => load(page + 1)}>
          더보기
        </button>
      )}
    </section>
  );
}
