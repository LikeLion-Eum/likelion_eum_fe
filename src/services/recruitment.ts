import api from "@/lib/api";

export type Recruitment = {
  id: number;
  title: string;
  location: string | null;
  position: string | null;
  skills: string | null;
  career: string | null;
  recruitCount: number;
  content: string | null;
  isClosed: boolean;
  createdAt: string;
  userId: number;
  targetSpaceType?: string | null;
};

export const CAREER_CODE = {
  ALL: 0,
  FREE: 1,
  NEW: 2,
  EXP: 3,
} as const;

export type RecruitListParams = {
  page?: number;   // 1-based로 들어오면 0-based로 보정
  size?: number;
  q?: string;
  career?: number; // 0=전체
  position?: string;
  minYears?: number;
};

function normalizeList(data: any): Recruitment[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;   // ← 페이지 객체 대응
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

/** 목록 */
export async function fetchRecruitments(params: RecruitListParams = {}) {
  const query: any = {
    page: params.page != null ? Math.max(0, params.page - 1) : 0, // 1→0 보정
    size: params.size ?? 12,
  };
  if (params.q?.trim()) query.q = params.q.trim();
  if (params.career && params.career !== CAREER_CODE.ALL) query.career = params.career;
  if (params.position?.trim()) query.position = params.position.trim();
  if (typeof params.minYears === "number") query.minYears = params.minYears;

  const { data } = await api.get("/recruitment/list", { params: query });
  return normalizeList(data);
}

export const fetchRecruitmentsList = fetchRecruitments;

/** 단건/검색/등록/작성자 이메일 – 그대로 OK */
export async function fetchRecruitmentById(id: number | string) {
  const { data } = await api.get<Recruitment>(`/recruitment/${id}`);
  return data;
}
export type RecruitSearchBody = { keywords?: string[]; keyword?: string };
export async function searchRecruitments(body: RecruitSearchBody) {
  const { data } = await api.post("/recruitment/search", body);
  return normalizeList(data);
}
export async function createRecruitment(payload: any) {
  const { data } = await api.post("/recruitment", payload);
  return data;
}
export async function fetchRecruitmentDetail(id: string | number) {
  const { data } = await api.get<Recruitment>(`/recruitment/${id}`);
  return data;
}
export async function fetchRecruitmentContact(id: string | number) {
  const { data } = await api.get<{ email: string }>(`/recruitment/${id}/contact`);
  return data;
}
