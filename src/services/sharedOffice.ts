// src/services/sharedOffice.ts
import api from "@/lib/api";

/* ─────────────────────────────────────────────────────────
 *  폼 입력(서버 스펙과 동일한 camelCase 키)
 *  name, location, roomCount, size, maxCount, description,
 *  hostRepresentativeName, businessRegistrationNumber, hostContact
 * ───────────────────────────────────────────────────────── */
export type CreateSharedOfficeReq = {
  name: string;
  location: string;
  roomCount: number;
  size: number;
  maxCount: number;
  description?: string;

  hostRepresentativeName: string;
  businessRegistrationNumber: string; // 예: 123-45-67890 (총 12자)
  hostContact: string;                // 예: 010-1234-5678
};

/** 서버가 돌려주는 공유오피스(필요 필드만) */
export type SharedOffice = {
  id: number;                         // ← 추가
  name: string;
  description?: string;
  roomCount: number;
  size: number;
  location: string;
  maxCount: number;

  hostRepresentativeName: string;
  businessRegistrationNumber: string;
  hostContact: string;

  // 카드/프론트 보조용
  thumbnailUrl?: string | null;
  pricePerMonth?: number | null;
  distanceNote?: string | null;
};

/** 서버에 보낼 실제 페이로드(그대로 camelCase) */
type CreateSharedOfficeApiReq = {
  name: string;
  description?: string;
  roomCount: number;
  size: number;
  location: string;
  maxCount: number;
  hostRepresentativeName: string;
  businessRegistrationNumber: string;
  hostContact: string;
};

/* 공통: 에러 메시지 뽑기 */
const pickErr = (err: any) =>
  err?.response?.data?.error ||
  err?.response?.data?.message ||
  (typeof err?.response?.data === "string" ? err.response.data : "") ||
  (err?.response?.status ? `HTTP ${err.response.status}` : "") ||
  err?.message ||
  "서버 오류가 발생했습니다.";

/* id 통일 헬퍼(응답에서 id 키명이 다를 때 대응) */
const coerceId = (x: any): number => {
  const cand =
    x?.id ?? x?.sharedOfficeId ?? x?.officeId ?? x?.pk ?? x?.seq ?? null;
  const n = typeof cand === "string" ? Number(cand) : cand;
  return Number.isFinite(n) ? (n as number) : 0;
};
const normalizeOffice = (x: any): SharedOffice => ({
  ...x,
  id: coerceId(x),
});

