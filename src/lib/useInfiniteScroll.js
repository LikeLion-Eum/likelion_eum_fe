import { useEffect, useRef, useState } from "react";
export const useInfiniteScroll = (loaderFn, { pageSize = 20, mapResponse } = {}) => {
    const [page, setPage] = useState(1);
    const [items, setItems] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const sentinelRef = useRef(null);
    const load = async () => {
        if (loading || !hasMore)
            return;
        setLoading(true);
        const res = await loaderFn({ page, pageSize });
        const { newItems, more } = mapResponse?.(res) ?? { newItems: res.data.items ?? [], more: res.data.hasMore ?? (res.data.items ?? []).length === pageSize };
        setItems((prev) => [...prev, ...newItems]);
        setHasMore(more);
        setPage((p) => p + 1);
        setLoading(false);
    };
    useEffect(() => {
        const el = sentinelRef.current;
        const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && load()));
        if (el)
            io.observe(el);
        return () => io.disconnect();
    }, [sentinelRef.current, hasMore, loading, page]);
    const reload = () => { setItems([]); setPage(1); setHasMore(true); };
    return { items, hasMore, loading, sentinelRef, reload };
};
