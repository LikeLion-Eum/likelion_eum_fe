import { useEffect, useRef, useState } from "react";

type LoaderFn = (args: { page: number; pageSize: number }) => Promise<any>;
type MapResponse<T> = (res: any) => { newItems: T[]; more: boolean };

export const useInfiniteScroll = <T,>(
  loaderFn: LoaderFn,
  { pageSize = 20, mapResponse }: { pageSize?: number; mapResponse?: MapResponse<T> } = {}
) => {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const load = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const res = await loaderFn({ page, pageSize });
    const { newItems, more } =
      mapResponse?.(res) ?? { newItems: res.data.items ?? [], more: res.data.hasMore ?? (res.data.items ?? []).length === pageSize };
    setItems((prev) => [...prev, ...newItems]);
    setHasMore(more);
    setPage((p) => p + 1);
    setLoading(false);
  };

  useEffect(() => {
    const el = sentinelRef.current;
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && load()));
    if (el) io.observe(el);
    return () => io.disconnect();
  }, [sentinelRef.current, hasMore, loading, page]);

  const reload = () => { setItems([]); setPage(1); setHasMore(true); };

  return { items, hasMore, loading, sentinelRef, reload };
};
