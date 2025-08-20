import { useEffect, useMemo, useState } from "react";
import { Recruitment, fetchRecruitmentsList } from "@/services/recruitment";
import {
  recommendTalentsByRecruitment,
  TalentCandidate,
} from "@/services/ai";
import {
  recommendSharedOfficesByRegion,
  SharedOffice,
} from "@/services/sharedOffice";
import { recommendPrograms, IncubationProgram } from "@/services/programs";
import { useToast } from "@/components/ToastHost";
import Button from "@/components/Button";
import { Link } from "react-router-dom";

/* '서울 강남구 역삼동' -> '서울 강남구' (API는 2단계 지역을 기대) */
function toSiGu(loc?: string | null) {
  if (!loc) return "";
  const bits = loc.split(/\s+/).filter(Boolean);
  return bits.slice(0, 2).join(" ");
}

/* 뱃지 */
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--c-card-border)] bg-[var(--c-card)] px-2.5 py-1 text-xs text-[var(--c-text-muted)]">
      {children}
    </span>
  );
}

/* 스켈레톤 카드 */
function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[var(--c-card-border)] bg-white p-4 shadow-sm">
      <div className="skeleton h-36 w-full rounded-lg" />
      <div className="mt-3 space-y-2">
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

/* 썸네일 placeholder */
function Thumb({ alt }: { alt: string }) {
  return (
    <div className="relative h-36 w-full overflow-hidden rounded-lg bg-[var(--c-card)]">
      <div className="absolute inset-0 grid place-items-center text-[11px] text-[var(--c-text-muted)]">
        이미지 등록 시 표시됩니다
      </div>
      <span className="sr-only">{alt}</span>
    </div>
  );
}

