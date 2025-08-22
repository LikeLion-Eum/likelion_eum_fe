// src/components/ReceivedLoveCalls.tsx
import { useEffect, useState } from "react";
import { getReceivedLoveCalls, LoveCall, PageResult } from "@/services/loveCall";


type Props = { pageSize?: number };

export default function ReceivedLoveCalls({ pageSize = 10 }: Props) {
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<LoveCall[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(p = page) {
    if (loading || done) return;
    setLoading(true);
    setError(null);
    try {
      const res: PageResult<LoveCall> = await getReceivedLoveCalls(p, pageSize);
      const next = p === 0 ? res.items : [...items, ...res.items];
      setItems(next);

      // ← OR 두 개만, 그리고 totalPages 없을 수도 있으니 안전 처리
      setDone(
        res.items.length < pageSize ||
        (!!res.totalPages && p + 1 >= res.totalPages)
      );

      setPage(p);
    } catch (e: any) {
      console.error("받은 러브콜 로드 실패", e?.response?.status, e?.response?.data);
      setError("목록을 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(0); }, [pageSize]);

  return (
    <section className="grid gap-3">
      <h2 className="text-xl font-bold">받은 러브콜</h2>

      {items.length === 0 && !loading && !error && (
        <div className="muted text-sm">받은 러브콜이 없습니다.</div>
      )}

      {error && <div className="text-amber-600 text-sm">{error}</div>}

      <ul className="grid gap-2">
        {items.map((it) => (
          <li key={it.id} className="flex items-start justify-between rounded-xl border bg-white px-4 py-3">
            <div className="min-w-0">
              <div className="font-medium truncate">
                {it.title ?? it.message?.slice(0, 30) ?? `(ID ${it.id})`}
              </div>
              <div className="muted text-xs mt-0.5">
                보낸사람: {it.senderName ?? it.senderId ?? "-"}
                {it.createdAt && <> · {new Date(it.createdAt).toLocaleString()}</>}
              </div>
              {it.message && <p className="mt-1 text-sm line-clamp-2">{it.message}</p>}
            </div>
            {it.read === false && (
              <span className="ml-3 shrink-0 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">새 메세지</span>
            )}
          </li>
        ))}
      </ul>

      {loading && <div className="muted text-sm">불러오는 중…</div>}

      {!done && !loading && items.length > 0 && (
        <button className="justify-self-center rounded-lg border px-4 py-2" onClick={() => load(page + 1)}>
          더보기
        </button>
      )}
    </section>
  );
}
