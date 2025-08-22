import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "@/components/Button";
import { fetchReceivedLoveCalls, type LoveCall } from "@/services/loveCall";
import { useToast } from "@/components/ToastHost";
import clsx from "clsx";

const PREVIEW_SIZE = 10;   // 한 번에 가져올 갯수(여유 있게)
const COLLAPSED_COUNT = 3; // 접힘 상태에서 보여줄 갯수

export default function MyLoveCallsWidget() {
  const [items, setItems] = useState<LoveCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const toast = useToast(); // { success, error }

  const visible = useMemo(() => {
    if (expanded) return items;
    return items.slice(0, COLLAPSED_COUNT);
  }, [items, expanded]);

  const hasMore = items.length > COLLAPSED_COUNT;

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      // 0-based page=0, size=PREVIEW_SIZE
      const page = await fetchReceivedLoveCalls(0, PREVIEW_SIZE);
      setItems(page.items ?? []);
    } catch (e: any) {
      setErr("받은 러브콜을 불러오지 못했어요.");
      toast.error(`불러오기 실패${e?.message ? `: ${e.message}` : ""}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="rounded-2xl border border-[var(--c-card-border)] bg-white p-5 shadow-sm">
      {/* 헤더 */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">받은 러브콜</h3>
        <div className="flex items-center gap-2">
          {hasMore && (
            <Button
              variant="outline"
              className="h-8 px-3 text-xs"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              aria-label={expanded ? "목록 접기" : "목록 펼치기"}
            >
              {expanded ? "접기 ▲" : "더 보기 ▼"}
            </Button>
          )}
          <Link to="/my/lovecalls" className="no-underline">
            <Button variant="outline" className="h-8">모두 보기</Button>
          </Link>
        </div>
      </div>

      {/* 로딩 */}
      {loading && (
        <ul className="grid gap-2">
          {Array.from({ length: COLLAPSED_COUNT }).map((_, i) => (
            <li
              key={i}
              className="h-[54px] animate-pulse rounded-xl border border-[var(--c-card-border)] bg-[var(--c-bg2)]"
            />
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
          받은 러브콜이 없습니다.
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
                <div className="flex items-center gap-2">
                  {!it.read && (
                    <span
                      className="inline-block h-2 w-2 rounded-full bg-[var(--c-accent)]"
                      aria-label="unread"
                    />
                  )}
                  <p className="truncate text-sm font-medium">
                    {it.senderName ? `${it.senderName}의 러브콜` : "러브콜"}
                  </p>
                </div>
                {it.message && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-gray-700">{it.message}</p>
                )}
                <p className="mt-0.5 text-[11px] text-gray-500">
                  {it.createdAt ? new Date(it.createdAt).toLocaleString("ko-KR") : ""}
                </p>
              </div>

              <Link to="/my/lovecalls" className="no-underline shrink-0">
                <Button variant="outline" className="h-8 px-3 text-xs">열기</Button>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