/* 포맷 보정 유틸(하이픈 자동 정리) */
const normBizNo = (v?: string) => {
  const d = (v ?? "").replace(/\D/g, "");
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`; // 123-45-67890
  return (v ?? "").trim();
};
const normPhone = (v?: string) => {
  const d = (v ?? "").replace(/\D/g, "");
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  return (v ?? "").trim();
};

/** 1) 공간 생성: POST /api/shared-offices — camelCase만 보냄 */
export async function createSharedOffice(payload: CreateSharedOfficeReq) {
  const name = String(payload.name ?? "").trim();
  const location = String(payload.location ?? "").trim();
  const description = payload.description?.toString().trim() || undefined;

  const roomCount = Number.parseInt(String(payload.roomCount), 10);
  const size = Number.parseInt(String(payload.size), 10);
  const maxCount = Number.parseInt(String(payload.maxCount), 10);

  const hostRepresentativeName = (payload.hostRepresentativeName ?? "").trim();
  const businessRegistrationNumber = normBizNo(
    payload.businessRegistrationNumber
  );
  const hostContact = normPhone(payload.hostContact);

  // 클라이언트 측 검증
  const lacks: string[] = [];
  if (!name) lacks.push("name");
  if (!location) lacks.push("location");
  if (!Number.isFinite(roomCount) || roomCount <= 0) lacks.push("roomCount");
  if (!Number.isFinite(size) || size <= 0) lacks.push("size");
  if (!Number.isFinite(maxCount) || maxCount <= 0) lacks.push("maxCount");
  if (!hostRepresentativeName) lacks.push("hostRepresentativeName");
  if (!businessRegistrationNumber) lacks.push("businessRegistrationNumber");
  if (!hostContact) lacks.push("hostContact");
  if (lacks.length) throw new Error(`필수값 누락/형식 오류: ${lacks.join(", ")}`);

  const body: CreateSharedOfficeApiReq = {
    name,
    description,
    roomCount,
    size,
    location,
    maxCount,
    hostRepresentativeName,
    businessRegistrationNumber,
    hostContact,
  };

  try {
    // 개발 중 디버깅
    console.debug("[createSharedOffice] request body =", body);
    const { data } = await api.post<SharedOffice>("/shared-offices", body, {
      headers: { "Content-Type": "application/json" },
    });
    return normalizeOffice(data);
  } catch (err: any) {
    const msg = pickErr(err);
    console.error("[createSharedOffice] failed:", msg, {
      status: err?.response?.status,
      data: err?.response?.data,
      url: "/shared-offices",
    });
    throw new Error(msg);
  }
}

/** 2) 공간 목록: GET /api/shared-offices  (+ 필터/페이징) */
export type ListSharedOfficesParams = {
  page?: number; // 1-based
  size?: number;
  si?: string;
  gu?: string;
  minPrice?: number;
  maxPrice?: number;
  q?: string;
};
export type SharedOfficePage = {
  content: SharedOffice[];
  totalPages: number;
  totalElements: number;
  number: number; // 0-based
  size: number;
};

export async function listSharedOffices(params: ListSharedOfficesParams = {}) {
  const { page = 1, size = 12, ...rest } = params;
  const { data } = await api.get<SharedOfficePage>("/shared-offices", {
    params: { page: Math.max(0, page - 1), size, ...rest },
  });
  return {
    ...data,
    content: (data.content ?? []).map(normalizeOffice),
  };
}

/** 3) 상세: GET /api/shared-offices/{id} */
export async function fetchSharedOffice(id: number | string) {
  const { data } = await api.get<SharedOffice>(`/shared-offices/${id}`);
  return normalizeOffice(data);
}

/** 4) 사진 업로드 – POST /api/shared-offices/{officeId}/photos (multipart) */
export type PhotoItem = {
  id: number;
  url: string;
  caption?: string | null;
  main?: boolean;
  seq?: number;
};

export async function uploadSharedOfficePhotos(
  officeId: number,
  files: File[],
  captions?: string[]
) {
  if (!files?.length) return;
  const fd = new FormData();
  files.forEach((f) => fd.append("files", f));
  if (captions?.length) captions.forEach((c) => fd.append("captions", c));
  await api.post(`/shared-offices/${officeId}/photos`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

/** 5) 사진 목록: GET /api/shared-offices/{officeId}/photos */
export async function listSharedOfficePhotos(officeId: number) {
  const { data } = await api.get<PhotoItem[]>(
    `/shared-offices/${officeId}/photos`
  );
  return data ?? [];
}

/** 6) 대표사진 지정: PATCH /api/shared-offices/{officeId}/photos/{photoId}/main */
export async function setMainPhoto(officeId: number, photoId: number) {
  await api.patch(`/shared-offices/${officeId}/photos/${photoId}/main`);
}

/** 7) 사진 정렬 변경: PATCH /api/shared-offices/{officeId}/photos/reorder */
export async function reorderPhotos(officeId: number, photoIds: number[]) {
  await api.patch(`/shared-offices/${officeId}/photos/reorder`, { photoIds });
}

/** 8) 사진 삭제: DELETE /api/shared-offices/{officeId}/photos/{photoId} */
export async function deletePhoto(officeId: number, photoId: number) {
  await api.delete(`/shared-offices/${officeId}/photos/${photoId}`);
}

/** 9) 예약 신청: POST /api/shared-offices/{officeId}/reservations */
export type CreateReservationReq = {
  reserverName: string;
  reserverPhone: string;
  reserverEmail: string;
  startAt: string; // "2025-09-01T09:00:00"
  months: number;
  inquiryNote?: string;
};
export type ReservationResp = {
  id: number;
  sharedOfficeId: number;
  reserverName: string;
  reserverPhone: string;
  reserverEmail: string;
  startAt: string;
  months: number;
  inquiryNote?: string;
  createdAt: string;
};

export async function createReservation(
  officeId: number,
  body: CreateReservationReq
) {
  const { data } = await api.post<ReservationResp>(
    `/shared-offices/${officeId}/reservations`,
    body
  );
  return data;
}

/** 10) 추천: POST /api/shared-offices/recommend { location } */
export async function recommendSharedOfficesByRegion(location: string) {
  const { data } = await api.post<SharedOffice[]>(
    "/shared-offices/recommend",
    { location }
  );
  return (data ?? []).map(normalizeOffice);
}

/** ✅ 호환 alias */
export const recommendSharedOfficesByLocation =
  recommendSharedOfficesByRegion;
