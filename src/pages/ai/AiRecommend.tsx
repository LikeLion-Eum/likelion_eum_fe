import { sendLoveCall } from "@/services/loveCall";
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
    <span className="inline-flex items-center rounded-full border border-[var(--c-card-border)] bg-white px-2.5 py-1 text-xs text-gray-700">
      {children}
    </span>
  );
}

/* 스켈레톤 카드 */
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-[var(--c-card-border)] bg-white p-4 shadow-sm">
      <div className="h-36 w-full animate-pulse rounded-lg bg-gray-200/80" />
      <div className="mt-3 space-y-2">
        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200/80" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200/80" />
      </div>
    </div>
  );
}

/* 썸네일 placeholder */
function Thumb({ alt }: { alt: string }) {
  return (
    <div className="relative h-36 w-full overflow-hidden rounded-lg bg-[var(--c-bg2)]">
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

      setOffices((officeList ?? []).slice(0, 3));
      setProgs((programs ?? []).slice(0, 3));
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

      const list = await recommendTalentsByRecruitment({
        id: selected.id,
        title: selected.title,
        location: toSiGu(selected.location ?? ""),
        position: selected.position ?? "",
        skills: selected.skills ?? "",
        career: selected.career ?? "",
        content: selected.content ?? "",
      });

      setCandidates((list ?? []).slice(0, 3));
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

    const message =
      prompt(`"${cand.name}" 님에게 보낼 메시지를 입력하세요.`) ?? "";
    if (!message.trim()) return;

    try {
      await sendLoveCall(selected.id, { message });
      toast.success("러브콜을 보냈어요!");
    } catch (e: any) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.message ||
        "러브콜 전송에 실패했어요.";
      toast.error(msg);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl grid gap-6 p-4 md:p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl grid gap-6 p-4 md:p-6">
      {/* 헤더 */}
      <section className="rounded-3xl border border-[var(--c-card-border)] bg-gradient-to-b from-white to-[var(--c-bg2)] p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 h-1.5 w-12 rounded-full bg-[var(--c-cta)]" />
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">AI 추천</h1>
            <p className="mt-1 text-sm text-gray-600">
              내 모집글에 맞춘 <b>공유오피스/지원사업(무료)</b>과 <b>인재 3명(₩500)</b>을 한 번에.
            </p>
          </div>
          <Link to="/teams/new" className="no-underline">
            <Button variant="outline">모집글 작성</Button>
          </Link>
        </div>

        {/* 모집글 선택 */}
        <div className="mt-4 grid gap-2 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <label className="text-xs text-[var(--c-text-muted)]">내 모집글 선택</label>
            <select
              value={selectedId ?? undefined}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              className="mt-1 h-11 w-full rounded-xl border border-[var(--c-card-border)] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c-cta)]/50"
            >
              {recs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={fetchFree}
              disabled={!selected || freeLoading}
              className="h-11"
            >
              {freeLoading ? "불러오는 중…" : "무료 추천 불러오기"}
            </Button>
            <Button onClick={payAndFetchAI} disabled={!selected || paying} className="h-11">
              {paying ? "결제 중…" : "₩500 결제하고 AI 인재 3명 보기"}
            </Button>
          </div>
        </div>

        {/* 모집글 요약 */}
        {selected && (
          <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-[var(--c-card-border)]">
            <div className="text-sm font-medium text-gray-900">{selected.title}</div>
            <div className="mt-1 flex flex-wrap gap-3 text-xs text-[var(--c-text-muted)]">
              <span>지역: {selected.location || "-"}</span>
              <span>직무: {selected.position || "-"}</span>
              <span>기술: {selected.skills || "-"}</span>
              <span>경력: {selected.career || "-"}</span>
            </div>
            {selected.content && (
              <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm text-[var(--c-text-muted)]">
                {selected.content}
              </p>
            )}
          </div>
        )}
      </section>

      {/* 무료 추천: 공유오피스 & 지원사업 */}
      <section className="grid gap-4 md:grid-cols-2">
        {/* 공유오피스 */}
        <div className="rounded-3xl border border-[var(--c-card-border)] bg-white p-5">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-1.5 w-8 rounded-full bg-[var(--c-cta)]" />
              <h2 className="text-lg font-semibold text-gray-900">공유오피스 추천</h2>
            </div>
            {selected?.location && (
              <span className="text-xs text-[var(--c-text-muted)]">기준 지역: {toSiGu(selected.location)}</span>
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
            <p className="text-sm text-[var(--c-text-muted)]">
              추천 결과가 없습니다. 상단에서 <b>무료 추천 불러오기</b>를 눌러주세요.
            </p>
          )}

          {!freeLoading && !!offices?.length && (
            <ul className="grid gap-3">
              {offices.map((o) => (
                <li
                  key={o.id}
                  className="group rounded-2xl border border-[var(--c-card-border)] bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)]"
                >
                  <Thumb alt={`${o.name} 썸네일`} />
                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-[15px] font-semibold text-gray-900">{o.name}</div>
                      <div className="mt-0.5 truncate text-xs text-[var(--c-text-muted)]">{o.location}</div>
                    </div>
                    <Link to={`/spaces/${o.id}`} className="no-underline shrink-0">
                      <Button variant="outline" size="sm">
                        바로가기
                      </Button>
                    </Link>
                  </div>
                  {o.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-[var(--c-text-muted)]">{o.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {o.roomCount != null && <Badge>공간 {o.roomCount}개</Badge>}
                    {o.size != null && <Badge>면적 {o.size}㎡</Badge>}
                    {o.maxCount != null && <Badge>최대 {o.maxCount}명</Badge>}
                  </div>
                  <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent transition group-hover:ring-[var(--c-brand)]/25" />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 지원사업 */}
        <div className="rounded-3xl border border-[var(--c-card-border)] bg-white p-5">
          <div className="mb-2 flex items-center gap-3">
            <span className="h-1.5 w-8 rounded-full bg-[var(--c-cta)]" />
            <h2 className="text-lg font-semibold text-gray-900">지원사업·대회 추천</h2>
          </div>

          {freeLoading && (
            <div className="grid gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {!freeLoading && (!progs || progs.length === 0) && (
            <p className="text-sm text-[var(--c-text-muted)]">
              추천 결과가 없습니다. 상단에서 <b>무료 추천 불러오기</b>를 눌러주세요.
            </p>
          )}

          {!freeLoading && !!progs?.length && (
            <ul className="grid gap-3">
              {progs.map((p) => (
                <li
                  key={p.id}
                  className="group rounded-2xl border border-[var(--c-card-border)] bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)]"
                >
                  <div className="text-[15px] font-semibold text-gray-900">{p.title}</div>
                  <div className="mt-1 text-xs text-[var(--c-text-muted)]">
                    {p.region ?? ""} · {p.supportField ?? ""}
                  </div>
                  <div className="mt-1 text-xs text-[var(--c-text-muted)]">
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
                  <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent transition group-hover:ring-[var(--c-brand)]/25" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* 유료: AI 인재 3명 */}
      <section className="rounded-3xl border border-[var(--c-card-border)] bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-8 rounded-full bg-[var(--c-cta)]" />
            <h2 className="text-lg font-semibold text-gray-900">AI 인재 추천 (3명)</h2>
          </div>
          <Button onClick={payAndFetchAI} disabled={!selected || paying}>
            {paying ? "결제 중…" : "₩500 결제하고 보기"}
          </Button>
        </div>

        {!candidates && (
          <p className="text-sm text-[var(--c-text-muted)]">결제 후 인재 리스트가 표시됩니다.</p>
        )}

        {!!candidates?.length && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {candidates.map((c) => (
              <article
                key={c.rank}
                className="group rounded-2xl border border-[var(--c-card-border)] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)]"
              >
                <div className="flex items-center justify-between">
                  <div className="truncate font-semibold text-gray-900">{c.name}</div>
                  <span className="rounded-full bg-[var(--c-brand)]/10 px-2 py-0.5 text-xs text-[var(--c-brand)]">
                    #{c.rank}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-[var(--c-text-muted)]">{c.career}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {c.main_skills?.map((s, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-full border border-[var(--c-card-border)] bg-white px-2 py-0.5 text-[11px] text-gray-700"
                    >
                      #{s}
                    </span>
                  ))}
                </div>
                {c.reason && (
                  <p className="mt-2 line-clamp-3 text-sm text-[var(--c-text-muted)]">{c.reason}</p>
                )}
                <div className="mt-3">
                  <Button variant="outline" onClick={() => onSendLoveCall(c)} size="sm">
                    러브콜 보내기
                  </Button>
                </div>
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent transition group-hover:ring-[var(--c-brand)]/25" />
              </article>
            ))}
          </div>
        )}
      </section>

      <p className="text-xs text-[var(--c-text-muted)]">
        * 인재 추천은 데모 결제(₩500)로 모킹되어 있습니다. 실제 결제(토스/페이먼츠) 연동은 이후 단계에서 추가하세요. <br />
        * 추천 품질은 제공한 모집글의 상세도에 비례합니다.
      </p>
    </div>
  );
}
