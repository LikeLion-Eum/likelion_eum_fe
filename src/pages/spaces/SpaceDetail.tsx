import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "@/lib/api";
import Button from "@/components/Button";

declare global {
  interface Window {
    kakao: any;
  }
}

/* =========================
 * Types
 * =======================*/
type SharedOffice = {
  id: number;
  name: string;
  description?: string;
  roomCount?: number;
  size?: number; // ㎡
  location: string; // 주소
  maxCount?: number;
  pricePerMonth?: number;// 월 요금

  // 선택값(있으면 표시)
  landmark?: string; // 예: "강남역 도보 2분"
  amenities?: string[]; // 편의시설 태그

  // 호스트 정보
  hostBusinessName?: string;
  hostRepresentativeName?: string;
  businessRegistrationNumber?: string;
  hostContact?: string; // 전화
};

type PhotoItem = {
  id: number;
  url: string;
  caption?: string;
  isMain?: boolean;
  seq?: number;
};

/* =========================
 * Kakao loader
 * =======================*/
async function ensureKakao(): Promise<any> {
  if (window.kakao?.maps) return window.kakao;
  const key = import.meta.env.VITE_KAKAO_JS_KEY;
  if (!key) throw new Error("VITE_KAKAO_JS_KEY 가 설정되어 있지 않습니다.");

  const id = "kakao-sdk";
  if (!document.getElementById(id)) {
    const s = document.createElement("script");
    s.id = id;
    s.src = `//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${key}&libraries=services`;
    document.head.appendChild(s);
    await new Promise<void>((res, rej) => {
      s.onload = () => window.kakao.maps.load(() => res());
      s.onerror = () => rej(new Error("[Kakao] SDK load error"));
    });
  } else {
    await new Promise<void>((res) => window.kakao.maps.load(() => res()));
  }
  return window.kakao;
}

/* =========================
 * Page
 * =======================*/
