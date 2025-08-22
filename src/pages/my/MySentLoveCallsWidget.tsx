import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "@/components/Button";
import { fetchSentLoveCalls, type LoveCall, deleteLoveCall } from "@/services/loveCall";
import { useToast } from "@/components/ToastHost";
import clsx from "clsx";

const PREVIEW_SIZE = 10;   // 한번에 넉넉히 가져오기
const COLLAPSED_COUNT = 3; // 접힘 상태에서 최대 3개 노출

export default function MySentLoveCallsWidget() {
  const [items, setItems] = useState<LoveCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const toast = useToast();

  const visible = useMemo(() => (expanded ? items : items.slice(0, COLLAPSED_COUNT)), [items, expanded]);
  const hasMore = items.length > COLLAPSED_COUNT;

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      // 서비스는 0-based 페이지
      const page = await fetchSentLoveCalls(0, PREVIEW_SIZE);
      setItems(page.items ?? []);
    } catch (e: any) {
      setErr("보낸 러브콜을 불러오지 못했어요.");
      toast.error(`불러오기 실패${e?.message ? `: ${e.message}` : ""}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <section className="rounded-3xl border border-[var(--c-card-border)] bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-center gap-3">
        <span className="h-1.5 w-8 rounded-full bg-[var(--c-cta)]" />
        <h2 className="text-lg font-semibold text-gray-900">보낸 러브콜</h2>
      </div>

      {/* 헤더 우측 액션 */}
      <div className="mb-3 flex items-center justify-end gap-2">
        {hasMore && (
          <Button
            variant="outline"
            className="h-8 px-3 text-xs"
            onClick={() => setExpanded(v => !v)}
            aria-expanded={expanded}
            aria-label={expanded ? "목록 접기" : "목록 펼치기"}
          >
            {expanded ? "접기 ▲" : "더 보기 ▼"}
          </Button>
        )}
        <Link to="/my/lovecalls?tab=sent" className="no-underline">
          <Button variant="outline" className="h-8">모두 보기</Button>
        </Link>
      </div>

      {/* 로딩 */}
      {loading && (
        <ul className="grid gap-2">
          {Array.from({ length: COLLAPSED_COUNT }).map((_, i) => (
            <li key={i} className="h-[54px] animate-pulse rounded-xl border border-[var(--c-card-border)] bg-[var(--c-bg2)]" />
          ))}
        </ul>
      )}

      {/* 에러 */}
      {!loading && err && (
        <div className="rounded-xl border border-[var(--c-card-border)] p-4 text-sm text-red-600">
          {err}
        </div>
      )}

      {/* 빈 */}
      {!loading && !err && items.length === 0 && (
        <div className="rounded-xl border border-[var(--c-card-border)] p-6 text-center text-sm text-gray-600">
          보낸 러브콜이 없습니다.
        </div>
      )}

      {/* 목록 */}
      {!loading && !err && items.length > 0 && (
        <ul className={clsx("grid gap-2 transition-all")}>
          {visible.map((it) => (
            <li
              key={it.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--c-card-border)] bg-white p-3 hover:shadow-sm"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {it.receiverName ? `${it.receiverName}에게 보냄` : "보낸 러브콜"}
                </p>
                {it.message && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-gray-700">{it.message}</p>
                )}
                <p className="mt-0.5 text-[11px] text-gray-500">
                  {it.createdAt ? new Date(it.createdAt).toLocaleString("ko-KR") : ""}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Link to="/my/lovecalls?tab=sent" className="no-underline">
                  <Button variant="outline" className="h-8 px-3 text-xs">열기</Button>
                </Link>
                <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => onDelete(it.id)}>
                  삭제
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
