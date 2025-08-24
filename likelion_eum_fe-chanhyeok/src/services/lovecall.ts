// src/services/loveCall.ts
import api from "@/lib/api";

/** 서버(Page<T>) 응답 타입(스프링 기본 페이지) */
export type PageResp<T> = {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first?: boolean;
  last?: boolean;
};

/** 러브콜 항목 */
export type LoveCallItem = {
  id: number;
  recruitmentId: number;
  senderId: number;
  recipientId: number;
  message: string;
  createdAt: string;
  readAt?: string | null;
  // UI 편의 필드(서버가 내려주면 그대로 사용)
  fromName?: string;
  toName?: string;
  postTitle?: string;
};

/** ---------- 전송 ---------- */
/**
 * 러브콜 전송
 * - 프론트의 예전 형식(fromPostId/toProfileId)도 자동 매핑
 * - 백엔드 스펙: { recruitmentId, recipientId, senderId?, message }
 */
export async function sendLoveCall(payload: {
  // 신 스펙 (권장)
  recruitmentId?: number;
  recipientId?: number;    // == userId
  senderId?: number;       // 해커톤용: 없으면 백엔드에서 1로 처리하도록 되어 있으면 생략 가능
  message: string;

  // 구 스펙(호환): 있으면 자동 변환
  fromPostId?: number;     // -> recruitmentId
  toProfileId?: number;    // -> recipientId
  toName?: string;         // 서버에는 안 보냄
}) {
  const recruitmentId = payload.recruitmentId ?? payload.fromPostId;
  const recipientId   = payload.recipientId   ?? payload.toProfileId;

  if (!recruitmentId) throw new Error("recruitmentId(fromPostId)가 필요합니다.");
  if (!recipientId)   throw new Error("recipientId(toProfileId)가 필요합니다.");

  const body = {
    recruitmentId,
    recipientId,
    senderId: payload.senderId, // 해커톤: 1 고정으로 보내려면 호출부에서 1을 넘겨주세요
    message: payload.message,
  };

  const { data } = await api.post("/api/love-calls", body, {
    headers: { "Content-Type": "application/json" },
  });
  return data as LoveCallItem;
}

/** ---------- 목록 조회 ---------- */
/** 받은 러브콜 목록 */
export async function fetchReceivedLoveCalls(params: {
  userId: number;      // 인증 없으므로 ?userId= 로 대체
  page?: number;
  size?: number;
}) {
  const { userId, page = 0, size = 10 } = params;
  const { data } = await api.get("/api/me/love-calls/received", {
    params: { userId, page, size },
  });
  return data as PageResp<LoveCallItem>;
}

/** 보낸 러브콜 목록 */
export async function fetchSentLoveCalls(params: {
  userId: number;      // 인증 없으므로 ?userId= 로 대체
  page?: number;
  size?: number;
}) {
  const { userId, page = 0, size = 10 } = params;
  const { data } = await api.get("/api/me/love-calls/sent", {
    params: { userId, page, size },
  });
  return data as PageResp<LoveCallItem>;
}

/** ---------- 상태 변경 ---------- */
/** 읽음 처리 */
export async function markLoveCallRead(id: number, userId: number) {
  await api.post(`/api/me/love-calls/${id}/read`, null, {
    params: { userId },
  });
}

/** (선택) 미읽음 카운트 — 컨트롤러 열려있다면 사용 */
export async function fetchUnreadCount(userId: number) {
  const { data } = await api.get("/api/me/love-calls/unread-count", {
    params: { userId },
  });
  return Number(data ?? 0);
}

/** ---------- 삭제(물리 삭제) ---------- */
/** 단건 삭제 */
export async function deleteLoveCall(id: number, userId: number) {
  await api.delete(`/api/me/love-calls/${id}`, {
    params: { userId },
  });
}

/** 다건 삭제: ids=[1,2,3] */
export async function deleteLoveCalls(ids: number[], userId: number) {
  await api.delete(`/api/me/love-calls`, {
    params: { ids: ids.join(","), userId },
  });
}
