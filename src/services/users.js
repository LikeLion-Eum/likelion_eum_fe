// src/services/users.ts
import api from "@/lib/api";
const FIXED_USER_ID = 1;
export async function fetchUser1() {
    try {
        const { data } = await api.get(`/api/users/${FIXED_USER_ID}`); // ✅ /api 붙임
        return data ?? null;
    }
    catch (e) {
        if (e?.response?.status === 404)
            return null;
        throw e;
    }
}
export async function updateUser1(payload) {
    // 서버가 PATCH 미지원이면 .put(`/api/users/${FIXED_USER_ID}`, payload)
    const { data } = await api.patch(`/api/users/${FIXED_USER_ID}`, payload); // ✅ /api 붙임
    return data;
}
