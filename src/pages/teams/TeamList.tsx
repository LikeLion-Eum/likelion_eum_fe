import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "@/components/Button";
import RegionCascadeSelect, { joinLocation } from "@/components/RegionCascadeSelect";
import api from "@/lib/api";

type Recruitment = {
  id: number | string;
  title: string;
  location?: string;     // "서울 강남구" 등
  position?: string;
  skills?: string;
  career?: string;       // "전체|무관|신입|경력"
  recruitCount?: number;
  createdAt?: string;
  isClosed?: boolean;
  author?: string;
  expYearsMin?: number | null;
};

type State = "idle" | "loading" | "ok" | "error";
const PAGE_SIZE = 12;

export default function TeamList() {
  const [state, setState] = useState<State>("idle");
  const [items, setItems] = useState<Recruitment[]>([]);
  const [errMsg, setErrMsg] = useState("");

  const [keyword, setKeyword] = useState("");
  const [region, setRegion] = useState<{ si: string; gu: string }>({ si: "", gu: "" });
  const [career, setCareer] = useState<"all" | "new" | "exp" | "none">("all");
  const [minYears, setMinYears] = useState<number | "">("");

  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        setState("loading");
        const { data } = await api.get<Recruitment[]>("/recruitment/list");
        setItems(Array.isArray(data) ? data : []);
        setState("ok");
      } catch (e: any) {
        setErrMsg(e?.message || "목록을 불러오지 못했습니다.");
        setState("error");
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    const locQuery = joinLocation(region); // "서울 강남구" / "충남 아산시" / ""
    return items.filter((it) => {
      const hay = `${it.title} ${it.position ?? ""} ${it.skills ?? ""} ${it.location ?? ""}`.toLowerCase();
      const okKeyword = k ? k.split(/\s+/).every((w) => hay.includes(w)) : true;
      const okRegion = locQuery ? (it.location || "").includes(locQuery) : true;

      let okCareer = true;
      if (career === "new") okCareer = (it.career || "").includes("신입");
      if (career === "exp") okCareer = (it.career || "").includes("경력");
      if (career === "none") okCareer = (it.career || "").includes("무관") || (it.career || "").includes("전체");

      const okYears =
        career !== "exp" || minYears === ""
          ? true
          : (it as any).expYearsMin != null
            ? Number((it as any).expYearsMin) >= Number(minYears)
            : true;

      return okKeyword && okRegion && okCareer && okYears;
    });
  }, [items, keyword, region, career, minYears]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [keyword, region, career, minYears]);

  return (
    <section className="grid gap-6">
      {/* 헤더 + 검색바 */}
      <div className="rounded-3xl border border-[var(--c-card-border)] bg-gradient-to-b from-white to-[var(--c-bg2)] p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-xl font-bold">모집글 확인하기</h1>
            <p className="muted mt-1 text-sm">지역/경력으로 빠르게 찾기</p>
          </div>
          <Link to="/teams/new" className="no-underline">
            {/* 파란색 테두리 버튼 */}
            <Button variant="outline" className="h-10 border-2">모집글 작성</Button>
          </Link>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="mt-4 grid gap-2">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="제목/직무/기술 (예: 프론트 React 서울)"
              className="h-11 flex-1 rounded-xl border border-[var(--c-card-border)] bg-white px-4 text-sm placeholder:muted focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)]"
            />
            <RegionCascadeSelect value={region} onChange={setRegion} className="sm:ml-2" />
            <Button type="submit" className="h-11 min-w-24">검색</Button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-sm">경력</span>
            <select
              value={career}
              onChange={(e) => setCareer(e.target.value as any)}
              className="h-10 rounded-lg border border-[var(--c-card-border)] bg-white px-3 text-sm"
            >
              <option value="all">전체</option>
              <option value="none">무관</option>
              <option value="new">신입</option>
              <option value="exp">경력</option>
            </select>
            {career === "exp" && (
              <>
                <span className="text-sm">최소 연차</span>
                <input
                  type="number"
                  min={0}
                  value={minYears}
                  onChange={(e) => setMinYears(e.target.value === "" ? "" : Math.max(0, Number(e.target.value) || 0))}
                  placeholder="예: 2"
                  className="h-10 w-24 rounded-lg border border-[var(--c-card-border)] px-3 text-sm"
                />
                <span className="muted text-xs">년 이상</span>
              </>
            )}
          </div>
        </form>
      </div>

      {/* 본문 */}
      {state === "loading" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[var(--c-card-border)] bg-white p-4">
              <div className="skeleton h-5 w-3/4" />
              <div className="mt-3 flex gap-2">
                <div className="skeleton h-4 w-16" />
                <div className="skeleton h-4 w-24" />
                <div className="skeleton h-4 w-12" />
              </div>
            </div>
          ))}
        </div>
      )}

      {state === "error" && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          목록을 불러오는 중 오류가 발생했어요. {errMsg}
        </div>
      )}

      {state === "ok" && (
        <>
          {paged.length === 0 ? (
            <div className="rounded-2xl border border-[var(--c-card-border)] bg-white p-8 text-center">
              <div className="text-sm">조건에 맞는 모집글이 없습니다.</div>
              <div className="muted mt-2 text-xs">검색어/지역/경력 조건을 조정해 보세요.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paged.map((p) => (
                <article
                  key={p.id}
                  className="rounded-2xl border border-[var(--c-card-border)] bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <Link to={`/teams/${p.id}`} className="no-underline">
                    <h3 className="mb-2 line-clamp-2 text-base font-semibold text-[var(--c-text)] hover:brand">
                      {p.title}
                    </h3>
                  </Link>
                  <div className="flex flex-wrap items-center gap-2 text-xs muted">
                    {p.location && <span>📍 {p.location}</span>}
                    {p.position && <span>💼 {p.position}</span>}
                    {p.career && (
                      <span className="rounded-md bg-[var(--c-card)] px-2 py-0.5">
                        {p.career}{p.career.includes("경력") && (p as any).expYearsMin ? `·${(p as any).expYearsMin}+년` : ""}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {filtered.length > PAGE_SIZE && (
            <Pagination page={page} totalPages={totalPages} onPage={setPage} />
          )}
        </>
      )}
    </section>
  );
}

function Pagination({
  page, totalPages, onPage,
}: { page: number; totalPages: number; onPage: (p: number) => void }) {
  const nums = useMemo(() => {
    const arr: (number | "...")[] = [];
    const push = (v: number | "...") => arr.push(v);
    const window = 2;
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) push(i); return arr; }
    push(1);
    const left = Math.max(2, page - window);
    const right = Math.min(totalPages - 1, page + window);
    if (left > 2) push("...");
    for (let i = left; i <= right; i++) push(i);
    if (right < totalPages - 1) push("...");
    push(totalPages);
    return arr;
  }, [page, totalPages]);

  return (
    <nav className="mt-6 flex items-center justify-center gap-2">
      <button
        className="h-9 rounded-lg border border-[var(--c-card-border)] px-3 text-sm disabled:opacity-40"
        onClick={() => onPage(Math.max(1, page - 1))}
        disabled={page <= 1}
      >
        이전
      </button>
      {nums.map((n, i) =>
        n === "..." ? (
          <span key={`d${i}`} className="px-2 text-sm muted">…</span>
        ) : (
          <button
            key={n}
            onClick={() => onPage(n)}
            className={`h-9 min-w-9 rounded-lg border px-3 text-sm ${
              page === n
                ? "border-[var(--c-brand)] bg-[var(--c-brand)] text-white"
                : "border-[var(--c-card-border)] bg-white hover:bg-[var(--c-bg2)]"
            }`}
          >
            {n}
          </button>
        )
      )}
      <button
        className="h-9 rounded-lg border border-[var(--c-card-border)] px-3 text-sm disabled:opacity-40"
        onClick={() => onPage(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
      >
        다음
      </button>
    </nav>
  );
}
