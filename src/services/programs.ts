// 지원사업·대회 API 서비스
import api from "@/lib/api";

export type IncubationProgram = {
  id: number;
  sourceId?: string;
  title: string;
  region?: string;
  supportField?: string;
  receiptStartDate?: string;
  receiptEndDate?: string;
  recruiting?: boolean;
  applyUrl?: string;
};

export type PageEnvelope<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; // 0-based
  size: number;
  empty?: boolean;
};

export type PageResp<T> = PageEnvelope<T> | T[];

/** 목록 조회 (페이지) – GET /incubation-centers */
export async function fetchProgramsList(page = 1, size = 12) {
  const { data } = await api.get<PageResp<IncubationProgram>>("/api/incubation-centers", {
    params: { page: Math.max(0, page - 1), size },
  });

  if (Array.isArray(data)) {
    return {
      content: data,
      totalPages: 1,
      totalElements: data.length,
      number: 0,
      size: data.length,
      empty: data.length === 0,
    } as PageEnvelope<IncubationProgram>;
  }
  return data as PageEnvelope<IncubationProgram>;
}

/** 🔎 검색 – GET /incubation-centers/search?q=...&recruiting=... */
export type ProgramSearchParams = {
  q: string;
  recruiting?: boolean;
  page?: number; // 1-based
  size?: number;
  sort?: string | string[]; // 예: "recruiting,desc"
};

export async function searchPrograms(params: ProgramSearchParams) {
  const { q, recruiting, page = 1, size = 12, sort } = params;
  const { data } = await api.get<PageEnvelope<IncubationProgram>>("/api/incubation-centers/search", {
    params: {
      q,
      recruiting,
      page: Math.max(0, page - 1),
      size,
      ...(sort ? { sort } : {}),
    },
  });
  return data;
}

/** 🧠 추천(모집글 기반) – POST /recommendations/incubation-centers */
export type ProgramRecommendReq = {
  title: string;
  location: string;
  position: string;
  skills: string; // "A, B, C"
  career: string;
  content: string;
};
export type ProgramRecommendItem = {
  rank: number;
  id: number;
  title: string;
  region?: string;
  support_field?: string;
  receipt_start_date?: string;
  receipt_end_date?: string;
  recruiting?: boolean;
  apply_url?: string;
  reason?: string;
};

export async function recommendPrograms(body: ProgramRecommendReq) {
  const { data } = await api.post<ProgramRecommendItem[]>("/recommendations/incubation-centers", body);
  return data ?? [];
}
