import { useEffect, useMemo, useState } from "react";
import Button from "@/components/Button";
import { fetchProgramsList, IncubationProgram } from "@/services/programs";

const PAGE_SIZE = 12;

/* 날짜 → D-Day 계산 (종료: 음수) */
function getDDay(end?: string) {
  if (!end) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const ed = new Date(end); ed.setHours(0,0,0,0);
  const diff = Math.round((ed.getTime() - today.getTime()) / 86400000);
  if (diff > 0) return `D-${diff}`;
  if (diff === 0) return "D-Day";
  return "종료";
}

/* 스켈레톤 */
function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--c-card-border)] bg-white shadow-sm">
      <div className="skeleton h-24 w-full" />
      <div className="grid gap-2 p-4">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-4 w-2/3" />
      </div>
    </div>
  );
}

export default function ProgramList() {
  // 서버 데이터
  const [programs, setPrograms] = useState<IncubationProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  // 페이지네이션
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // 검색/필터/정렬
  const [q, setQ] = useState("");
  const [recruiting, setRecruiting] = useState<"all" | "open" | "closed">("all");
  const [sort, setSort] = useState<"deadlineAsc" | "deadlineDesc" | "titleAsc">("deadlineAsc");

  const sortParam = useMemo(() => {
    switch (sort) {
      case "deadlineDesc": return ["receiptEndDate,desc"];
      case "titleAsc":     return ["title,asc"];
      default:             return ["receiptEndDate,asc"]; // deadlineAsc
    }
  }, [sort]);

  const recruitingParam = useMemo(() => {
    if (recruiting === "open") return true;
    if (recruiting === "closed") return false;
    return null; // all
  }, [recruiting]);

  async function load(p = page) {
    try {
      setLoading(true);
      setErr("");
      const res = await fetchProgramsList(p, PAGE_SIZE, {
        q,
        recruiting: recruitingParam,
        sort: sortParam,
      });
      setPrograms(res.content);
      setTotalPages(res.totalPages ?? 0);
    } catch (e: any) {
      setErr(e?.response?.data?.error || e?.message || "목록을 불러오지 못했습니다.");
      setPrograms([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }

  // 최초 & 페이지 변경 시
  useEffect(() => { load(page); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [page]);

  // 검색 실행
  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load(1);
  };

  // 초기 로딩 UX 보강을 위한 정렬/상태 텍스트
  const headerHint = useMemo(() => {
    const rs = recruiting === "open" ? "모집중만" : recruiting === "closed" ? "종료만" : "전체";
    const ss = sort === "deadlineAsc" ? "마감 임박 순" : sort === "deadlineDesc" ? "마감 늦은 순" : "제목 오름차순";
    return `${rs} · ${ss}`;
  }, [recruiting, sort]);

  return (
    <section className="grid gap-6">
      {/* 헤더 + 검색바 */}
      <div className="rounded-3xl border border-[var(--c-card-border)] bg-gradient-to-b from-white to-[var(--c-bg2)] p-6 shadow-sm">
        <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h1 className="text-xl font-bold">지원사업·대회</h1>
            <p className="muted mt-1 text-sm">키워드/모집여부/정렬을 설정해 빠르게 찾아보세요. ({headerHint})</p>
          </div>
        </div>

        {/* 검색/필터 바 */}
        <form onSubmit={onSearch} className="mt-4 grid gap-2 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="검색어 (제목/분야/지역/링크에서 부분 일치)"
            className="h-11 rounded-xl border border-[var(--c-card-border)] bg-white px-4 text-sm placeholder:muted focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)]"
          />

          <select
            value={recruiting}
            onChange={(e) => setRecruiting(e.target.value as any)}
            className="h-11 rounded-xl border border-[var(--c-card-border)] bg-white px-3 text-sm"
          >
            <option value="all">모집여부: 전체</option>
            <option value="open">모집중만</option>
            <option value="closed">모집종료만</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="h-11 rounded-xl border border-[var(--c-card-border)] bg-white px-3 text-sm"
          >
            <option value="deadlineAsc">정렬: 마감 임박 순</option>
            <option value="deadlineDesc">정렬: 마감 늦은 순</option>
            <option value="titleAsc">정렬: 제목 A→Z</option>
          </select>

          <div className="flex gap-2">
            <Button className="h-11">검색</Button>
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={() => { setQ(""); setRecruiting("all"); setSort("deadlineAsc"); setPage(1); load(1); }}
            >
              초기화
            </Button>
          </div>
        </form>
      </div>

      {/* 목록 */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : err ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-900">{err}</div>
      ) : programs.length === 0 ? (
        <div className="rounded-2xl border border-[var(--c-card-border)] bg-white p-8 text-center">
          <div className="text-sm">검색 결과가 없습니다.</div>
          <div className="muted mt-2 text-xs">검색어/필터를 조정해 보세요.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => {
            const dday = getDDay(p.receiptEndDate);
            const recruitingBadge = p.recruiting ? (
              <span className="rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">모집중</span>
            ) : (
              <span className="rounded bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700">종료</span>
            );

            return (
              <article
                key={p.id}
                className="group overflow-hidden rounded-2xl border border-[var(--c-card-border)] bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h2 className="line-clamp-2 text-base font-semibold text-[var(--c-text)] group-hover:text-[var(--c-brand)]">
                    {p.title}
                  </h2>
                  {dday && (
                    <span
                      className={`shrink-0 rounded px-2 py-0.5 text-[11px] font-semibold ${
                        dday === "종료"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-[var(--c-brand)]/10 text-[var(--c-brand)]"
                      }`}
                      title={p.receiptEndDate}
                    >
                      {dday}
                    </span>
                  )}
                </div>

                <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-[var(--c-muted)]">
                  {p.region && (
                    <span className="rounded border border-[var(--c-card-border)] bg-[var(--c-card-bg)] px-1.5 py-0.5">
                      {p.region}
                    </span>
                  )}
                  {p.supportField && (
                    <span className="rounded border border-[var(--c-card-border)] bg-[var(--c-card-bg)] px-1.5 py-0.5">
                      {p.supportField}
                    </span>
                  )}
                  {recruitingBadge}
                </div>

                <div className="text-xs text-[var(--c-muted)]">
                  {p.receiptStartDate || "-"} ~ {p.receiptEndDate || "-"}
                </div>

                {p.applyUrl && (
                  <a
                    href={p.applyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex no-underline"
                  >
                    <Button variant="outline" className="h-9 text-sm">지원하기</Button>
                  </a>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* 페이지네이션 */}
      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={(p) => setPage(p)}
      />
    </section>
  );
}

/* --- 깔끔한 페이지네이션 --- */
function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void; }) {
  if (!totalPages || totalPages <= 1) return null;

  const nums = getPageNumbers(page, totalPages);

  return (
    <div className="mt-4 flex justify-center gap-2">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="rounded-lg border border-[var(--c-card-border)] bg-white px-3 py-1 text-sm disabled:opacity-50"
      >
        이전
      </button>

      {nums.map((n, i) =>
        n === "…" ? (
          <span key={`e-${i}`} className="px-2 text-sm text-[var(--c-muted)]">…</span>
        ) : (
          <button
            key={n}
            onClick={() => onChange(n as number)}
            className={`rounded-lg px-3 py-1 text-sm ${
              n === page
                ? "bg-[var(--c-brand)] text-white"
                : "border border-[var(--c-card-border)] bg-white"
            }`}
          >
            {n}
          </button>
        )
      )}

      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="rounded-lg border border-[var(--c-card-border)] bg-white px-3 py-1 text-sm disabled:opacity-50"
      >
        다음
      </button>
    </div>
  );
}

function getPageNumbers(cur: number, total: number) {
  const out: (number | "…")[] = [];
  const push = (n: number | "…") => out.push(n);
  const range = (a: number, b: number) => { for (let i = a; i <= b; i++) push(i); };

  if (total <= 7) { range(1, total); return out; }

  const left = Math.max(2, cur - 1);
  const right = Math.min(total - 1, cur + 1);

  push(1);
  if (left > 2) push("…");
  range(left, right);
  if (right < total - 1) push("…");
  push(total);

  return out;
}
