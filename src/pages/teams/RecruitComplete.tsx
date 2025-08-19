// src/pages/teams/RecruitComplete.tsx
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Button from "@/components/Button";
import { recommendSharedOfficesByRegion, SharedOffice } from "@/services/sharedOffice";

/**
 * TeamForm 제출 완료 후 이동: /teams/complete?loc=충남 아산시
 * - 쿼리 파라미터 loc 로 지역을 전달받아 추천 호출
 * - 추천 카드 노출, 없으면 상태 메시지
 */
export default function RecruitComplete() {
  const loc = useLocation();
  const params = new URLSearchParams(loc.search);
  const queryLoc = params.get("loc") || "";

  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<SharedOffice[]>([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        if (!queryLoc) {
          setList([]);
          setLoading(false);
          return;
        }
        const res = await recommendSharedOfficesByRegion(queryLoc);
        setList(res);
      } catch (e: any) {
        setErr(e?.message || "추천 정보를 불러오지 못했어요.");
      } finally {
        setLoading(false);
      }
    })();
  }, [queryLoc]);

  return (
    <section className="grid gap-6">
      <div className="rounded-3xl border border-[var(--c-card-border)] bg-white p-8 text-center">
        <h1 className="text-2xl font-bold">모집글 등록이 완료되었습니다 🎉</h1>
        <p className="muted mt-2">
          팀 매칭을 기다리는 동안, <b>{queryLoc || "선택 지역"}</b> 근처 공유오피스를 추천해 드려요.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Link to="/teams" className="no-underline">
            <Button variant="outline" className="h-10">모집글 확인하기</Button>
          </Link>
          <Link to="/spaces" className="no-underline">
            <Button className="h-10">공유오피스 보러가기</Button>
          </Link>
        </div>
      </div>

      {/* 추천 리스트 */}
      <div className="rounded-3xl border border-[var(--c-card-border)] bg-gradient-to-b from-white to-[var(--c-bg2)] p-6">
        <h2 className="text-lg font-semibold">추천 공유오피스</h2>

        {loading && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-[var(--c-card-border)] bg-white p-4">
                <div className="skeleton h-36 w-full rounded-xl" />
                <div className="mt-3 space-y-2">
                  <div className="skeleton h-5 w-2/3" />
                  <div className="skeleton h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && err && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
            {err}
          </div>
        )}

        {!loading && !err && list.length === 0 && (
          <p className="muted mt-4">추천 결과가 없습니다. 다른 지역으로도 찾아보세요.</p>
        )}

        {!loading && !err && list.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((s) => (
              <article
                key={s.id}
                className="group rounded-2xl border border-[var(--c-card-border)] bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="relative h-36 w-full overflow-hidden rounded-xl bg-[var(--c-card)]">
                  <div className="absolute inset-0 grid place-items-center text-xs muted">
                    이미지 등록 시 표시됩니다
                  </div>
                </div>
                <h3 className="mt-3 line-clamp-1 text-base font-semibold text-[var(--c-text)] group-hover:text-[var(--c-brand)]">
                  {s.name}
                </h3>
                <p className="muted mt-1 line-clamp-2 text-sm">{s.description}</p>
                <div className="mt-2 text-xs muted">{s.location}</div>
                <div className="mt-3 flex justify-end">
                  <Link to={`/spaces/${s.id}`} className="no-underline">
                    <Button variant="outline" className="h-9">자세히</Button>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
