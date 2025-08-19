import { useEffect, useMemo, useState } from "react";
import { Recruitment, fetchRecruitmentsList } from "@/services/recruitment";
import { recommendTalentsByRecruitment, TalentCandidate } from "@/services/ai";
import { recommendSharedOfficesByLocation, SharedOffice } from "@/services/sharedOffice";
import { recommendPrograms, IncubationProgram } from "@/services/programs";
import { useToast } from "@/components/ToastHost";
import Button from "@/components/Button";
import { Link } from "react-router-dom";

/* 유틸: '서울 강남구' 처럼 2단계까지만 추출 */
function toSiGu(loc?: string) {
  if (!loc) return "";
  const bits = loc.split(/\s+/).filter(Boolean);
  return bits.slice(0, 2).join(" ");
}

export default function AiRecommend() {
  const toast = useToast();
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

  useEffect(() => {
    (async () => {
      try {
        const list = await fetchRecruitmentsList();
        setRecs(list);
        if (list.length) setSelectedId(list[0].id);
      } catch (e) {
        toast.error("모집글 목록을 불러오지 못했어요.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /** 무료 추천 조회 */
  const fetchFree = async () => {
    if (!selected) return;
    try {
      setFreeLoading(true);
      const loc2 = toSiGu(selected.location ?? undefined);
      const [o, p] = await Promise.all([
        loc2 ? recommendSharedOfficesByLocation(loc2) : Promise.resolve([]),
        recommendPrograms({
          title: selected.title,
          location: selected.location ?? "",
          position: selected.position ?? "",
          skills: selected.skills ?? "",
          career: selected.career ?? "",
          content: selected.content ?? "",
        }),
      ]);
      setOffices(o);
      setProgs(p);
      toast.success("추천을 불러왔어요.");
    } catch (e) {
      toast.error("추천을 불러올 수 없어요.");
    } finally {
      setFreeLoading(false);
    }
  };

  /** 결제 + AI 후보 조회 (결제는 데모 모킹) */
  const payAndFetchAI = async () => {
    if (!selected) return;
    try {
      setPaying(true);
      // 데모 결제 모킹(500원)
      await new Promise((res) => setTimeout(res, 900));
      const list = await recommendTalentsByRecruitment(selected);
      setCandidates(list);
      toast.success("AI 인재 10명을 추천했어요!");
    } catch (e) {
      toast.error("AI 추천을 불러오지 못했어요.");
    } finally {
      setPaying(false);
    }
  };

  const onSendLoveCall = async (cand: TalentCandidate) => {
    if (!selected) return;
    const message = prompt(`"${cand.name}" 님에게 보낼 메시지 입력`);
    if (!message) return;
    try {
      // 실제 연동 시 services/lovecall.sendLoveCall 호출
      // await sendLoveCall({ fromPostId: selected.id, toProfileId: cand.profileId, toName: cand.name, message });
      await new Promise((r) => setTimeout(r, 400)); // 데모
      toast.success("러브콜을 보냈어요!");
    } catch {
      toast.error("러브콜 전송에 실패했어요.");
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-6xl p-6">불러오는 중…</div>;
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 grid gap-6">
      {/* 헤드 */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI 추천</h1>
          <p className="muted text-sm">
            내 모집글을 선택하면, 무료 추천(공유오피스/지원사업)과 유료 추천(인재 10명)을 한 번에!
          </p>
        </div>
        <Link to="/teams/new" className="no-underline">
          <Button variant="outline">모집글 작성</Button>
        </Link>
      </div>

      {/* Step 1. 모집글 선택 */}
      <section className="rounded-2xl border border-[var(--c-card-border)] bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <label className="text-xs muted">내 모집글 선택</label>
            <select
              value={selectedId ?? undefined}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-[var(--c-card-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)]"
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
              무료 추천 불러오기
            </Button>
            <Button onClick={payAndFetchAI} disabled={!selected || paying}>
              {paying ? "결제 중…" : "₩500 결제하고 AI 인재 10명 보기"}
            </Button>
          </div>
        </div>

        {/* 선택한 모집글 요약 */}
        {selected && (
          <div className="mt-4 grid gap-2 text-sm">
            <div className="flex flex-wrap gap-3 muted">
              <span>지역: {selected.location || "-"}</span>
              <span>직무: {selected.position || "-"}</span>
              <span>기술: {selected.skills || "-"}</span>
              <span>경력: {selected.career || "-"}</span>
            </div>
            {selected.content && (
              <p className="line-clamp-2 whitespace-pre-wrap">{selected.content}</p>
            )}
          </div>
        )}
      </section>

      {/* Step 2. 무료 추천 */}
      <section className="grid gap-4 md:grid-cols-2">
        {/* 공유오피스 */}
        <div className="rounded-2xl border border-[var(--c-card-border)] bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">공유오피스 추천</h2>
            {selected?.location && (
              <span className="muted text-xs">기준 지역: {toSiGu(selected.location ?? undefined)}</span>
            )}
          </div>

          {freeLoading && <p className="muted">불러오는 중…</p>}
          {!freeLoading && (!offices || offices.length === 0) && (
            <p className="muted text-sm">추천 결과가 없습니다. (위에서 “무료 추천 불러오기”를 눌러주세요)</p>
          )}
          {!freeLoading && !!offices?.length && (
            <ul className="grid gap-3">
              {offices.map((o) => (
                <li key={o.id} className="rounded-xl border border-[var(--c-card-border)] p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{o.name}</div>
                      <div className="muted text-xs mt-0.5">{o.location}</div>
                    </div>
                    <Link to={`/spaces/${o.id}`} className="no-underline">
                      <Button variant="outline" size="sm">바로가기</Button>
                    </Link>
                  </div>
                  {o.description && (
                    <p className="muted mt-2 text-sm line-clamp-2">{o.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2 text-xs muted">
                    {o.roomCount != null && <span>공간 {o.roomCount}개</span>}
                    {o.size != null && <span>면적 {o.size}㎡</span>}
                    {o.maxCount != null && <span>최대 {o.maxCount}명</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 지원사업 */}
        <div className="rounded-2xl border border-[var(--c-card-border)] bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">지원사업·대회 추천</h2>
          </div>

          {freeLoading && <p className="muted">불러오는 중…</p>}
          {!freeLoading && (!progs || progs.length === 0) && (
            <p className="muted text-sm">추천 결과가 없습니다. (위에서 “무료 추천 불러오기”를 눌러주세요)</p>
          )}
          {!freeLoading && !!progs?.length && (
            <ul className="grid gap-3">
              {progs.map((p) => (
                <li key={p.id} className="rounded-xl border border-[var(--c-card-border)] p-3">
                  <div className="font-medium">{p.title}</div>
                  <div className="muted text-xs mt-1">
                    {p.region ?? ""} · {p.supportField ?? ""}
                  </div>
                  <div className="muted text-xs mt-1">
                    {p.receiptStartDate} ~ {p.receiptEndDate}
                    {p.recruiting ? " · 모집중" : " · 종료"}
                  </div>
                  {!!p.applyUrl && (
                    <a href={p.applyUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[var(--c-brand)] underline">
                      공고 보기
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Step 3. AI 인재 10명 (유료) */}
      <section className="rounded-2xl border border-[var(--c-card-border)] bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">AI 인재 추천 (10명)</h2>
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
              <article key={c.rank} className="rounded-xl border border-[var(--c-card-border)] p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{c.name}</div>
                  <span className="text-xs rounded-full bg-[var(--c-brand)]/10 px-2 py-0.5 text-[var(--c-brand)]">#{c.rank}</span>
                </div>
                <p className="muted text-xs mt-0.5">{c.career}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {c.main_skills?.map((s, i) => (
                    <span key={i} className="badge">#{s}</span>
                  ))}
                </div>
                {c.reason && <p className="muted text-sm mt-2 line-clamp-3">{c.reason}</p>}
                <div className="mt-3">
                  <Button variant="outline" onClick={() => onSendLoveCall(c)} size="sm">러브콜 보내기</Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <p className="muted text-xs">
        * 인재 추천은 데모 결제(₩500)로 모킹되어 있습니다. 실제 결제 연동(토스/페이먼츠)은 이후 단계에서 추가하세요.  
        * 추천 품질은 제공하신 모집글의 상세도에 비례합니다.
      </p>
    </div>
  );
}
