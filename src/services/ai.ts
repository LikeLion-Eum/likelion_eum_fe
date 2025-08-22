import api from "@/lib/api";

/** AI가 추천한 인재 카드 타입 */
export type TalentCandidate = {
  rank: number;           // 1~N 랭크
  name: string;           // 이름/닉네임
  career: string;         // 예: "신입", "3년차 프론트엔드"
  main_skills?: string[]; // 상위 핵심 스킬 태그
  reason?: string;        // 추천 사유 요약
  profileId?: number;     // (선택) 프로필 식별자
};

type RecommendUsersReq = {
  id: number;             // 모집글 id (필수)
  title?: string;
  location?: string;
  position?: string;
  skills?: string;
  career?: string;
  content?: string;
};

/**
 * 모집글 정보를 바탕으로 인재 추천 목록을 반환
 * 서버 기대 스펙: flat body (recruitmentId + 보조 필드들)
 */
export async function recommendTalentsByRecruitment(req: RecommendUsersReq) {
  const body: Record<string, unknown> = {
    recruitmentId: req.id,     // ✅ 핵심: id를 별도 키로 전달
    title: req.title,
    location: req.location,
    position: req.position,
    skills: req.skills,
    career: req.career,
    content: req.content,
  };

  // null/undefined/빈문자 제거
  Object.keys(body).forEach((k) => {
    const v = body[k];
    if (v == null || v === "") delete (body as any)[k];
  });

  const { data } = await api.post<TalentCandidate[]>(
    "/recommendations/users",
    body,
    { headers: { "Content-Type": "application/json" } }
  );
  return data ?? [];
}
