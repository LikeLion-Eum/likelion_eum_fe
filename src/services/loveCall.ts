// src/services/loveCall.ts
import api from "@/lib/api";

/** 공통 페이지 타입 */
export type PageResult<T> = {
  items: T[];
  page: number;
  size: number;
  totalElements?: number;
  totalPages?: number;
};

/** 러브콜 타입(대략) */
export type LoveCall = {
  id: number;
  recruitmentId?: number;
  senderId?: number;
  senderName?: string;
  receiverId?: number;
  receiverName?: string;
  title?: string;
  message?: string;
  createdAt?: string; // ISO
  read?: boolean;
  contactEmail?: string;
  [k: string]: any;
};

/** 유틸: 배열/페이지 래핑(배열/스프링 페이지 응답 모두 호환) */
function asPage<T = any>(raw: any, page = 0, size = 20): PageResult<T> {
  if (Array.isArray(raw)) return { items: raw, page, size };
  if (raw?.content && Array.isArray(raw.content)) {
    return {
      items: raw.content,
      page: Number.isFinite(raw.number) ? raw.number : page,
      size: raw.size ?? size,
      totalElements: raw.totalElements,
      totalPages: raw.totalPages,
    };
  }
  return { items: [], page, size };
}

/* ───────────────────── 게스트 폴백 설정 ───────────────────── */
const GUEST = (import.meta as any).env?.VITE_GUEST_MODE === "true";
const LS_SENT = "guest_love_calls_sent";
const LS_RECV = "guest_love_calls_recv";

const nowISO = () => new Date().toISOString();
const uid = () => Date.now();

const load = (k: string) => {
  try { return JSON.parse(localStorage.getItem(k) || "[]"); } catch { return []; }
};
const save = (k: string, v: any) => localStorage.setItem(k, JSON.stringify(v));

/** 서버가 401/403 주면 폴백으로 전환 */
const shouldFallback = (e: any) =>
  e?.response?.status === 401 || e?.response?.status === 403;

/* ───────────────────── API: 보내기/목록/읽음/삭제/카운트 ───────────────────── */

/** 러브콜 보내기(게스트 폴백 포함) */
export async function sendLoveCall(
  recruitmentId: number,
  payload?: { message?: string }
) {
  // 1) 서버 시도
  try {
    const { data } = await api.post(
      `/recruitments/${recruitmentId}/love-calls`,
      payload ?? {}
    );
    return data as LoveCall;
  } catch (e: any) {
    if (!GUEST && !shouldFallback(e)) throw e;
  }

  // 2) 게스트 폴백: 보낸함 저장(+데모로 받은함에도 복제)
  const item: LoveCall = {
    id: uid(),
    recruitmentId,
    message: payload?.message || "",
    createdAt: nowISO(),
    read: false,
    senderName: "나(게스트)",
    receiverName: "상대(데모)",
  };
  const sent = load(LS_SENT) as LoveCall[];
  const recv = load(LS_RECV) as LoveCall[];
  sent.unshift(item);
  recv.unshift({ ...item, id: uid(), read: false });
  save(LS_SENT, sent);
  save(LS_RECV, recv);
  return item;
}

/** 받은 목록 (onlyUnread 옵션 지원) */
export async function fetchReceivedLoveCalls(
  page = 0,
  size = 20,
  opts?: { onlyUnread?: boolean }
) {
  const onlyUnread = opts?.onlyUnread;

  if (!GUEST) {
    try {
      const params: any = { page, size };
      if (onlyUnread !== undefined) params.onlyUnread = onlyUnread;
      const { data } = await api.get(`/me/love-calls/received`, { params });
      return asPage<LoveCall>(data, page, size);
    } catch (e: any) {
      if (!shouldFallback(e)) throw e;
    }
  }

  // 폴백: 로컬
  const all = (load(LS_RECV) as LoveCall[]).filter(
    (x) => (onlyUnread ? !x.read : true)
  );
  const start = page * size;
  const items = all.slice(start, start + size);
  return {
    items,
    page,
    size,
    totalElements: all.length,
    totalPages: Math.ceil(all.length / size),
  } as PageResult<LoveCall>;
}

/** 보낸 목록 */
export async function fetchSentLoveCalls(page = 0, size = 20) {
  if (!GUEST) {
    try {
      const { data } = await api.get(`/me/love-calls/sent`, {
        params: { page, size },
      });
      return asPage<LoveCall>(data, page, size);
    } catch (e: any) {
      if (!shouldFallback(e)) throw e;
    }
  }
  // 폴백: 로컬
  const all = load(LS_SENT) as LoveCall[];
  const start = page * size;
  const items = all.slice(start, start + size);
  return {
    items,
    page,
    size,
    totalElements: all.length,
    totalPages: Math.ceil(all.length / size),
  } as PageResult<LoveCall>;
}

/** 읽음 처리 */
export async function markLoveCallRead(id: number, read = true) {
  if (!GUEST) {
    try {
      // 명세서: GET /api/me/love-calls/{id}?markRead=true|false
      await api.get(`/me/love-calls/${id}`, { params: { markRead: read } });
      return;
    } catch (e: any) {
      if (!shouldFallback(e)) throw e;
    }
  }
  // 폴백: 로컬 데이터 수정
  const patch = (k: string) => {
    const all = load(k) as LoveCall[];
    const i = all.findIndex((x) => x.id === id);
    if (i >= 0) { all[i] = { ...all[i], read }; save(k, all); }
  };
  patch(LS_RECV);
  patch(LS_SENT);
}

/** 삭제 */
export async function deleteLoveCall(id: number) {
  if (!GUEST) {
    try {
      await api.delete(`/me/love-calls/${id}`);
      return;
    } catch (e: any) {
      if (!shouldFallback(e)) throw e;
    }
  }
  // 폴백: 로컬 제거
  const del = (k: string) => {
    const all = load(k) as LoveCall[];
    const next = all.filter((x) => x.id !== id);
    save(k, next);
  };
  del(LS_RECV);
  del(LS_SENT);
}

/** 읽지 않은 개수 */
export async function fetchUnreadCount() {
  if (!GUEST) {
    try {
      const { data } = await api.get(`/me/love-calls/unread-count`);
      // 서버가 {count: number} 또는 number를 줄 수 있으니 호환 처리
      if (typeof data === "number") return data;
      if (typeof data?.count === "number") return data.count;
      return 0;
    } catch (e: any) {
      if (!shouldFallback(e)) throw e;
    }
  }
  // 폴백: 로컬에서 미읽음 개수
  const all = load(LS_RECV) as LoveCall[];
  return all.filter((x) => !x.read).length;
}
