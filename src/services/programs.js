// 지원사업·대회 API 서비스
import api from "@/lib/api";
/** 목록 조회 (페이지) – GET /incubation-centers */
export async function fetchProgramsList(page = 1, size = 12) {
    const { data } = await api.get("/api/incubation-centers", {
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
        };
    }
    return data;
}
export async function searchPrograms(params) {
    const { q, recruiting, page = 1, size = 12, sort } = params;
    const { data } = await api.get("/api/incubation-centers/search", {
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
export async function recommendPrograms(body) {
    const { data } = await api.post("/recommendations/incubation-centers", body);
    return data ?? [];
}
