import api from "@/lib/api";

/** 생성 (앱 내부 폼 타입) */
export type CreateSharedOfficeReq = {
  name: string;
  location: string;
  roomCount: number;
  size: number;
  maxCount: number;
  description?: string;

  hostRepresentativeName?: string;
  businessRegistrationNumber?: string;
  hostContact?: string;
};

export type SharedOffice = {  
  name: string;
  description?: string;            // 선택
  roomCount: number;               // 방 개수
  size: number;                    // 면적(예: 200)
  location: string;                // "충남 아산시 중앙로 123"
  maxCount: number;                // 최대 수용 인원

  // 호스트(사업자) 정보
  hostBusinessName: string;        // "주식회사 샘플"
  hostRepresentativeName: string;  // "홍길동"
  hostAddress: string;             // "충남 아산시 ..."
  businessRegistrationNumber: string; // "123-45-67890" 또는 "1234567890"
  hostContact: string;             // "01012345678" 또는 "010-1234-5678"


  // 카드 노출용 (없을 수 있음)
  thumbnailUrl?: string | null;
  pricePerMonth?: number | null;
  distanceNote?: string | null; // "강남역 도보 2분" 같은 문구
};

/** 서버 생성 API가 허용하는 필드만 전송하기 위한 내부 타입 */
type CreateSharedOfficeApiReq = {
  name: string;
  description?: string;
  roomCount: number;
  size: number;
  location: string;
  maxCount: number;
};

/** 1) 공간 생성: POST /api/shared-offices
 * - 백엔드 스펙: { name, description?, roomCount, size, location, maxCount }
 * - 폼에서 받은 payload에서 허용된 필드만 추려서 보냄
 */
export async function createSharedOffice(payload: CreateSharedOfficeReq) {
  // 1) 안전 보정: 문자열 trim + 정수 변환
  const roomCount = Number.parseInt(String(payload.roomCount), 10);
  const size = Number.parseInt(String(payload.size), 10);
  const maxCount = Number.parseInt(String(payload.maxCount), 10);

  const body = {
    name: String(payload.name ?? "").trim(),
    description: payload.description?.toString().trim() || undefined,
    roomCount,
    size,
    location: String(payload.location ?? "").trim(),
    maxCount,
  } as Record<string, unknown>;

  // 2) undefined 필드 제거(서버가 undefined를 싫어할 수 있음)
  Object.keys(body).forEach((k) => {
    if (body[k] === undefined) delete body[k];
  });

  // 3) 클라이언트측 필수 검증(서버 400 대신 미리 걸러줌)
  const lacks: string[] = [];
  if (!body.name) lacks.push("name");
  if (!body.location) lacks.push("location");
  if (!Number.isFinite(roomCount) || roomCount <= 0) lacks.push("roomCount");
  if (!Number.isFinite(size) || size <= 0) lacks.push("size");
  if (!Number.isFinite(maxCount) || maxCount <= 0) lacks.push("maxCount");
  if (lacks.length) {
    // 개발 중 원인 확인을 쉽게 하기 위해 에러 throw
    throw new Error(`필수값 누락/형식 오류: ${lacks.join(", ")}`);
  }

  try {
    // 4) 호출 직전 페이로드 확인(개발 단계에서만 남겨두고, 운영에선 제거)
    // eslint-disable-next-line no-console
    console.debug("[createSharedOffice] request body =", body);

    const { data } = await api.post<SharedOffice>("/shared-offices", body, {
      headers: { "Content-Type": "application/json" },
    });
    return data;
  } catch (err: any) {
  const status = err?.response?.status;
  const data = err?.response?.data;
  const serverMsg =
    data?.error ||
    data?.message ||
    (typeof data === "string" ? data : "") ||
    (status ? `HTTP ${status}` : "") ||
    err?.message ||
    "서버 오류가 발생했습니다.";

  // 상세 로그
  // eslint-disable-next-line no-console
  console.error("[createSharedOffice] failed:", serverMsg, {
    status,
    data,
    url: "/shared-offices",
  });

  throw new Error(serverMsg);
}
}

/** 2) 공간 목록: GET /api/shared-offices  (+ 필터/페이징 확장 여지) */
export type ListSharedOfficesParams = {
  page?: number; // 1-based
  size?: number;
  si?: string;   // 서울/충남...
  gu?: string;   // 강남구/아산시...
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
  return data;
}

/** 3) 상세: GET /api/shared-offices/{id} */
export async function fetchSharedOffice(id: number | string) {
  const { data } = await api.get<SharedOffice>(`/shared-offices/${id}`);
  return data;
}

/** 4) 사진 업로드 – POST /api/shared-offices/{officeId}/photos (multipart) */
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
export type PhotoItem = {
  id: number;         // long
  url: string;
  caption?: string | null;
  main?: boolean;
  seq?: number;
};
export async function listSharedOfficePhotos(officeId: number) {
  const { data } = await api.get<PhotoItem[]>(`/shared-offices/${officeId}/photos`);
  return data ?? [];
}

/** 6) 대표사진 지정: PATCH /api/shared-offices/{officeId}/photos/{photoId}/main */
export async function setMainPhoto(officeId: number, photoId: number) {
  await api.patch(`/shared-offices/${officeId}/photos/${photoId}/main`);
}

/** 7) 정렬 변경: PATCH /api/shared-offices/{officeId}/photos/reorder  (photoIds: long[]) */
export async function reorderPhotos(officeId: number, photoIds: number[]) {
  await api.patch(`/shared-offices/${officeId}/photos/reorder`, { photoIds });
}

/** 8) 삭제: DELETE /api/shared-offices/{officeId}/photos/{photoId} */
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

export async function createReservation(officeId: number, body: CreateReservationReq) {
  const { data } = await api.post<ReservationResp>(`/shared-offices/${officeId}/reservations`, body);
  return data;
}

/** 🔮 추천: POST /api/shared-offices/recommend { location } */
export async function recommendSharedOfficesByRegion(location: string) {
  const { data } = await api.post<SharedOffice[]>("/shared-offices/recommend", { location });
  return data ?? [];
}

/** ✅ 호환용 alias: AiRecommend.tsx에서 쓰는 이름과 매핑 */
export const recommendSharedOfficesByLocation = recommendSharedOfficesByRegion;