export default function SpaceDetail() {
  const { id } = useParams();
  const officeId = Number(id);

  const [space, setSpace] = useState<SharedOffice | null>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  const mapBoxRef = useRef<HTMLDivElement>(null);

  // 메인 표시용 사진 정렬
  const gallery = useMemo(() => {
    if (!photos?.length) return [];
    const sorted = [...photos].sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0));
    // isMain이 있으면 맨 앞으로
    sorted.sort((a, b) => (b.isMain ? 1 : 0) - (a.isMain ? 1 : 0));
    return sorted;
  }, [photos]);

  const activePhoto = gallery[activeIdx];

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [d1, d2] = await Promise.all([
          api.get<SharedOffice>(`/shared-offices/${officeId}`),
          api.get<PhotoItem[]>(`/shared-offices/${officeId}/photos`),
        ]);
        setSpace(d1.data);
        setPhotos(d2.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [officeId]);

  // Kakao Map: 주소 -> 좌표 -> 마커
  useEffect(() => {
    (async () => {
      if (!space?.location || !mapBoxRef.current) return;
      try {
        setMapError(null);
        const kakao = await ensureKakao();
        const geocoder = new kakao.maps.services.Geocoder();
        geocoder.addressSearch(space.location, (result: any[], status: string) => {
          if (status !== kakao.maps.services.Status.OK || !result?.length) {
            setMapError("주소 좌표를 찾지 못했습니다.");
            return;
          }
          const { x, y } = result[0]; // x:lng, y:lat
          const center = new kakao.maps.LatLng(y, x);

          const map = new kakao.maps.Map(mapBoxRef.current, {
            center,
            level: 4,
          });

          const marker = new kakao.maps.Marker({ position: center });
          marker.setMap(map);

          const zc = new kakao.maps.ZoomControl();
          map.addControl(zc, kakao.maps.ControlPosition.RIGHT);
        });
      } catch (e: any) {
        console.error(e);
        setMapError(e.message || "카카오맵 로드 오류");
      }
    })();
  }, [space?.location]);

  if (loading) {
    return (
      <div className="grid gap-6">
        <div className="skeleton h-9 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 grid gap-4">
            <div className="skeleton h-[320px] w-full rounded-2xl" />
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-20 rounded-xl" />
              ))}
            </div>
            <div className="skeleton h-40 w-full rounded-2xl" />
          </div>
          <div className="grid gap-4">
            <div className="skeleton h-40 rounded-2xl" />
            <div className="skeleton h-48 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="rounded-2xl border border-[var(--c-card-border)] bg-white p-8">
        <div className="text-center text-sm text-rose-600">
          공간을 불러오지 못했습니다.
        </div>
      </div>
    );
  }

  const specChip = (label: string, value?: string | number) => (
    <div className="rounded-lg bg-[var(--c-card)] px-3 py-2 text-xs">
      <span className="muted">{label}</span>
      <span className="ml-2 font-medium">{value ?? "-"}</span>
    </div>
  );

  return (
    <div className="grid gap-6">
      {/* 제목 + 이정표 */}
      <header className="rounded-2xl border border-[var(--c-card-border)] bg-white p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{space.name}</h1>
            <p className="muted mt-1 text-sm">{space.location}</p>
            {space.landmark && (
              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-[var(--c-header-border)] bg-white px-3 py-1 text-xs">
                <span className="i-carbon-location" />
                {space.landmark}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Link to={`/spaces/${space.id}/reserve`} className="no-underline">
              <Button className="h-11">예약 신청하기</Button>
            </Link>
            {space.hostContact && (
              <a href={`tel:${space.hostContact}`} className="no-underline">
                <Button variant="outline" className="h-11">
                  전화 문의
                </Button>
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 메인 열 */}
        <section className="lg:col-span-2 grid gap-6">
          {/* 이미지 갤러리 */}
          <div className="rounded-2xl border border-[var(--c-card-border)] bg-white p-3">
            {gallery.length ? (
              <>
                <div className="overflow-hidden rounded-xl">
                  <img
                    src={activePhoto?.url}
                    alt={activePhoto?.caption || space.name}
                    className="h-[320px] w-full object-cover md:h-[420px]"
                    loading="eager"
                  />
                </div>
                {gallery.length > 1 && (
                  <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {gallery.slice(0, 12).map((p, idx) => (
                      <button
                        key={p.id}
                        onClick={() => setActiveIdx(idx)}
                        className={`overflow-hidden rounded-lg ring-1 ring-[var(--c-card-border)] transition ${
                          activeIdx === idx ? "outline outline-2 outline-[var(--c-brand)]" : ""
                        }`}
                        title={p.caption || ""}
                      >
                        <img
                          src={p.url}
                          alt={p.caption || ""}
                          className="h-20 w-full object-cover"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="grid h-[260px] place-items-center rounded-xl bg-[var(--c-card)] text-sm text-[var(--c-text-muted)]">
                사진이 아직 없습니다.
              </div>
            )}
          </div>

          {/* 소개 & 스펙 */}
          <div className="grid gap-4 rounded-2xl border border-[var(--c-card-border)] bg-white p-6">
            <h2 className="text-base font-semibold">공간 소개</h2>
            <p className="whitespace-pre-wrap text-sm text-[var(--c-text)] leading-6">
              {space.description || "소개 글이 아직 등록되지 않았습니다."}
            </p>

            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {specChip("월 요금", space.feeMonthly ? `${space.feeMonthly.toLocaleString()}원` : undefined)}
              {specChip("면적", space.size ? `${space.size}㎡` : undefined)}
              {specChip("방 개수", space.roomCount)}
              {specChip("최대 수용", space.maxCount ? `${space.maxCount}명` : undefined)}
            </div>

            {space.amenities?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {space.amenities.map((a) => (
                  <span
                    key={a}
                    className="rounded-full border border-[var(--c-card-border)] bg-white px-3 py-1 text-xs"
                  >
                    #{a}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {/* 지도 */}
          <div className="grid gap-3 rounded-2xl border border-[var(--c-card-border)] bg-white p-6">
            <h2 className="text-base font-semibold">위치</h2>
            <div
              ref={mapBoxRef}
              className="h-[320px] w-full overflow-hidden rounded-xl border border-[var(--c-card-border)]"
            />
            {mapError && <p className="text-xs text-amber-700">{mapError}</p>}
          </div>
        </section>

        {/* 사이드 열: 호스트/요약/CTA */}
        <aside className="grid gap-6">
          <div className="grid gap-3 rounded-2xl border border-[var(--c-card-border)] bg-white p-6">
            <h3 className="text-sm font-semibold">요금 & 요약</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="muted">월 요금</span>
                <span className="font-semibold">
                  {space.feeMonthly ? `${space.feeMonthly.toLocaleString()}원` : "-"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="muted">최대 수용</span>
                <span className="font-medium">{space.maxCount ? `${space.maxCount}명` : "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="muted">면적</span>
                <span className="font-medium">{space.size ? `${space.size}㎡` : "-"}</span>
              </div>
            </div>
            <Link to={`/spaces/${space.id}/reserve`} className="no-underline">
              <Button className="mt-3 h-11 w-full">예약 신청하기</Button>
            </Link>
          </div>

          <div className="grid gap-3 rounded-2xl border border-[var(--c-card-border)] bg-white p-6">
            <h3 className="text-sm font-semibold">호스트 정보</h3>
            <ul className="grid gap-2 text-sm">
              <li className="flex justify-between">
                <span className="muted">상호</span>
                <span className="font-medium">{space.hostBusinessName ?? "-"}</span>
              </li>
              <li className="flex justify-between">
                <span className="muted">대표자</span>
                <span className="font-medium">{space.hostRepresentativeName ?? "-"}</span>
              </li>
              <li className="flex justify-between">
                <span className="muted">사업자번호</span>
                <span className="font-medium">{space.businessRegistrationNumber ?? "-"}</span>
              </li>
              <li className="flex justify-between">
                <span className="muted">연락처</span>
                <span className="font-medium">{space.hostContact ?? "-"}</span>
              </li>
            </ul>
            {space.hostContact && (
              <a href={`tel:${space.hostContact}`} className="no-underline">
                <Button variant="outline" className="mt-3 h-11 w-full">
                  전화 문의
                </Button>
              </a>
            )}
          </div>
        </aside>
      </div>

      {/* 모바일 하단 고정 CTA */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-[var(--c-card-border)] bg-white/95 p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="flex-1">
            <div className="text-xs muted">월 요금</div>
            <div className="text-base font-semibold">
              {space.feeMonthly ? `${space.feeMonthly.toLocaleString()}원` : "-"}
            </div>
          </div>
          <Link to={`/spaces/${space.id}/reserve`} className="flex-1 no-underline">
            <Button className="h-11 w-full">예약 신청하기</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
