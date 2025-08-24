import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import ImageSlider from "@/components/ImageSlider";
import Button from "@/components/Button";
import api from "@/lib/api";
import { toList } from "@/lib/list";

/* ---------- 타입 ---------- */
type Post = {
  id: string;
  title: string;
  region?: { si?: string; gu?: string };
  author?: string;
  exp?: string;
  expType?: string;
  minYears?: number | null;
  skills?: string[];
  deadline?: string | null;   // YYYY-MM-DD 권장
  alwaysOpen?: boolean;
  content?: string;
  /** ▼ API가 내려주면 사용 */
  isClosed?: boolean;
};

type Program = {
  id: string;
  title: string;
  provider?: string;
  deadline?: string | null;   // YYYY-MM-DD 권장
  deadlineAt?: string;
  applyUrl?: string | null;   // 외부 신청 링크
};

/* ---------- 텍스트 유틸 ---------- */
const stripHtml = (s?: string) =>
  (s ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const excerpt = (s?: string, max = 120) => {
  const t = stripHtml(s);
  return t.length > max ? t.slice(0, max) + "…" : t;
};

/* ---------- 폴백(데모) 데이터 ---------- */
const FALLBACK_POSTS: Post[] = [
  { id: "f1", title: "초기 SaaS 팀, 프론트엔드(Next.js) 구해요", region: { si: "서울", gu: "강남구" }, author: "jay", expType: "경력", minYears: 1 },
  { id: "f2", title: "로컬 커머스 기획자 모십니다", region: { si: "부산", gu: "해운대구" }, author: "mina", expType: "무관" },
  { id: "f3", title: "대학생 연합 창업동아리 12기", region: { si: "대전" }, author: "union", expType: "신입" },
];

const FALLBACK_PROGRAMS: Program[] = [
  { id: "p1", title: "[서울] 청년창업 지원금 2차", provider: "서울시", deadlineAt: "D-3", applyUrl: "https://example.com/a" },
  { id: "p2", title: "스타트업 IR 경진대회", provider: "중기부", deadlineAt: "D-5", applyUrl: "https://example.com/b" },
  { id: "p3", title: "예비창업패키지 추가 모집", provider: "창진원", deadlineAt: "D-10", applyUrl: "https://example.com/c" },
];

/* ---------- 유틸 ---------- */
function normalizeList<T>(raw: any): T[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as T[];
  if (Array.isArray(raw.items)) return raw.items as T[];
  if (Array.isArray(raw.list)) return raw.list as T[];
  if (Array.isArray(raw.rows)) return raw.rows as T[];
  if (raw.data && Array.isArray(raw.data)) return raw.data as T[];
  return toList<T>(raw);
}

const fmtRegion = (r?: { si?: string; gu?: string }) => {
  if (!r || (!r.si && !r.gu)) return "전국";
  if (r.si && !r.gu) return r.si;
  return `${r.si ?? ""}${r.gu ? ` / ${r.gu}` : ""}`;
};

const fmtExp = (p: Post) => {
  const t = p.expType ?? p.exp ?? "";
  if (t === "경력") return `경력${p.minYears ? ` ${p.minYears}년+` : ""}`;
  if (t === "신입") return "신입";
  if (t === "무관") return "경력 무관";
  return t || "-";
};

/* ===== D-Day 계산(현지 자정 기준, 날짜만 비교) ===== */
const parseYMDLocal = (s?: string | null): Date | null => {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (!m) return new Date(s);
  const y = +m[1], mon = +m[2] - 1, d = +m[3];
  return new Date(y, mon, d);
};

const diffDaysLocal = (dateStr?: string | null): number | null => {
  const tgt = parseYMDLocal(dateStr);
  if (!tgt) return null;
  const now = new Date();
  const a = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const b = new Date(tgt.getFullYear(), tgt.getMonth(), tgt.getDate());
  const DAY = 24 * 60 * 60 * 1000;
  return Math.floor((b.getTime() - a.getTime()) / DAY); // 오늘 0, 내일 1, 어제 -1
};

const ddayBadge = (deadline?: string | null, alwaysOpen?: boolean) => {
  if (alwaysOpen || !deadline) {
    return <span className="rounded-full bg-[var(--c-cta)]/90 px-2 py-0.5 text-xs text-white">상시</span>;
  }
  const diff = diffDaysLocal(deadline);
  if (diff === null) return <span className="rounded-full bg-black/80 px-2 py-0.5 text-xs text-white">-</span>;
  if (diff < 0)   return <span className="rounded-full bg-gray-400 px-2 py-0.5 text-xs text-white">마감</span>;
  if (diff === 0) return <span className="rounded-full bg-[var(--c-accent)] px-2 py-0.5 text-xs text-white">D-Day</span>;
  const tone = diff <= 3 ? "bg-[var(--c-accent)]" : "bg-black/80";
  return <span className={`rounded-full ${tone} px-2 py-0.5 text-xs text-white`}>D-{diff}</span>;
};

const ProgramDday = ({ p }: { p: Program }) => {
  if (p.deadlineAt?.startsWith?.("D-") || p.deadlineAt === "D-Day") {
    return <span className="rounded-full bg-black/80 px-2 py-0.5 text-xs text-white">{p.deadlineAt}</span>;
  }
  return ddayBadge(p.deadline ?? undefined, false);
};

/* ------ 모집 상태(모집중/마감) 계산: 로컬 저장 > API isClosed > 마감일 ------ */
const statusKey = (id: string | number) => `recruitment-status:${id}`;
const readLocalClosed = (id: string | number): boolean | null => {
  try {
    const v = localStorage.getItem(statusKey(id));
    if (v === "closed") return true;
    if (v === "open") return false;
  } catch {}
  return null;
};
const isPostClosed = (p: Post): boolean => {
  const local = readLocalClosed(p.id);
  if (local !== null) return local;
  if (typeof p.isClosed === "boolean") return p.isClosed;
  if (p.alwaysOpen) return false;
  const d = diffDaysLocal(p.deadline);
  return d !== null && d < 0;
};

/* ---------- 공통 섹션 래퍼 ---------- */
function Section({
  title,
  desc,
  moreHref,
  children,
}: {
  title: string;
  desc?: string;
  moreHref?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {desc && <p className="mt-1 text-sm muted">{desc}</p>}
        </div>
        {moreHref && (
          <Link to={moreHref} className="no-underline">
            <span className="inline-flex items-center gap-1 rounded-xl border border-[var(--c-header-border)] bg-white px-3 py-2 text-sm text-[var(--c-text)] hover:bg-[var(--c-outline-hover-bg)]">
              더보기 →
            </span>
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

/* ---------- 페이지 ---------- */
export default function Home() {
  const [loading, setLoading] = useState(true);
  const [postsRaw, setPostsRaw] = useState<any>([]);
  const [progsRaw, setProgsRaw] = useState<any>([]);
  const [apiFailed, setApiFailed] = useState(false);

  /* 자정 지나면 자동 리렌더(D-Day/필터 갱신) */
  const [midnightTick, setMidnightTick] = useState(0);
  useEffect(() => {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 2);
    const ms = next.getTime() - now.getTime();
    const id = setTimeout(() => setMidnightTick(t => t + 1), ms);
    return () => clearTimeout(id);
  }, [midnightTick]);

  const posts = useMemo(() => normalizeList<Post>(postsRaw), [postsRaw, midnightTick]);
  const programs = useMemo(() => normalizeList<Program>(progsRaw), [progsRaw, midnightTick]);

  useEffect(() => {
    (async () => {
      try {
        setApiFailed(false);

        /* ---------- 1) 최신 모집글(3) ---------- */
        const postsRes =
          await api.get("/api/recruitments/list", {
            params: { q: "", page: 0, size: 3, sort: "createdAt,desc" },
          }).catch(() => api.get("/api/recruitments/list"));

        const rawPosts = Array.isArray(postsRes?.data?.content)
          ? postsRes.data.content
          : Array.isArray(postsRes?.data)
          ? postsRes.data
          : [];

        let mappedPosts: Post[] = rawPosts.slice(0, 3).map((r: any) => {
          const locStr = (r.location || r.region || "").toString().trim();
          const [si, gu] = locStr ? locStr.split(/\s+/, 2) : [undefined, undefined];
          return {
            id: String(r.id ?? r.postId ?? r.recruitmentId ?? Math.random()),
            title: r.title ?? r.name ?? "(제목 없음)",
            region: { si, gu },
            author: r.authorName ?? r.author ?? r.host ?? r.creator ?? undefined,
            expType: r.expType ?? r.careerType ?? (r.minYears ? "경력" : "무관"),
            minYears: r.minYears ?? null,
            deadline: r.deadline ?? r.deadlineDate ?? r.receiptEndDate ?? null,
            alwaysOpen: r.alwaysOpen ?? false,
            content: r.content ?? r.description ?? r.summary ?? "",
            /** ▼ 백엔드가 주면 반영 */
            isClosed: r.isClosed ?? undefined,
          };
        });

        /* 모집글: 마감 지난 항목 제거(오늘은 포함) */
        mappedPosts = mappedPosts.filter(p => {
          if (p.alwaysOpen) return true;
          const d = diffDaysLocal(p.deadline);
          return d === null || d >= 0;
        }).slice(0, 3);

        /* ---------- 2) 마감 임박 지원사업(6) ---------- */
        let rawProgs: any[] = [];

        try {
          const pr1 = await api.get("/api/incubation-centers/search", {
            params: { keyword: "", recruiting: true, page: 0, size: 6, sort: "receiptEndDate,asc" },
          });
          rawProgs = pr1.data?.content ?? pr1.data ?? [];
          if (!rawProgs.length) throw new Error("empty");
        } catch {
          try {
            const pr2 = await api.get("/api/incubation-centers/search", {
              params: { q: "", recruiting: true, page: 0, size: 6, sort: "receiptEndDate,asc" },
            });
            rawProgs = pr2.data?.content ?? pr2.data ?? [];
            if (!rawProgs.length) throw new Error("empty-legacy");
          } catch {
            const pr3 = await api.get("/api/incubation-centers");
            rawProgs = pr3.data?.content ?? pr3.data ?? [];
          }
        }

        rawProgs = (rawProgs ?? [])
          .slice()
          .sort((a: any, b: any) => {
            const ad = new Date(a?.receiptEndDate ?? a?.deadline ?? "9999-12-31").getTime();
            const bd = new Date(b?.receiptEndDate ?? b?.deadline ?? "9999-12-31").getTime();
            return ad - bd;
          })
          .slice(0, 6);

        let mappedProgs: Program[] = rawProgs.map((p: any) => ({
          id: String(p.id ?? p.programId ?? Math.random()),
          title: p.title ?? "(제목 없음)",
          provider: p.provider ?? p.region ?? p.supportField ?? "",
          deadline: p.receiptEndDate ?? p.deadline ?? null,
          deadlineAt: undefined,
          applyUrl: p.applyUrl ?? p.apply_url ?? p.applyURL ?? null,
        }));

        /* 지원사업: 마감 지난 항목 제거(오늘은 포함) */
        mappedProgs = mappedProgs.filter(p => {
          const d = diffDaysLocal(p.deadline ?? undefined);
          return d === null || d >= 0;
        });

        setPostsRaw(mappedPosts);
        setProgsRaw(mappedProgs);
      } catch (e) {
        console.error("홈 데이터 로드 실패:", e);
        setPostsRaw(FALLBACK_POSTS.slice(0, 3));
        setProgsRaw(FALLBACK_PROGRAMS);
        setApiFailed(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="grid gap-10">
      {/* 1) 히어로 슬라이드 */}
      <ImageSlider
        slides={[
          { id: 1, src: "/hero/slide1.png"},
          { id: 2, src: "/hero/slide2.png"},
          { id: 3, src: "/hero/slide3.png"},
        ]}
        autoAspect
        rounded="rounded-3xl"
        autoplayMs={4500}
        className="shadow-lg"
      />

      {/* 2) 서비스 소개 스트립 */}
      <section className="intro-strip rounded-2xl border border-[var(--c-card-border)] bg-gradient-to-b from-white to-[var(--c-bg2)] p-6 shadow-sm">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-bold">이음 — 청년·대학생을 위한 올인원 창업 플랫폼</h3>
            <p className="mt-1 text-sm muted">팀 매칭, 공유오피스, 지원사업 정보를 한 곳에서. 마감 알림까지 깔끔하게 챙겨드려요.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="badge">무료로 시작</span>
              <span className="badge">마감 임박 알림</span>
              <span className="badge">내 근처 공유오피스</span>
              <span className="badge">러브콜 관리</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/recruitments" className="no-underline">
              <Button>모집글 둘러보기</Button>
            </Link>
            <Link to="/programs" className="no-underline">
              <Button variant="outline">지원사업 보기</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3) 누적 통계 */}
      <section className="rounded-2xl border border-[var(--c-card-border)] bg-white p-6">
        <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
          <div className="kpi">
            <div className="kpi__num">2,100+</div>
            <div className="kpi__label">등록된 모집글</div>
          </div>
          <div className="kpi">
            <div className="kpi__num">850+</div>
            <div className="kpi__label">공유오피스</div>
          </div>
          <div className="kpi">
            <div className="kpi__num">1,300+</div>
            <div className="kpi__label">지원사업·대회</div>
          </div>
          <div className="kpi">
            <div className="kpi__num">98%</div>
            <div className="kpi__label">이용자 만족도</div>
          </div>
        </div>
      </section>

      {/* 4) 빠른 액션 카드 */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card glass hover:lift">
          <h3 className="font-semibold">모집글 탐색</h3>
          <p className="muted mt-1 text-sm">맞춤 카드 탐색</p>
          <Link to="/recruitments" className="mt-3 inline-block no-underline">
            <Button>모집글 탐색</Button>
          </Link>
        </div>
        <div className="card glass hover:lift">
          <h3 className="font-semibold">공유오피스</h3>
          <p className="muted mt-1 text-sm">가격/편의시설 필터 · 카드형 보기 · 지도 미리보기</p>
          <Link to="/spaces" className="mt-3 inline-block no-underline">
            <Button variant="outline">공간 탐색</Button>
          </Link>
        </div>
        <div className="card glass hover:lift">
          <h3 className="font-semibold">지원사업·대회</h3>
          <p className="muted mt-1 text-sm">전국 정보 모아보기 · 마감 임박 순 정렬</p>
          <Link to="/programs" className="mt-3 inline-block no-underline">
            <Button variant="outline">지원사업 보기</Button>
          </Link>
        </div>
      </div>

      {/* 5) 최신 모집글 */}
      <Section title="최신 모집글" desc="방금 올라온 팀을 먼저 만나보세요" moreHref="/recruitments">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
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
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.slice(0, 3).map((p) => {
              const closed = isPostClosed(p);
              return (
                <Link key={p.id} to={`/recruitments/${p.id}`} className="no-underline">
                  <article
                    className={`relative flex min-h-[14rem] cursor-pointer flex-col justify-between rounded-2xl border border-[var(--c-card-border)] bg-white p-4 shadow-sm transition hover:shadow-md ${
                      closed ? "opacity-80" : ""
                    }`}
                  >
                    <span
                      className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-xs ${
                        closed ? "bg-gray-700 text-white" : "bg-emerald-600 text-white"
                      }`}
                    >
                      {closed ? "마감" : "모집중"}
                    </span>

                    <div>
                      <h3 className="mb-2 line-clamp-2 text-base font-semibold text-[var(--c-text)] hover:brand">
                        {p.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs muted">
                        <span>📍 {fmtRegion(p.region)}</span>
                        <span>👤 {p.author ?? "-"}</span>
                        <span>🏷 {fmtExp(p)}</span>
                      </div>

                      {p.content && (
                        <p className="mt-3 text-sm text-[var(--c-text)]/80 line-clamp-2">
                          {excerpt(p.content, 130)}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-end">
                      {ddayBadge(p.deadline ?? undefined, p.alwaysOpen)}
                    </div>
                  </article>
                </Link>
              );
            })}
            {posts.length === 0 && <div className="muted">표시할 모집글이 없습니다.</div>}
          </div>
        )}
        {apiFailed && <p className="mt-2 text-xs text-amber-600">실시간 데이터를 불러오지 못해 예시 데이터를 표시하고 있어요.</p>}
      </Section>

      {/* 7) 마감 임박 지원사업 */}
      <Section title="마감 임박 지원사업" desc="오늘 놓치면 아쉬운 혜택" moreHref="/programs">
        {loading ? (
          <ul className="grid gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="rounded-xl bg-white px-4 py-3 ring-1 ring-[var(--c-card-border)]">
                <div className="skeleton h-4 w-2/3" />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="grid gap-2">
            {programs.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-xl bg-white px-4 py-3 ring-1 ring-[var(--c-card-border)] transition hover:bg-white/90"
              >
                {p.applyUrl ? (
                  <a
                    href={p.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate no-underline text-[var(--c-text)] hover:brand"
                    aria-label={`${p.title} 신청 링크 열기`}
                  >
                    {p.title}
                  </a>
                ) : (
                  <Link to={`/programs/${p.id}`} className="truncate no-underline text-[var(--c-text)] hover:brand">
                    {p.title}
                  </Link>
                )}
                <span className="flex items-center gap-2 text-xs muted">
                  <span>{p.provider ?? ""}</span>
                  <ProgramDday p={p} />
                </span>
              </li>
            ))}
            {programs.length === 0 && <li className="muted">표시할 항목이 없습니다.</li>}
          </ul>
        )}
        {apiFailed && <p className="mt-2 text-xs text-amber-600">실시간 데이터를 불러오지 못해 예시 데이터를 표시하고 있어요.</p>}
      </Section>
    </div>
  );
}
