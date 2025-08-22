// src/pages/my/ReceivedLoveCalls.tsx
import { useEffect, useMemo, useState } from "react";
import Button from "@/components/Button";
import Pagination from "@/components/Pagination";
import {
  fetchReceivedLoveCalls,
  markLoveCallRead,
  deleteLoveCall,
  type LoveCall,
} from "@/services/loveCall";
import { useToast } from "@/components/ToastHost";

type State = "idle" | "loading" | "ok" | "error";
const PAGE_SIZE = 12; // 한 페이지당 12개 (서비스는 0-based)

export default function ReceivedLoveCalls() {
  const [state, setState] = useState<State>("idle");
  const [items, setItems] = useState<LoveCall[]>([]);
  const [page, setPage] = useState(1); // UI는 1-based
  const [totalPages, setTotalPages] = useState(1);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const toast = useToast(); // { success, error }

  const hasItems = useMemo(() => items.length > 0, [items]);

  const load = async () => {
    setState("loading");
    try {
      const data = await fetchReceivedLoveCalls(page - 1, PAGE_SIZE, { onlyUnread });
      setItems(data.items ?? []);
      setTotalPages(data.totalPages ?? 1);
      setState("ok");
    } catch (e: any) {
      setState("error");
      toast.error(`불러오기 실패${e?.message ? `: ${e.message}` : ""}`);
    }
  };

  useEffect(() => {
    // 필터/페이지 변동 시 재조회
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, onlyUnread]);

  const onMarkRead = async (id: number) => {
    try {
      await markLoveCallRead(id, true);
      setItems(prev => prev.map(x => (x.id === id ? { ...x, read: true } : x)));
      toast.success("읽음 처리 완료");
    } catch (e: any) {
      toast.error(`읽음 처리 실패${e?.message ? `: ${e.message}` : ""}`);
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("이 러브콜을 삭제할까요?")) return;
    try {
      await deleteLoveCall(id);
      setItems(prev => prev.filter(x => x.id !== id));
      toast.success("삭제 완료");
    } catch (e: any) {
      toast.error(`삭제 실패${e?.message ? `: ${e.message}` : ""}`);
    }
  };

  return (
    <div className="grid gap-5">
      {/* 헤더 */}
      <div className="rounded-2xl bg-gradient-to-r from-[var(--c-bg2)] to-white p-6 ring-1 ring-[var(--c-card-border)]">
        <h1 className="text-xl font-semibold">받은 러브콜</h1>
        <p className="muted mt-1 text-sm">팀에서 보낸 연락을 한 곳에서 확인하세요.</p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={onlyUnread}
              onChange={(e) => {
                setPage(1);                 // 필터 바뀌면 첫 페이지로
                setOnlyUnread(e.target.checked);
              }}
            />
            안 읽은 것만 보기
          </label>
        </div>
      </div>

      {/* 목록 */}
      <div className="grid gap-4">
        {state === "loading" && (
          <div className="grid gap-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="h-[92px] animate-pulse rounded-xl border border-[var(--c-card-border)] bg-[var(--c-bg2)]"
              />
            ))}
          </div>
        )}

        {state === "error" && (
          <div className="rounded-xl border border-[var(--c-card-border)] p-5 text-sm text-red-600">
            목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
          </div>
        )}

        {state === "ok" && !hasItems && (
          <div className="rounded-xl border border-[var(--c-card-border)] p-8 text-center">
            <p className="text-sm text-gray-600">
              받은 러브콜이 없습니다{onlyUnread ? " (읽지 않은 항목 없음)" : ""}.
            </p>
          </div>
        )}

        {state === "ok" && hasItems && (
          <ul className="grid gap-3">
            {items.map((it) => (
              <li
                key={it.id}
                className="group flex items-start justify-between gap-4 rounded-xl border border-[var(--c-card-border)] bg-white p-4 hover:shadow-sm"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {!it.read && (
                      <span
                        className="inline-block h-2 w-2 rounded-full bg-[var(--c-accent)]"
                        aria-label="unread"
                      />
                    )}
                    <h3 className="truncate text-base font-semibold">
                      {it.senderName ? `${it.senderName}의 러브콜` : "러브콜"}
                    </h3>
                  </div>

                  {it.title && (
                    <p className="mt-0.5 truncate text-sm text-gray-800">{it.title}</p>
                  )}

                  {it.message && (
                    <p className="mt-1 line-clamp-2 text-sm text-gray-700">{it.message}</p>
                  )}

                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span>
                      {it.createdAt ? new Date(it.createdAt).toLocaleString("ko-KR") : ""}
                    </span>
                    {it.contactEmail && (
                      <span className="text-gray-600">
                        연락처: <span className="font-medium">{it.contactEmail}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {!it.read && (
                    <Button variant="outline" className="h-8" onClick={() => onMarkRead(it.id)}>
                      읽음
                    </Button>
                  )}
                  <Button variant="outline" className="h-8" onClick={() => onDelete(it.id)}>
                    삭제
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 페이지네이션 */}
      {state === "ok" && totalPages > 1 && (
        <div className="mt-2">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
