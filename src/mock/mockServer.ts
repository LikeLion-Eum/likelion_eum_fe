// src/mock/mockServer.ts
import type { AxiosInstance } from "axios";
import MockAdapter from "axios-mock-adapter";

/** -----------------------------
 * 공통 유틸
 * ----------------------------- */
type Region = { si?: string; gu?: string };

const parseSkills = (v: unknown): string[] =>
  typeof v === "string"
    ? v.split(",").map(s => s.trim()).filter(Boolean)
    : Array.isArray(v)
    ? v.map(String)
    : [];

const paginate = <T,>(arr: T[], page: number, limit: number) => {
  const total = arr.length;
  const start = (page - 1) * limit;
  return { items: arr.slice(start, start + limit), total };
};

/** 시/도 → 구/군 */
const GUS_BY_SI: Record<string, string[]> = {
  "서울": ["강남구","서초구","송파구","마포구","용산구","성동구","중구","종로구","강동구","동작구","광진구","강서구","양천구","노원구","강북구"],
  "부산": ["해운대구","수영구","남구","연제구","동래구","부산진구","사하구","북구"],
  "대전": ["서구","유성구","대덕구","중구","동구"],
  "광주": ["서구","북구","광산구","동구","남구"],
  "인천": ["연수구","미추홀구","남동구","서구","부평구"],
  "대구": ["중구","수성구","북구","달서구"],
  "경기": ["성남시","수원시","용인시","고양시","부천시","남양주시"],
  "세종": [],
  "울산": ["남구","중구","동구","북구"],
  "강원": ["춘천시","원주시","강릉시"],
  "충북": ["청주시","충주시"],
  "충남": ["천안시","아산시","공주시"],
  "전북": ["전주시","군산시","익산시"],
  "전남": ["목포시","여수시","순천시"],
  "경북": ["포항시","구미시","경산시"],
  "경남": ["창원시","김해시","진주시"],
  "제주": ["제주시","서귀포시"],
};

/** -----------------------------
 * 더미 데이터
 * ----------------------------- */
const basePosts = [
  { id: "1",  title: "초기 스타트업 프론트엔드 (React/TS)", region: { si: "서울", gu: "강남구" } as Region, author: "김이음", expType: "경력", minYears: 2, role: "프론트엔드", skills: ["React","TypeScript","Vite"], headcount: 2, description: "프론트엔드 코어 채용" },
  { id: "2",  title: "백엔드(Node/Prisma) 신입",              region: { si: "서울", gu: "마포구" }   as Region, author: "박시작", expType: "신입",  minYears: null, role: "백엔드",     skills: ["Node","Prisma","SQL"], headcount: 1, description: "Node 기반 API 개발" },
  { id: "3",  title: "데이터 분석가 (Python/SQL)",            region: { si: "부산", gu: "해운대구" } as Region, author: "이바다", expType: "경력", minYears: 3, role: "데이터",     skills: ["Python","SQL","Airflow"], headcount: 1, description: "파이프라인/대시보드" },
  { id: "4",  title: "UX/UI 디자이너 동료",                   region: { si: "대전", gu: "서구" }     as Region, author: "정과학", expType: "무관", minYears: null, role: "디자인",     skills: ["Figma","ProtoPie"], headcount: 1, description: "프로토타이핑/리서치" },
  { id: "5",  title: "마케팅 인턴 (SNS/퍼포먼스)",             region: { si: "인천", gu: "연수구" }   as Region, author: "한새로", expType: "신입",  minYears: null, role: "마케팅",     skills: ["SNS","GA"], headcount: 1, description: "콘텐츠/성과분석" },
  { id: "6",  title: "풀스택(React+Nest)",                    region: { si: "서울", gu: "성동구" }   as Region, author: "최분석", expType: "경력", minYears: 4, role: "백엔드",     skills: ["React","NestJS","PostgreSQL"], headcount: 2, description: "BFF/서버" },
  { id: "7",  title: "기획자 (서비스/데이터)",                 region: { si: "경기", gu: "성남시" }   as Region, author: "이성과", expType: "경력", minYears: 2, role: "기획",       skills: ["Jira","GA"], headcount: 1, description: "서비스 고도화" },
  { id: "8",  title: "운영 매니저 (커뮤니티/이벤트)",           region: { si: "서울", gu: "용산구" }   as Region, author: "오운영", expType: "무관", minYears: null, role: "운영",       skills: ["CS","Excel"], headcount: 1, description: "행사/고객관리" },
  { id: "9",  title: "AI 엔지니어 (LLM 파인튜닝)",              region: {}                             as Region, author: "남모델", expType: "경력", minYears: 3, role: "백엔드",     skills: ["Python","PyTorch","LLM"], headcount: 1, description: "전국 원격" },
  { id: "10", title: "프론트 주니어 (Vue/React 환영)",        region: { si: "광주", gu: "서구" }     as Region, author: "김먼지", expType: "신입",  minYears: null, role: "프론트엔드", skills: ["Vue","React"], headcount: 1, description: "UI 작업" },
  { id: "11", title: "세일즈(영업) - B2B SaaS",               region: { si: "부산", gu: "남구" }     as Region, author: "유영업", expType: "경력", minYears: 2, role: "영업",       skills: ["B2B","CRM"], headcount: 1, description: "딜 파이프라인" },
  { id: "12", title: "리서처 인턴 (사용성 테스트)",            region: { si: "대구", gu: "중구" }     as Region, author: "고리서", expType: "신입",  minYears: null, role: "디자인",     skills: ["Research","Interview"], headcount: 1, description: "UT/인터뷰" },
];

