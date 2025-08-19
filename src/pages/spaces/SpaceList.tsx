import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "@/components/Button";
import api from "@/lib/api";
import { listSharedOfficePhotos, PhotoItem } from "@/services/sharedOfficePhotos";

/** 서버 목록 응답에 맞춘 타입 (필요 시 보강) */
type Office = {
  id: number;
  name: string;
  description?: string;
  roomCount?: number;
  size?: number;           // ㎡
  location: string;        // 주소
  maxCount?: number;       // 최대 수용
  monthlyPrice?: number;   // 서버가 제공하면 표시
};

/** KRW 포맷 */
function krw(n?: number) {
  if (n == null) return "";
  try {
    return new Intl.NumberFormat("ko-KR").format(n);
  } catch {
    return String(n);
  }
}

/** 카드 스켈레톤 */
function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--c-card-border)] bg-white shadow-sm">
      <div className="skeleton h-40 w-full" />
      <div className="grid gap-2 p-4">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-4 w-2/3" />
      </div>
    </div>
  );
}

export default function SpaceList() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");
  const [items, setItems] = useState<Office[]>([]);
  const [thumbs, setThumbs] = useState<Record<number, string>>({}); // id → url

  // 간단 검색/필터 (지역 키워드, 최소/최대 가격)
  const [qRegion, setQRegion] = useState("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  // 서버에서 전체 목록 가져오기
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const { data } = await api.get<Office[]>("/shared-offices");
        setItems(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setErr(e?.response?.data?.error || e?.message || "목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 각 오피스의 대표 사진(또는 첫 장)을 비동기로 수집
  useEffect(() => {
    if (!items.length) return;
    let cancelled = false;
    (async () => {
      const results = await Promise.allSettled(
        items.map(async (o) => {
          const list = await listSharedOfficePhotos(o.id);
          const main = list.find((p: PhotoItem) => p.main) ?? list[0];
          return { id: o.id, url: main?.url || "" };
        })
      );
      if (cancelled) return;
      const map: Record<number, string> = {};
      results.forEach((r) => {
        if (r.status === "fulfilled" && r.value?.url) {
          map[r.value.id] = r.value.url;
        }
      });
      setThumbs(map);
    })();
    return () => {
      cancelled = true;
    };
  }, [items]);

  // 클라이언트 측 간단 필터링 (서버 필터 API가 생기면 교체)
  const filtered = useMemo(() => {
    let list = items.slice();

    if (qRegion.trim()) {
      const s = qRegion.trim();
      list = list.filter((o) => (o.location || "").includes(s));
    }

    const minP = minPrice ? parseInt(minPrice, 10) : null;
    const maxP = maxPrice ? parseInt(maxPrice, 10) : null;
    if (minP != null) list = list.filter((o) => (o.monthlyPrice ?? Number.MAX_SAFE_INTEGER) >= minP);
    if (maxP != null) list = list.filter((o) => (o.monthlyPrice ?? 0) <= maxP);

    return list;
  }, [items, qRegion, minPrice, maxPrice]);

  return (
    <section className="grid gap-6">
      {/* 헤더 + 검색바 */}
      <div className="rounded-3xl border border-[var(--c-card-border)] bg-gradient-to-b from-white to-[var(--c-bg2)] p-6 shadow-sm">
        <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h1 className="text-xl font-bold">공유오피스 탐색</h1>
            <p className="muted mt-1 text-sm">대표 사진, 가격, 주소를 빠르게 확인하고 상세 페이지로 이동하세요.</p>
          </div>
          <Link to="/spaces/new" className="no-underline">
            <Button variant="outline">공간 등록하러 가기</Button>
          </Link>
        </div>

        {/* 검색/필터 바 */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="mt-4 grid gap-2 md:grid-cols-[1fr_auto_auto_auto] md:items-center"
        >
          <input
            value={qRegion}
            onChange={(e) => setQRegion(e.target.value)}
            placeholder="지역/주소로 검색 (예: 서울 강남구, 아산시)"
            className="h-11 rounded-xl border border-[var(--c-card-border)] bg-white px-4 text-sm placeholder:muted focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)]"
          />
          <div className="flex items-center justify-between gap-2">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={10000}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="최소 월요금"
              className="h-11 w-36 rounded-xl border border-[var(--c-card-border)] bg-white px-3 text-sm"
            />
            <span className="muted text-xs">~</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={10000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="최대 월요금"
              className="h-11 w-36 rounded-xl border border-[var(--c-card-border)] bg-white px-3 text-sm"
            />
          </div>
          <Button className="h-11">검색</Button>
        </form>
      </div>

      {/* 목록 */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : err ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-900">{err}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[var(--c-card-border)] bg-white p-8 text-center">
          <div className="text-sm">표시할 공간이 없습니다.</div>
          <div className="muted mt-2 text-xs">검색어/가격 범위를 조정해 보세요.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((o) => {
            const thumb = thumbs[o.id]; // 대표 사진 or 첫 장
            const price = o.monthlyPrice != null ? `월 ${krw(o.monthlyPrice)}원` : "가격문의";
            return (
              <Link
                key={o.id}
                to={`/spaces/${o.id}`}
                className="group overflow-hidden rounded-2xl border border-[var(--c-card-border)] bg-white no-underline shadow-sm transition hover:shadow-md"
              >
                {/* 썸네일 */}
                <div className="relative h-40 w-full overflow-hidden bg-[var(--c-bg2)]">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={o.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-[var(--c-muted)]">
                      이미지 준비 중
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/25 to-transparent opacity-80" />
                  {/* 가격 배지 */}
                  <div className="absolute bottom-2 right-2 rounded-md bg-white/90 px-2 py-0.5 text-xs font-medium shadow-sm">
                    {price}
                  </div>
                </div>

                {/* 본문 */}
                <div className="grid gap-2 p-4">
                  <h3 className="line-clamp-1 text-base font-semibold text-[var(--c-text)] group-hover:text-[var(--c-brand)]">
                    {o.name}
                  </h3>

                  {/* 주소 */}
                  <div className="flex items-center gap-1 text-xs text-[var(--c-muted)]">
                    <span>📍</span>
                    <span className="line-clamp-1">{o.location}</span>
                  </div>

                  {/* 메타: 크기/룸/인원 */}
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-[var(--c-muted)]">
                    {o.size != null && (
                      <span className="rounded border border-[var(--c-card-border)] bg-[var(--c-card-bg)] px-1.5 py-0.5">
                        {o.size}㎡
                      </span>
                    )}
                    {o.roomCount != null && (
                      <span className="rounded border border-[var(--c-card-border)] bg-[var(--c-card-bg)] px-1.5 py-0.5">
                        룸 {o.roomCount}
                      </span>
                    )}
                    {o.maxCount != null && (
                      <span className="rounded border border-[var(--c-card-border)] bg-[var(--c-card-bg)] px-1.5 py-0.5">
                        최대 {o.maxCount}인
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
