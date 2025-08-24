import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import Button from "@/components/Button";
import clsx from "clsx";
import { deleteLoveCall } from "@/services/lovecall";

/** 백엔드 DTO (LoveCallResponse) */
type LoveCall = {
  id: number;
  recruitmentId: number;
  recipientId: number;
  senderId: number;
  message?: string;
  createdAt: string;
  readAt?: string | null;
  fromName?: string;
  toName?: string;
  postTitle?: string;
};

type PageResp<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // 0-based
  size: number;
};

type Box = "received" | "sent";

// 인증 대체용 해커톤 고정 유저
const USER_ID = 1;

/** 앱 라우트에 맞춰 수정 */
const recruitmentPath = (id: number) => `/teams/${id}`;

export default function LoveCallInbox() {
  const [box, setBox] = useState<Box>("received");
  const [items, setItems] = useState<LoveCall[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const size = 10;

  /** 메시지 펼침 상태: 항목 id -> boolean */
  const [openMsg, setOpenMsg] = useState<Record<number, boolean>>({});

  const toggleOpen = (id: number) =>
    setOpenMsg((m) => ({ ...m, [id]: !m[id] }));

  async function load(p = page) {
    setLoading(true);
    setErr(null);
    try {
      const url =
        box === "received"
          ? "/api/me/love-calls/received"
          : "/api/me/love-calls/sent";
      const { data } = await api.get<PageResp<LoveCall>>(url, {
        params: { page: p, size, userId: USER_ID },
      });
      setItems(data?.content ?? []);
      setTotalPages(data?.totalPages ?? 0);
      setPage(data?.number ?? p);
    } catch {
      setErr("불러오기에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPage(0);
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [box]);

  async function onDelete(id: number) {
    const ok = window.confirm("이 러브콜을 삭제할까요? (되돌릴 수 없음)");
    if (!ok) return;
    try {
      await deleteLoveCall(id, USER_ID);
      setItems((arr) => arr.filter((x) => x.id !== id));
      if (items.length === 1 && page > 0) {
        load(page - 1);
      }
    } catch {
      alert("삭제에 실패했습니다.");
    }
  }

  const hasPrev = page > 0;
  const hasNext = page + 1 < totalPages;

  return (
    <section className="card grid gap-4">
      {/* 탭/툴바 */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            className={clsx(
              "rounded-full px-3 py-1 text-sm",
              box === "received"
                ? "bg-[var(--c-outline-hover-bg)]"
                : "bg-white border border-[var(--c-card-border)]"
            )}
            onClick={() => setBox("received")}
          >
            받은 러브콜
          </button>
          <button
            className={clsx(
              "rounded-full px-3 py-1 text-sm",
              box === "sent"
                ? "bg-[var(--c-outline-hover-bg)]"
                : "bg-white border border-[var(--c-card-border)]"
            )}
            onClick={() => setBox("sent")}
          >
            보낸 러브콜
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => load()} disabled={loading}>
            새로고침
          </Button>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              onClick={() => load(page - 1)}
              disabled={!hasPrev || loading}
            >
              이전
            </Button>
            <span className="text-sm muted">
              {totalPages === 0 ? 0 : page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => load(page + 1)}
              disabled={!hasNext || loading}
            >
              다음
            </Button>
          </div>
        </div>
      </div>

      {/* 목록: 작업(모집글/삭제) 포함 4열 */}
      <div className="overflow-hidden rounded-xl border border-[var(--c-card-border)] bg-white">
        <div className="grid grid-cols-[1fr_140px_160px_140px] items-center border-b border-[var(--c-card-border)] bg-[var(--c-card)] px-3 py-2 text-sm font-semibold">
          <div>메시지 / 관련</div>
          <div className="text-center">
            {box === "received" ? "보낸 사람" : "받는 사람"}
          </div>
          <div className="text-center">시간</div>
          <div className="text-center">작업</div>
        </div>

        <ul className="divide-y divide-[var(--c-card-border)]">
          {items.map((lc) => {
            const opened = !!openMsg[lc.id];
            return (
              <li
                key={lc.id}
                className="grid grid-cols-[1fr_140px_160px_140px] items-center px-3 py-3"
              >
                {/* 메시지 + 관련 */}
                <div className="min-w-0">
                  {/* ✅ 더보기/접기: 잘림 제거 */}
                  <div
                    className={[
                      "text-[var(--c-text)] whitespace-pre-wrap break-words",
                      opened ? "" : "line-clamp-2",
                    ].join(" ")}
                  >
                    {lc.message || "(메시지 없음)"}
                  </div>
                  <div className="mt-1 text-xs muted">
                    {lc.recruitmentId ? (
                      <>
                        모집글:{" "}
                        <Link
                          to={recruitmentPath(lc.recruitmentId)}
                          className="underline text-[var(--c-brand)]"
                        >
                          {lc.postTitle ? lc.postTitle : `#${lc.recruitmentId}`}
                        </Link>
                      </>
                    ) : null}
                    {lc.recipientId ? ` · 프로필 #${lc.recipientId}` : ""}
                  </div>
                  {/* 토글 버튼 */}
                  {lc.message && lc.message.length > 50 && (
                    <button
                      className="mt-1 text-xs underline text-gray-600"
                      onClick={() => toggleOpen(lc.id)}
                    >
                      {opened ? "접기" : "더보기"}
                    </button>
                  )}
                </div>

                {/* 사람 */}
                <div className="text-center text-sm">
                  {box === "received"
                    ? lc.fromName ?? `작성자 #${lc.senderId}`
                    : lc.toName ?? `수신자 #${lc.recipientId}`}
                </div>

                {/* 시간 */}
                <div className="text-center text-sm">
                  {formatDateTime(lc.createdAt)}
                </div>

                {/* 작업 */}
                <div className="flex items-center justify-center gap-2">
                  {lc.recruitmentId ? (
                    <Link
                      to={recruitmentPath(lc.recruitmentId)}
                      className="btn btn-outline h-7 px-2 text-xs"
                    >
                      모집글
                    </Link>
                  ) : null}
                  <button
                    onClick={() => onDelete(lc.id)}
                    className="btn btn-outline h-7 px-2 text-xs"
                  >
                    삭제
                  </button>
                </div>
              </li>
            );
          })}

          {!loading && items.length === 0 && (
            <li className="px-3 py-6 text-center text-sm muted">
              표시할 항목이 없습니다.
            </li>
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
