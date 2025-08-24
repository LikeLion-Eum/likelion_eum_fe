// src/pages/AiRecommend.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useToast } from "@/components/ToastHost";
import Button from "@/components/Button";

import { Recruitment, fetchRecruitmentsList } from "@/services/recruitment";
import {
  recommendTalentsByRecruitment,
  TalentCandidate,
  recommendIncubationCenters,
  IncubationRec,
} from "@/services/ai";
import {
  recommendSharedOfficesByRegion,
  SharedOffice,
} from "@/services/sharedOffice";
import { sendLoveCall } from "@/services/lovecall";

/* '서울 강남구 역삼동' -> '서울 강남구' (AI/추천 API는 2단계 지역을 기대) */
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

/* 인재 카드 */
function CandidateCard({
  cand,
  onLoveCall,
}: {
  cand: TalentCandidate;
  onLoveCall: (c: TalentCandidate) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <article className="rounded-xl border border-[var(--c-card-border)] p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{cand.name}</div>
        <span className="text-xs rounded-full bg-[var(--c-brand)]/10 px-2 py-0.5 text-[var(--c-brand)]">
          #{cand.rank}
        </span>
      </div>
      <p className="muted text-xs mt-0.5">{cand.career}</p>

      <div className="mt-2 flex flex-wrap gap-2">
        {cand.main_skills?.map((s, i) => (
          <span key={i} className="badge">#{s}</span>
        ))}
      </div>

      {cand.reason && (
        <div className="mt-2">
          <div className="relative">
            <p className={`muted text-sm whitespace-pre-line break-words ${open ? "" : "line-clamp-3"}`}>
              {cand.reason}
            </p>
            {!open && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-white/0" />
            )}
          </div>

          <button
            className="mt-1 text-xs underline text-gray-600"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "이유 접기" : "이유 더보기"}
          </button>
        </div>
      )}

      <div className="mt-3">
        <Button variant="outline" onClick={() => onLoveCall(cand)} size="sm">
          러브콜 보내기
        </Button>
      </div>
    </article>
  );
}

/* 상태 Pill (지원사업) */
function StatusPill({ status }: { status: IncubationRec["status"] }) {
  const cls =
    status === "ongoing"
      ? "bg-blue-50 text-blue-600"
      : status === "closed"
      ? "bg-red-50 text-red-600"
      : status === "always"
      ? "bg-green-50 text-green-600"
      : "bg-gray-50 text-gray-500";
  const label =
    status === "ongoing"
      ? "접수중"
      : status === "closed"
      ? "종료"
      : status === "always"
      ? "상시"
      : "정보없음";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${cls}`}>
      {label}
    </span>
  );
}

/* 지원사업 카드 */
function IncubationCard({ item }: { item: IncubationRec }) {
  const [open, setOpen] = useState(false);
  const clickable = !!item.url;
  const Tag: any = clickable ? "a" : "div";
  const tagProps = clickable
    ? { href: item.url!, target: "_blank", rel: "noopener noreferrer" }
    : {};
  return (
    <li className="rounded-xl border border-[var(--c-card-border)] p-3 transition hover:shadow-md">
      <Tag
        {...tagProps}
        className={`font-medium ${clickable ? "hover:underline" : "opacity-70 cursor-not-allowed"}`}
        onClick={(e: any) => {
          if (!clickable) e.preventDefault();
        }}
      >
        {item.title}
      </Tag>

      <div className="muted text-xs mt-1">
        {item.region} · {item.supportField}
      </div>

      <div className="mt-1 flex items-center gap-2 text-xs">
        <StatusPill status={item.status} />
        <span className="muted">{item.statusText}</span>
      </div>

      {item.reason && (
        <div className="mt-2 text-sm text-gray-700">
          <button className="underline text-gray-600 mb-1" onClick={() => setOpen((v) => !v)}>
            {open ? "이유 닫기" : "왜 추천했나요?"}
          </button>
          {open ? (
            <p className="whitespace-pre-line">{item.reason}</p>
          ) : (
            <p className="line-clamp-2">{item.reason}</p>
          )}
        </div>
      )}

      {clickable && (
        <div className="mt-2">
          <a
            className="inline-block text-[var(--c-brand)] underline text-sm"
            href={item.url!}
            target="_blank"
            rel="noopener noreferrer"
          >
            공고 보기
          </a>
        </div>
      )}
    </li>
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
  const [incubs, setIncubs] = useState<IncubationRec[] | null>(null);
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

  /** 무료 추천: 공유오피스 + 지원사업(AI 정규화) 각 3개 */
  const fetchFree = async () => {
    if (!selected) return;
    try {
      setFreeLoading(true);

      const loc2 = toSiGu(selected.location ?? "");
      const [officeList, programs] = await Promise.all([
        loc2 ? recommendSharedOfficesByRegion(loc2) : Promise.resolve([]),
        recommendIncubationCenters({
          title: selected.title,
          location: selected.location ?? "",
          position: selected.position ?? "",
          skills: selected.skills ?? "",
          career: selected.career ?? "",
          content: selected.content ?? "",
        }),
      ]);

      setOffices((officeList ?? []).slice(0, 3));
      setIncubs((programs ?? []).slice(0, 3));
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
      await new Promise((res) => setTimeout(res, 600)); // 간단 모킹

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

  /** 러브콜 전송 – 실제 POST 호출 */
  const onSendLoveCall = async (cand: TalentCandidate) => {
  if (!selected) return;

  const message = prompt(`"${cand.name}" 님에게 보낼 메시지 입력`);
  if (!message) return;

  try {
    // AI 응답이 userId 또는 profileId 로 올 수 있으니 모두 대비
    const recipient =
      (cand as any).profileId ??
      (cand as any).userId ??
      (cand as any).profile_id;

    if (!recipient) {
      toast.error("후보의 수신자 ID(userId/profileId)를 찾을 수 없어요.");
      console.log("[love-call] candidate object:", cand);
      return;
    }

    console.log("[love-call] send", {
      recruitmentId: selected.id,
      recipientId: recipient,
      message,
    });

    await sendLoveCall({
      recruitmentId: selected.id,
      recipientId: recipient,
      // 해커톤용: 고정 유저라면 senderId: 1 넣어도 됨
      senderId: 1,
      message,
    });

    toast.success("러브콜을 보냈어요!");
  } catch (e: any) {
    const msg =
      e?.response?.data?.error ||
      e?.response?.data?.message ||
      (typeof e?.response?.data === "string" ? e.response.data : "") ||
      e?.message ||
      "러브콜 전송에 실패했어요.";
    toast.error(msg);
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

          {!freeLoading && (!incubs || incubs.length === 0) && (
            <p className="muted text-sm">
              추천 결과가 없습니다. 상단에서 <b>무료 추천 불러오기</b>를 눌러주세요.
            </p>
          )}

          {!freeLoading && !!incubs?.length && (
            <ul className="grid gap-3">
              {incubs.map((p) => (
                <IncubationCard key={`${p.title}-${p.endDateISO ?? p.endDateRaw ?? ""}`} item={p} />
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
              <CandidateCard key={c.rank} cand={c} onLoveCall={onSendLoveCall} />
            ))}
          </div>
        )}
      </section>

      <p className="muted text-xs">
        * 인재 추천은 데모 결제(₩500)로 모킹되어 있습니다. 실제 결제 연동은 이후 단계에서 추가하세요. <br />
        * 추천 품질은 제공한 모집글의 상세도에 비례합니다.
      </p>
    </div>
  );
}
