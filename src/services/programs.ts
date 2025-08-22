// src/services/programs.ts
import api from "@/lib/api";

/** 지원사업·대회(incubation center) 기본 타입 */
export type IncubationProgram = {
  id: number;
  title: string;
  region?: string;
  supportField?: string;
  recruiting: boolean;            // 모집중 여부
  receiptStartDate?: string;      // 접수 시작
  receiptEndDate?: string;        // 접수 마감
  applyUrl?: string;              // 지원 링크
  // 필요한 필드가 더 있으면 여기에 추가하세요.
};

/** 공통 페이지네이션 응답 형태 */
export type Paginated<T> = {
  content: T[];
  totalPages: number;
  totalElements?: number;
  page?: number;
  size?: number;
};

/** 목록 조회: GET /api/incubation-centers?page=&size= */
export async function fetchProgramsList(
  page: number,
  size: number
): Promise<Paginated<IncubationProgram>> {
  const { data } = await api.get("/incubation-centers", {
    params: { page, size },
  });
  return data;
}

/** 검색 파라미터 (모두 선택적) */
export type SearchProgramsParams = {
  page: number;
  size: number;
  /** 키워드(제목/분야/지역/링크 등 부분 일치) */
  q?: string;
  /** 모집중(true) / 종료(false) */
  recruiting?: boolean;
  /**
   * 정렬: 백엔드 규격 "field,dir"
   * 예) ["receiptEndDate,asc"], ["receiptEndDate,desc"], ["title,asc"]
   * 여러 개 지원 시 배열 반복 전송됩니다.
   */
  sort?: string[];
};

/** 검색: GET /api/incubation-centers/search */
export async function searchPrograms(
  params: SearchProgramsParams
): Promise<Paginated<IncubationProgram>> {
  const { data } = await api.get("/incubation-centers/search", { params });
  return data;
}

/** (선택) 추천: POST /api/recommendations/incubation-centers */
export type RecommendProgramsBody = {
  // 서버 규격에 맞게 필요한 필드만 유지하세요.
  // 예: userId?: number; topN?: number; preferredRegion?: string;
  [key: string]: unknown;
};

export async function recommendPrograms(
  body: RecommendProgramsBody
): Promise<IncubationProgram[]> {
  const { data } = await api.post("/recommendations/incubation-centers", body);
  return data;
}
