import api from "@/lib/api";

/** AI가 추천한 인재 카드 타입 */
export type TalentCandidate = {
  rank: number;               // 1~N 랭크
  name: string;               // 이름/닉네임
  career: string;             // 예: "신입", "3년차 프론트엔드"
  main_skills?: string[];     // 상위 핵심 스킬 태그
  reason?: string;            // 추천 사유 요약
  profileId?: number;         // (선택) 프로필 식별자
};

/**
 * 모집글 정보를 바탕으로 인재 추천 목록을 반환
 * POST /ai/recommend/talents  (백엔드 엔드포인트에 맞춰 조정)
 */
export async function recommendTalentsByRecruitment(recruitment: {
  id: number;
  title: string;
  location?: string | null;
  position?: string | null;
  skills?: string | null;
  career?: string | null;
  content?: string | null;
}) {
  const { data } = await api.post<TalentCandidate[]>("/ai/recommend/talents", {
    recruitment,
  });
  return data ?? [];
}
