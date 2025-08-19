import { useEffect, useState } from "react";
import api from "@/lib/api";
import Button from "@/components/Button";
import clsx from "clsx";

/** 서버 응답 예시
 * GET /lovecalls?box=received&limit=20 -> { items: LoveCall[] }
 * GET /lovecalls?box=sent&limit=20     -> { items: LoveCall[] }
 * PATCH /lovecalls/:id/read -> { ok:true }
 */
type LoveCall = {
  id: string;
  fromPostId?: string;
  toProfileId?: string;
  message: string;
  createdAt: string;
  read?: boolean;
  // UI용 파생 필드(서버에서 주면 그대로 사용)
  fromName?: string;
  toName?: string;
  postTitle?: string;
};

type Box = "received" | "sent";

export default function LoveCallInbox() {
  const [box, setBox] = useState<Box>("received");
  const [items, setItems] = useState<LoveCall[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await api.get(`/lovecalls?box=${box}&limit=20`);
      const data = res.data;
      const list: LoveCall[] = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
        ? data
        : [];
      setItems(list);
    } catch (e) {
      setErr("불러오기에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [box]);

  const markRead = async (id: string) => {
    try {
      await api.patch(`/lovecalls/${id}/read`, {});
      setItems((arr) => arr.map((x) => (x.id === id ? { ...x, read: true } : x)));
    } catch {}
  };

  return (
    <section className="card grid gap-4">
      {/* 탭 */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            className={clsx(
              "rounded-full px-3 py-1 text-sm",
              box === "received" ? "bg-[var(--c-outline-hover-bg)]" : "bg-white border border-[var(--c-card-border)]"
            )}
            onClick={() => setBox("received")}
          >
            받은 러브콜
          </button>
          <button
            className={clsx(
              "rounded-full px-3 py-1 text-sm",
              box === "sent" ? "bg-[var(--c-outline-hover-bg)]" : "bg-white border border-[var(--c-card-border)]"
            )}
            onClick={() => setBox("sent")}
          >
            보낸 러브콜
          </button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load}>새로고침</Button>
        </div>
      </div>

      {/* 목록 (게시판형) */}
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
                <div className="truncate text-[var(--c-text)]">{lc.message}</div>
                <div className="mt-1 text-xs muted">
                  {lc.postTitle ? `모집글: ${lc.postTitle}` : (lc.fromPostId ? `모집글 #${lc.fromPostId}` : "")}
                  {lc.toProfileId ? ` · 프로필 #${lc.toProfileId}` : ""}
                </div>
              </div>
              <div className="text-center text-sm">
                {box === "received" ? (lc.fromName ?? `작성자`) : (lc.toName ?? `수신자`)}
              </div>
              <div className="text-center text-sm">{formatDateTime(lc.createdAt)}</div>
              <div className="text-center">
                {lc.read ? (
                  <span className="rounded-full bg-[var(--c-outline-hover-bg)] px-2 py-0.5 text-xs">읽음</span>
                ) : (
                  <button onClick={() => markRead(lc.id)} className="btn btn-outline h-7 px-2 text-xs">읽기</button>
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
    </section>
  );
}

function formatDateTime(v: string) {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}`;
}
