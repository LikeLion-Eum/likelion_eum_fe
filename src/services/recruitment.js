import api from "@/lib/api";
export const CAREER_CODE = {
    ALL: 0, // 전체
    FREE: 1, // 무관
    NEW: 2, // 신입
    EXP: 3, // 경력
};
/** 📃 목록 – GET /api/recruitments */
export async function fetchRecruitments(params = {}) {
    const { data } = await api.get("/api/recruitments", { params });
    return data ?? [];
}
/** ✅ 호환용 alias */
export const fetchRecruitmentsList = fetchRecruitments;
/** 🔍 단건 – GET /api/recruitments/{id} */
export async function fetchRecruitmentById(id) {
    const { data } = await api.get(`/api/recruitments/${id}`);
    return data;
}
export async function searchRecruitments(body) {
    const { data } = await api.post("/api/recruitments/search", body);
    return data ?? [];
}
/** 📄 상세 – GET /api/recruitments/{id} */
export async function fetchRecruitmentDetail(id) {
    const { data } = await api.get(`/api/recruitments/${id}`);
    return data;
}
/** ✍ 등록 – POST /api/recruitments */
export async function createRecruitment(payload) {
    const { data } = await api.post("/api/recruitments", payload);
    return data;
}
/** 📧 작성자 이메일 – GET /api/recruitments/{id}/contact */
export async function fetchRecruitmentContact(id) {
    const { data } = await api.get(`/api/recruitments/${id}/contact`);
    return data;
}
