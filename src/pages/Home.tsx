// src/pages/Home.tsx
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import ImageSlider from "@/components/ImageSlider";
import Button from "@/components/Button";
import AdBanner from "@/components/AdBanner";
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
  deadline?: string | null;
  alwaysOpen?: boolean;
};

type Program = {
  id: string;
  title: string;
  provider?: string;
  deadline?: string | null;
  deadlineAt?: string;
};

/* ---------- 폴백(데모) 데이터 ---------- */
const FALLBACK_POSTS: Post[] = [
  { id: "f1", title: "초기 SaaS 팀, 프론트엔드(Next.js) 구해요", region: { si: "서울", gu: "강남구" }, author: "jay", expType: "경력", minYears: 1 },
  { id: "f2", title: "로컬 커머스 기획자 모십니다", region: { si: "부산", gu: "해운대구" }, author: "mina", expType: "무관" },
  { id: "f3", title: "대학생 연합 창업동아리 12기", region: { si: "대전" }, author: "union", expType: "신입" },
];

const FALLBACK_PROGRAMS: Program[] = [
  { id: "p1", title: "[서울] 청년창업 지원금 2차", provider: "서울시", deadlineAt: "D-3" },
  { id: "p2", title: "스타트업 IR 경진대회", provider: "중기부", deadlineAt: "D-5" },
  { id: "p3", title: "예비창업패키지 추가 모집", provider: "창진원", deadlineAt: "D-10" },
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

const ddayBadge = (deadline?: string | null, alwaysOpen?: boolean) => {
  if (alwaysOpen || !deadline) {
    return (
      <span className="inline-flex items-center rounded-full bg-[var(--c-cta)]/90 px-2 py-0.5 text-xs font-medium text-white">
        상시
      </span>
    );
  }
  const today = new Date();
  const end = new Date(deadline);
  end.setHours(23, 59, 59, 999);
  const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return <span className="inline-flex items-center rounded-full bg-gray-400 px-2 py-0.5 text-xs font-medium text-white">마감</span>;
  if (diff === 0) return <span className="inline-flex items-center rounded-full bg-[var(--c-accent)] px-2 py-0.5 text-xs font-medium text-white">D‑Day</span>;
  const tone = diff <= 3 ? "bg-[var(--c-accent)]" : "bg-black/80";
  return <span className={`inline-flex items-center rounded-full ${tone} px-2 py-0.5 text-xs font-medium text-white`}>D‑{diff}</span>;
};

const ProgramDday = ({ p }: { p: Program }) => {
  if (p.deadlineAt?.startsWith?.("D-") || p.deadlineAt === "D-Day") {
    return <span className="inline-flex items-center rounded-full bg-black/80 px-2 py-0.5 text-xs font-medium text-white">{p.deadlineAt}</span>;
  }
  return ddayBadge(p.deadline ?? undefined, false);
};

/* ---------- 스켈레톤 ---------- */
const SkeletonLine = ({ className = "" }: { className?: string }) => (
  <div className={`h-4 w-full animate-pulse rounded bg-gray-200/80 ${className}`} />
);

/* ---------- 공통 섹션 헤더 ---------- */
function SectionHeader({
  title,
  desc,
  moreHref,
}: {
  title: string;
  desc?: string;
  moreHref?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-2xl md:text-[28px] font-extrabold tracking-tight text-gray-900">{title}</h2>
        {desc && <p className="mt-1 text-sm text-gray-600">{desc}</p>}
      </div>
      {moreHref && (
        <Link to={moreHref} className="no-underline">
          <span className="inline-flex items-center gap-1 rounded-xl border border-[var(--c-card-border)] bg-white px-3 py-2 text-sm text-gray-800 hover:bg-[var(--c-bg2)]">
            더보기 →
          </span>
        </Link>
      )}
    </div>
  );
}

/* ---------- 페이지 ---------- */
export default function Home() {
  const [loading, setLoading] = useState(true);
  const [postsRaw, setPostsRaw] = useState<any>([]);
  const [progsRaw, setProgsRaw] = useState<any>([]);
  const [apiFailed, setApiFailed] = useState(false);

  const posts = useMemo(() => normalizeList<Post>(postsRaw), [postsRaw]);
  const programs = useMemo(() => normalizeList<Program>(progsRaw), [progsRaw]);

  useEffect(() => {
    (async () => {
      try {
        setApiFailed(false);
        const [p1, p2] = await Promise.all([
          api.get("api/recruitment/list", { params: { page: 1, size: 6, sort: "latest" } }),
          api.get("/api/incubation-centers", { params: { page: 1, size: 6, sort: "deadline" } }),
        ]);
        setPostsRaw(p1?.data ?? p1);
        setProgsRaw(p2?.data ?? p2);
      } catch (e) {
        console.error("홈 데이터 로드 실패:", e);
        setPostsRaw(FALLBACK_POSTS);
        setProgsRaw(FALLBACK_PROGRAMS);
        setApiFailed(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* ===== HERO: 슬라이더 + 내부 오버레이(통합) ===== */}
      <div className="mx-auto max-w-7xl px-5 md:px-6 pt-6">
        <div className="relative overflow-hidden rounded-3xl border border-[var(--c-card-border)] bg-white shadow-lg">
          <ImageSlider
            slides={[
              { id: 1, src: "/hero/slide1.png", caption: { title: "팀 매칭 + 러브콜", text: "나에게 맞는 팀을 한 번에" } },
              { id: 2, src: "/hero/slide2.png", caption: { title: "공유오피스 탐색", text: "가격/편의시설로 빠르게 필터링" } },
              { id: 3, src: "/hero/slide3.png", caption: { title: "지원사업·대회", text: "마감 임박 순으로 놓치지 않기" } },
            ]}
            heightClass="h-[280px] sm:h-[340px] md:h-[420px]"
            rounded="rounded-3xl"
            autoplayMs={4500}
          />

          {/* 내부 오버레이 카드 (❗z-index + Link로 라우팅 보장) */}
          <div className="pointer-events-none absolute inset-0 flex items-center">
            <div className="pointer-events-auto z-10 ml-4 sm:ml-6 md:ml-10 max-w-[640px]
                            rounded-2xl bg-white/75 backdrop-blur-xl border border-[var(--c-card-border)]
                            shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-4 sm:p-6 md:p-7">
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold leading-tight tracking-tight text-gray-900">
                팀과 공간, 지원사업을 <br className="hidden md:block" /> 한곳에서 찾기
              </h1>
              <p className="mt-2 sm:mt-3 text-[13px] sm:text-[15px] text-gray-700">
                다양한 사람들과 팀을 꾸리고, 공간을 찾고, 사업 기회를 확인하세요.
              </p>
              <div className="mt-4 sm:mt-5 flex flex-wrap gap-2 sm:gap-3">
                <Link to="/teams" className="no-underline">
                  <Button className="bg-[var(--c-cta)] hover:bg-[var(--c-brand)] text-white">팀 찾기</Button>
                </Link>
                <Link to="/spaces" className="no-underline">
                  <Button className="bg-[var(--c-cta)] hover:bg-[var(--c-brand)] text-white">공간 찾기</Button>
                </Link>
                <Link to="/programs" className="no-underline">
                  <Button className="bg-[var(--c-cta)] hover:bg-[var(--c-brand)] text-white">지원사업 보기</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 본문 컨테이너 ===== */}
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-12 md:px-6">
        {/* 소개 스트립 */}
        <section className="rounded-3xl border border-[var(--c-card-border)] bg-gradient-to-b from-white to-[var(--c-bg2)] p-6 shadow-sm">
          <div className="flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-gray-900">
                팀, 공간, 지원사업을 찾아보세요!
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                팀 매칭 · 공유오피스 · 지원사업 정보를 한 곳에서. 마감 알림까지 깔끔하게 챙겨드립니다.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full border border-[var(--c-card-border)] bg-white px-3 py-1 text-xs">무료로 시작</span>
                <span className="inline-flex items-center rounded-full border border-[var(--c-card-border)] bg-white px-3 py-1 text-xs">마감 임박 알림</span>
                <span className="inline-flex items-center rounded-full border border-[var(--c-card-border)] bg-white px-3 py-1 text-xs">내 근처 공유오피스</span>
                <span className="inline-flex items-center rounded-full border border-[var(--c-card-border)] bg-white px-3 py-1 text-xs">러브콜 관리</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/teams" className="no-underline"><Button>팀 둘러보기</Button></Link>
              <Link to="/programs" className="no-underline"><Button variant="outline">지원사업 보기</Button></Link>
            </div>
          </div>
        </section>

        {/* KPI (숫자 = 브랜드색, 상단 액센트바 = CTA색) */}
        <section className="rounded-3xl border border-[var(--c-card-border)] bg-white p-6">
          <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
            <div className="relative">
              <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-[var(--c-cta)]" />
              <div className="text-2xl font-extrabold tracking-tight text-[color:var(--c-brand)]">2,100+</div>
              <div className="mt-0.5 text-sm text-gray-600">등록된 모집글</div>
            </div>
            <div className="relative">
              <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-[var(--c-cta)]" />
              <div className="text-2xl font-extrabold tracking-tight text-[color:var(--c-brand)]">850+</div>
              <div className="mt-0.5 text-sm text-gray-600">공유오피스</div>
            </div>
            <div className="relative">
              <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-[var(--c-cta)]" />
              <div className="text-2xl font-extrabold tracking-tight text-[color:var(--c-brand)]">1,300+</div>
              <div className="mt-0.5 text-sm text-gray-600">지원사업·대회</div>
            </div>
            <div className="relative">
              <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-[var(--c-cta)]" />
              <div className="text-2xl font-extrabold tracking-tight text-[color:var(--c-brand)]">98%</div>
              <div className="mt-0.5 text-sm text-gray-600">이용자 만족도</div>
            </div>
          </div>
        </section>

        {/* 빠른 액션 카드 */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="group rounded-2xl border border-[var(--c-card-border)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <h3 className="text-[15px] font-semibold text-gray-900">팀 매칭 & 러브콜</h3>
            <p className="mt-1 text-sm text-gray-600">맞춤 카드 탐색 · 보낸/받은 러브콜 관리</p>
            <Link to="/teams" className="mt-3 inline-block no-underline">
              <Button>팀 찾기</Button>
            </Link>
            <div className="mt-3 h-[2px] w-0 bg-[var(--c-brand)] transition-all group-hover:w-12" />
          </div>
          <div className="group rounded-2xl border border-[var(--c-card-border)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <h3 className="text-[15px] font-semibold text-gray-900">공유오피스</h3>
            <p className="mt-1 text-sm text-gray-600">가격/편의시설 필터 · 카드형 보기 · 지도 미리보기</p>
            <Link to="/spaces" className="mt-3 inline-block no-underline">
              <Button variant="outline">공간 탐색</Button>
            </Link>
            <div className="mt-3 h-[2px] w-0 bg-[var(--c-brand)] transition-all group-hover:w-12" />
          </div>
          <div className="group rounded-2xl border border-[var(--c-card-border)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <h3 className="text-[15px] font-semibold text-gray-900">지원사업·대회</h3>
            <p className="mt-1 text-sm text-gray-600">전국 정보 모아보기 · 마감 임박 순 정렬</p>
            <Link to="/programs" className="mt-3 inline-block no-underline">
              <Button variant="outline">지원사업 보기</Button>
            </Link>
            <div className="mt-3 h-[2px] w-0 bg-[var(--c-brand)] transition-all group-hover:w-12" />
          </div>
        </div>

        {/* 최신 모집글 */}
        <section>
          <SectionHeader title="최신 모집글" desc="방금 올라온 팀을 먼저 만나보세요" moreHref="/teams" />
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-[var(--c-card-border)] bg-white p-4">
                  <SkeletonLine className="w-3/4" />
                  <div className="mt-3 flex gap-2">
                    <SkeletonLine className="h-3 w-16" />
                    <SkeletonLine className="h-3 w-24" />
                    <SkeletonLine className="h-3 w-12" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <article
                  key={p.id}
                  className="group relative flex h-56 flex-col justify-between overflow-hidden rounded-2xl border border-[var(--c-card-border)] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)]"
                >
                  <div>
                    <Link to={`/teams/${p.id}`} className="no-underline">
                      <h3 className="mb-2 line-clamp-2 text-base font-semibold text-gray-900 group-hover:underline">
                        {p.title}
                      </h3>
                    </Link>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
                      <span>📍 {fmtRegion(p.region)}</span>
                      <span>👤 {p.author ?? "-"}</span>
                      <span>🏷 {fmtExp(p)}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-end">
                    {ddayBadge(p.deadline ?? undefined, p.alwaysOpen)}
                  </div>
                  <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent transition group-hover:ring-[var(--c-brand)]/30" />
                </article>
              ))}
              {posts.length === 0 && <div className="text-sm text-gray-600">표시할 모집글이 없습니다.</div>}
            </div>
          )}
          {apiFailed && <p className="mt-2 text-xs text-amber-600">실시간 데이터를 불러오지 못해 예시 데이터를 표시하고 있어요.</p>}
        </section>

        {/* 와이드 배너 */}
        <AdBanner href="https://example.com/ads1" imageUrl="/banners/banner-wide-1.jpg" className="w-full rounded-2xl overflow-hidden" />

        {/* 마감 임박 지원사업 */}
        <section>
          <SectionHeader title="마감 임박 지원사업" desc="오늘 놓치면 아쉬운 혜택" moreHref="/programs" />
          {loading ? (
            <ul className="grid gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="rounded-xl bg-white px-4 py-3 ring-1 ring-[var(--c-card-border)]">
                  <SkeletonLine className="w-2/3" />
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
                  <Link to={`/programs/${p.id}`} className="truncate no-underline text-gray-900 hover:underline">
                    {p.title}
                  </Link>
                  <span className="flex items-center gap-2 text-xs text-gray-600">
                    <span>{p.provider ?? ""}</span>
                    <ProgramDday p={p} />
                  </span>
                </li>
              ))}
              {programs.length === 0 && <li className="text-sm text-gray-600">표시할 항목이 없습니다.</li>}
            </ul>
          )}
          {apiFailed && <p className="mt-2 text-xs text-amber-600">실시간 데이터를 불러오지 못해 예시 데이터를 표시하고 있어요.</p>}
        </section>

        {/* 하단 광고 & CTA */}
        <div className="grid gap-4 md:grid-cols-3">
          <AdBanner href="https://example.com/ads2" imageUrl="/banners/banner-card-1.jpg" className="rounded-2xl overflow-hidden" />
          <AdBanner href="https://example.com/ads3" imageUrl="/banners/banner-card-2.jpg" className="rounded-2xl overflow-hidden" />
          <div className="group rounded-2xl border border-[var(--c-card-border)] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <h3 className="text-lg font-semibold text-gray-900">지금 시작해 보세요</h3>
            <p className="mt-1 text-sm text-gray-600">모집글 작성, 공간 등록, 이력서 업로드까지 한 번에</p>
            <div className="mt-3 flex gap-2">
              <Link to="/teams/new" className="no-underline"><Button>모집글 작성</Button></Link>
              <Link to="/spaces/new" className="no-underline"><Button variant="outline">공간 등록</Button></Link>
            </div>
            <div className="mt-3 h-[2px] w-0 bg-[var(--c-brand)] transition-all group-hover:w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}