export default function AiRecommend() {
  const toast = useToast();

  // 내 모집글
  const [loading, setLoading] = useState(true);
  const [recs, setRecs] = useState<Recruitment[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // 무료 추천
  const [offices, setOffices] = useState<SharedOffice[] | null>(null);
  const [progs, setProgs] = useState<IncubationProgram[] | null>(null);
  const [freeLoading, setFreeLoading] = useState(false);

  // 유료 추천(인재)
  const [candidates, setCandidates] = useState<TalentCandidate[] | null>(null);
  const [paying, setPaying] = useState(false);

  const selected = useMemo(
    () => recs.find((r) => r.id === selectedId) || null,
    [recs, selectedId]
  );

  /* 최초 – 내 모집글 목록 */
  useEffect(() => {
    (async () => {
      try {
        const list = await fetchRecruitmentsList();
        setRecs(list);
        if (list.length) setSelectedId(list[0].id);
      } catch {
        toast.error("모집글 목록을 불러오지 못했어요.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /** 무료 추천: 공유오피스(전용 API) + 지원사업 (각 3개) */
  const fetchFree = async () => {
    if (!selected) return;
    try {
      setFreeLoading(true);

      const loc2 = toSiGu(selected.location ?? "");
      const [officeList, programs] = await Promise.all([
        // ✅ 전용 추천 API 사용 (POST /api/shared-offices/recommend { location })
        loc2 ? recommendSharedOfficesByRegion(loc2) : Promise.resolve([]),
        recommendPrograms({
          title: selected.title,
          location: selected.location ?? "",
          position: selected.position ?? "",
          skills: selected.skills ?? "",
          career: selected.career ?? "",
          content: selected.content ?? "",
        }),
      ]);

      setOffices((officeList ?? []).slice(0, 3)); // 공유오피스 3개
      setProgs((programs ?? []).slice(0, 3)); // 지원사업 3개
      toast.success("무료 추천을 불러왔어요.");
    } catch {
      toast.error("추천을 불러올 수 없어요.");
    } finally {
      setFreeLoading(false);
    }
  };

  /** 결제 모킹 + 인재 추천 호출 (3명만 노출) */
  const payAndFetchAI = async () => {
    if (!selected) return;
    try {
      setPaying(true);
      await new Promise((res) => setTimeout(res, 900)); // 결제 모킹

      // ✅ id 포함 + toSiGu 적용 + flat body에 맞춤
      const list = await recommendTalentsByRecruitment({
        id: selected.id,
        title: selected.title,
        location: toSiGu(selected.location ?? ""),
        position: selected.position ?? "",
        skills: selected.skills ?? "",
        career: selected.career ?? "",
        content: selected.content ?? "",
      });

      setCandidates((list ?? []).slice(0, 3)); // 인재 3명
      toast.success("AI 인재 3명을 추천했어요!");
    } catch (e: any) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        (typeof e?.response?.data === "string" ? e.response.data : "") ||
        e?.message ||
        "AI 추천을 불러오지 못했어요.";
      toast.error(msg);
    } finally {
      setPaying(false);
    }
  };

  const onSendLoveCall = async (cand: TalentCandidate) => {
    if (!selected) return;
    const message = prompt(`"${cand.name}" 님에게 보낼 메시지 입력`);
    if (!message) return;
    try {
      // TODO: 실제 연동 시 services/lovecall.sendLoveCall(...)
      await new Promise((r) => setTimeout(r, 400)); // 데모
      toast.success("러브콜을 보냈어요!");
    } catch {
      toast.error("러브콜 전송에 실패했어요.");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-4 md:p-6 grid gap-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 grid gap-6">
      {/* 헤더 */}
      <section className="rounded-2xl border border-[var(--c-card-border)] bg-white p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI 추천</h1>
            <p className="muted text-sm">
              내 모집글에 맞춘 <b>공유오피스/지원사업(무료)</b>과{" "}
              <b>인재 3명(₩500)</b>을 한 번에.
            </p>
          </div>
          <Link to="/teams/new" className="no-underline">
            <Button variant="outline">모집글 작성</Button>
          </Link>
        </div>

        {/* 모집글 선택 */}
        <div className="mt-4 grid gap-2 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <label className="text-xs muted">내 모집글 선택</label>
            <select
              value={selectedId ?? undefined}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-[var(--c-card-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)]"
            >
              {recs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchFree} disabled={!selected || freeLoading}>
              {freeLoading ? "불러오는 중…" : "무료 추천 불러오기"}
            </Button>
            <Button onClick={payAndFetchAI} disabled={!selected || paying}>
              {paying ? "결제 중…" : "₩500 결제하고 AI 인재 3명 보기"}
            </Button>
          </div>
        </div>

        {/* 모집글 요약 */}
        {selected && (
          <div className="mt-4 rounded-lg bg-[var(--c-card)] p-3">
            <div className="text-sm font-medium">{selected.title}</div>
            <div className="mt-1 flex flex-wrap gap-3 text-xs muted">
              <span>지역: {selected.location || "-"}</span>
              <span>직무: {selected.position || "-"}</span>
              <span>기술: {selected.skills || "-"}</span>
              <span>경력: {selected.career || "-"}</span>
            </div>
            {selected.content && (
              <p className="muted mt-2 text-sm line-clamp-3 whitespace-pre-wrap">
                {selected.content}
              </p>
            )}
          </div>
        )}
      </section>

      {/* 무료 추천: 공유오피스 & 지원사업 */}
      <section className="grid gap-4 md:grid-cols-2">
        {/* 공유오피스 */}
        <div className="rounded-2xl border border-[var(--c-card-border)] bg-white p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">공유오피스 추천</h2>
            {selected?.location && (
              <span className="muted text-xs">기준 지역: {toSiGu(selected.location)}</span>
            )}
          </div>

          {freeLoading && (
            <div className="grid gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {!freeLoading && (!offices || offices.length === 0) && (
            <p className="muted text-sm">
              추천 결과가 없습니다. 상단에서 <b>무료 추천 불러오기</b>를 눌러주세요.
            </p>
          )}

          {!freeLoading && !!offices?.length && (
            <ul className="grid gap-3">
              {offices.map((o) => (
                <li
                  key={o.id}
                  className="rounded-xl border border-[var(--c-card-border)] p-3 transition hover:shadow-md"
                >
                  <Thumb alt={`${o.name} 썸네일`} />
                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium">{o.name}</div>
                      <div className="muted text-xs mt-0.5">{o.location}</div>
                    </div>
                    <Link to={`/spaces/${o.id}`} className="no-underline shrink-0">
                      <Button variant="outline" size="sm">
                        바로가기
                      </Button>
                    </Link>
                  </div>
                  {o.description && (
                    <p className="muted mt-2 text-sm line-clamp-2">{o.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {o.roomCount != null && <Badge>공간 {o.roomCount}개</Badge>}
                    {o.size != null && <Badge>면적 {o.size}㎡</Badge>}
                    {o.maxCount != null && <Badge>최대 {o.maxCount}명</Badge>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 지원사업 */}
        <div className="rounded-2xl border border-[var(--c-card-border)] bg-white p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">지원사업·대회 추천</h2>
          </div>

          {freeLoading && (
            <div className="grid gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {!freeLoading && (!progs || progs.length === 0) && (
            <p className="muted text-sm">
              추천 결과가 없습니다. 상단에서 <b>무료 추천 불러오기</b>를 눌러주세요.
            </p>
          )}

          {!freeLoading && !!progs?.length && (
            <ul className="grid gap-3">
              {progs.map((p) => (
                <li
                  key={p.id}
                  className="rounded-xl border border-[var(--c-card-border)] p-3 transition hover:shadow-md"
                >
                  <div className="font-medium">{p.title}</div>
                  <div className="muted text-xs mt-1">
                    {p.region ?? ""} · {p.supportField ?? ""}
                  </div>
                  <div className="muted text-xs mt-1">
                    {p.receiptStartDate} ~ {p.receiptEndDate}
                    {p.recruiting ? " · 모집중" : " · 종료"}
                  </div>
                  {!!p.applyUrl && (
                    <a
                      href={p.applyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-[var(--c-brand)] underline"
                    >
                      공고 보기
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* 유료: AI 인재 3명 */}
      <section className="rounded-2xl border border-[var(--c-card-border)] bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">AI 인재 추천 (3명)</h2>
          <Button onClick={payAndFetchAI} disabled={!selected || paying}>
            {paying ? "결제 중…" : "₩500 결제하고 보기"}
          </Button>
        </div>

        {!candidates && (
          <p className="muted text-sm">결제 후 인재 리스트가 표시됩니다.</p>
        )}

        {!!candidates?.length && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {candidates.map((c) => (
              <article
                key={c.rank}
                className="rounded-xl border border-[var(--c-card-border)] p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{c.name}</div>
                  <span className="text-xs rounded-full bg-[var(--c-brand)]/10 px-2 py-0.5 text-[var(--c-brand)]">
                    #{c.rank}
                  </span>
                </div>
                <p className="muted text-xs mt-0.5">{c.career}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {c.main_skills?.map((s, i) => (
                    <span key={i} className="badge">
                      #{s}
                    </span>
                  ))}
                </div>
                {c.reason && (
                  <p className="muted text-sm mt-2 line-clamp-3">{c.reason}</p>
                )}
                <div className="mt-3">
                  <Button variant="outline" onClick={() => onSendLoveCall(c)} size="sm">
                    러브콜 보내기
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <p className="muted text-xs">
        * 인재 추천은 데모 결제(₩500)로 모킹되어 있습니다. 실제 결제(토스/페이먼츠) 연동은 이후 단계에서 추가하세요. <br />
        * 추천 품질은 제공한 모집글의 상세도에 비례합니다.
      </p>
    </div>
  );
}
