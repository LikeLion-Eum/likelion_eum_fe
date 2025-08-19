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
  ALL: 0,  // 전체
  FREE: 1, // 무관
  NEW: 2,  // 신입
  EXP: 3,  // 경력
} as const;

export type RecruitListParams = {
  page?: number;  // 1-based (백엔드가 0-based면 아래에서 보정)
  size?: number;
  q?: string;
  career?: number;   // 0=전체
  position?: string;
  minYears?: number;
};

/** 목록 */
export async function fetchRecruitments(params: RecruitListParams = {}) {
  const { data } = await api.get<Recruitment[]>("/recruitment/list", { params });
  return data ?? [];
}

/** ✅ 호환용 alias: 과거 import 이름 유지 */
export const fetchRecruitmentsList = fetchRecruitments;

/** 단건 */
export async function fetchRecruitmentById(id: number | string) {
  const { data } = await api.get<Recruitment>(`/recruitment/${id}`);
  return data;
}

/** 검색(AND 매칭 바디) – POST /api/recruitment/search */
export type RecruitSearchBody = {
  keywords?: string[];
  keyword?: string;
  // targetSpaceType?: "shared_office" | "incubation_center";
};

export async function searchRecruitments(body: RecruitSearchBody) {
  const { data } = await api.post<Recruitment[]>("/recruitment/search", body);
  return data ?? [];
}

/** 상세 */
export async function fetchRecruitmentDetail(id: string | number) {
  const { data } = await api.get<Recruitment>(`/recruitment/${id}`);
  return data;
}

/** 등록 – POST /api/recruitment */
export async function createRecruitment(payload: any) {
  const { data } = await api.post("/recruitment", payload);
  return data;
}

/** 작성자 이메일 – GET /api/recruitment/{id}/contact  → { email: string } */
export async function fetchRecruitmentContact(id: string | number) {
  const { data } = await api.get<{ email: string }>(`/recruitment/${id}/contact`);
  return data;
}
