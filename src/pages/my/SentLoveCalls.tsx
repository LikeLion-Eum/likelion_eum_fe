import { useEffect, useMemo, useState } from "react";
import Button from "@/components/Button";
import Pagination from "@/components/Pagination";
import { fetchSentLoveCalls, deleteLoveCall, type LoveCall } from "@/services/loveCall";
import { useToast } from "@/components/ToastHost";

type State = "idle" | "loading" | "ok" | "error";
const PAGE_SIZE = 12;

export default function SentLoveCalls() {
  const [state, setState] = useState<State>("idle");
  const [items, setItems] = useState<LoveCall[]>([]);
  const [page, setPage] = useState(1); // UI는 1-based
  const [totalPages, setTotalPages] = useState(1);
  const { success, error } = useToast();

  const hasItems = useMemo(() => (items?.length ?? 0) > 0, [items]);

  const load = async () => {
    setState("loading");
    try {
      const data = await fetchSentLoveCalls(page - 1, PAGE_SIZE);
      setItems(data.items ?? []);
      setTotalPages(data.totalPages ?? 1);
      setState("ok");
    } catch (e: any) {
      setState("error");
      error(`불러오기 실패${e?.message ? `: ${e.message}` : ""}`);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page]);

  const onDelete = async (id: number) => {
    if (!confirm("이 러브콜을 삭제할까요?")) return;
    try {
      await deleteLoveCall(id);
      setItems(prev => prev.filter(x => x.id !== id));
      success("삭제 완료");
    } catch (e: any) {
      error(`삭제 실패${e?.message ? `: ${e.message}` : ""}`);
    }
  };

  return (
    <div className="grid gap-5">
      {/* 헤더 */}
      <div className="rounded-2xl bg-gradient-to-r from-[var(--c-bg2)] to-white p-6 ring-1 ring-[var(--c-card-border)]">
        <h1 className="text-xl font-semibold">보낸 러브콜</h1>
        <p className="muted mt-1 text-sm">내가 보낸 러브콜을 관리합니다.</p>
      </div>

      {/* 목록 */}
      <div className="grid gap-4">
        {state === "loading" && (
          <div className="grid gap-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-[92px] animate-pulse rounded-xl border border-[var(--c-card-border)] bg-[var(--c-bg2)]" />
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
            <p className="text-sm text-gray-600">보낸 러브콜이 없습니다.</p>
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
                  <h3 className="truncate text-base font-semibold">
                    {it.receiverName ? `${it.receiverName}에게 보냄` : "보낸 러브콜"}
                  </h3>
                  {it.title && (
                    <p className="mt-0.5 truncate text-sm text-gray-800">{it.title}</p>
                  )}
                  {it.message && (
                    <p className="mt-1 line-clamp-2 text-sm text-gray-700">{it.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {it.createdAt ? new Date(it.createdAt).toLocaleString("ko-KR") : ""}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
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