// 48개로 확장 (페이지네이션 테스트 편하게)
const posts = Array.from({ length: 48 }).map((_, i) => {
  const b = basePosts[i % basePosts.length];
  const batch = Math.floor(i / basePosts.length) + 1; // 1~4
  return {
    ...b,
    id: String(i + 1),
    title: `${b.title} · ${batch}`,
  };
});

/** -----------------------------
 * Mock 세팅
 * ----------------------------- */
export default function setupMock(api: AxiosInstance) {
  const mock = new MockAdapter(api, { delayResponse: 250 });

  /** 구/군 목록 */
  mock.onGet("/regions/gus").reply(config => {
    const si = String(config.params?.si ?? "");
    return [200, { items: GUS_BY_SI[si] || [] }];
  });

  /** 모집글 목록 (검색/필터/정렬/페이지) */
  mock.onGet(/\/posts$/).reply(config => {
    const p = config.params || {};
    const q = String(p.q ?? "").toLowerCase();
    const si = String(p.si ?? "");
    const gu = String(p.gu ?? "");
    const exp = String(p.exp ?? ""); // 구형 필드 호환용
    const expType = String(p.expType ?? ""); // 신형 필드
    const minYearsMin = Number.isFinite(Number(p.minYearsMin)) ? Number(p.minYearsMin) : undefined;
    const role = String(p.role ?? "");
    const skills = parseSkills(p.skills);
    const sort = (String(p.sort ?? "latest") as "latest" | "popular");
    const page = Math.max(1, Number(p.page ?? 1));
    const limit = Math.max(1, Number(p.limit ?? 12));

    let list = posts.slice();

    // 검색어
    if (q) {
      list = list.filter(x =>
        (x.title || "").toLowerCase().includes(q) ||
        (x.author || "").toLowerCase().includes(q) ||
        (`${x.region?.si ?? ""} ${x.region?.gu ?? ""}`).toLowerCase().includes(q) ||
        (x.skills || []).some((s: string) => s.toLowerCase().includes(q))
      );
    }

    // 지역: 빈 객체 {} 는 '전국'
    if (si) {
      if (si === "전체" || si === "전체(전국)") {
        // 전국: 필터 없음
      } else {
        list = list.filter(x => x.region && x.region.si === si);
      }
    }
    if (gu) list = list.filter(x => x.region && x.region.gu === gu);

    // 직무
    if (role) list = list.filter(x => (x.role || "").includes(role));

    // 기술 태그 (AND)
    if (skills.length) list = list.filter(x => skills.every(s => (x.skills || []).includes(s)));

    // 경력 필터 (신·경·무관 + 최소년수)
    if (expType) {
      list = list.filter(x => (x.expType ?? x.exp) === expType);
    } else if (exp) {
      // 과거 쿼리(exp) 호환
      list = list.filter(x => (x.expType ?? x.exp) === exp);
    }
    if (typeof minYearsMin === "number" && !Number.isNaN(minYearsMin)) {
      list = list.filter(x => {
        const t = (x as any).expType ?? (x as any).exp;
        if (t !== "경력") return false;
        const my = Number((x as any).minYears ?? 0);
        return my >= minYearsMin;
      });
    }

    // 정렬
    if (sort === "popular") list = list.slice().reverse(); // 간단 인기순
    // latest 는 기본 배열 순서(최근 추가가 앞에 오도록) 유지

    const { items, total } = paginate(list, page, limit);
    return [200, { items, total }];
  });

  /** 모집글 단건 */
  mock.onGet(/\/posts\/[^/]+$/).reply(config => {
    const id = config.url!.split("/").pop()!;
    const found = posts.find(p => p.id === id);
    return found ? [200, found] : [404, { ok:false, error:{ code:"NOT_FOUND", message:"post not found" }}];
  });

  /** 모집글 등록 */
  mock.onPost("/posts").reply(config => {
    const body = JSON.parse(config.data || "{}");
    const id = String(posts.length + 1);
    const item = {
      id,
      title: String(body.title ?? "제목 없음"),
      region: (body.region ?? {}) as Region,      // 전체(전국)인 경우 {}
      author: "나",
      expType: (body.expType as "신입"|"경력"|"무관") ?? (body.exp ?? "무관"),
      minYears: body.minYears ?? null,
      role: String(body.role ?? ""),
      skills: parseSkills(body.skills),
      headcount: Number(body.headcount ?? 1),
      description: String(body.description ?? ""),
      deadline: body.alwaysOpen ? null : (body.deadline ?? null),
      alwaysOpen: Boolean(body.alwaysOpen),
      // createdAt 같은 필드가 필요하면 여기에 추가
    };
    posts.unshift(item as any);
    return [200, { id }];
  });

  return mock;
}
