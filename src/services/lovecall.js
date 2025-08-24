// src/services/loveCall.ts
import api from "@/lib/api";
/** ---------- 전송 ---------- */
/**
 * 러브콜 전송
 * - 프론트의 예전 형식(fromPostId/toProfileId)도 자동 매핑
 * - 백엔드 스펙: { recruitmentId, recipientId, senderId?, message }
 */
export async function sendLoveCall(payload) {
    const recruitmentId = payload.recruitmentId ?? payload.fromPostId;
    const recipientId = payload.recipientId ?? payload.toProfileId;
    if (!recruitmentId)
        throw new Error("recruitmentId(fromPostId)가 필요합니다.");
    if (!recipientId)
        throw new Error("recipientId(toProfileId)가 필요합니다.");
    const body = {
        recruitmentId,
        recipientId,
        senderId: payload.senderId, // 해커톤: 1 고정으로 보내려면 호출부에서 1을 넘겨주세요
        message: payload.message,
    };
    const { data } = await api.post("/api/love-calls", body, {
        headers: { "Content-Type": "application/json" },
    });
    return data;
}
/** ---------- 목록 조회 ---------- */
/** 받은 러브콜 목록 */
export async function fetchReceivedLoveCalls(params) {
    const { userId, page = 0, size = 10 } = params;
    const { data } = await api.get("/api/me/love-calls/received", {
        params: { userId, page, size },
    });
    return data;
}
/** 보낸 러브콜 목록 */
export async function fetchSentLoveCalls(params) {
    const { userId, page = 0, size = 10 } = params;
    const { data } = await api.get("/api/me/love-calls/sent", {
        params: { userId, page, size },
    });
    return data;
}
/** ---------- 상태 변경 ---------- */
/** 읽음 처리 */
export async function markLoveCallRead(id, userId) {
    await api.post(`/api/me/love-calls/${id}/read`, null, {
        params: { userId },
    });
}
/** (선택) 미읽음 카운트 — 컨트롤러 열려있다면 사용 */
export async function fetchUnreadCount(userId) {
    const { data } = await api.get("/api/me/love-calls/unread-count", {
        params: { userId },
    });
    return Number(data ?? 0);
}
/** ---------- 삭제(물리 삭제) ---------- */
/** 단건 삭제 */
export async function deleteLoveCall(id, userId) {
    await api.delete(`/api/me/love-calls/${id}`, {
        params: { userId },
    });
}
/** 다건 삭제: ids=[1,2,3] */
export async function deleteLoveCalls(ids, userId) {
    await api.delete(`/api/me/love-calls`, {
        params: { ids: ids.join(","), userId },
    });
}
