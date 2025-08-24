// src/services/sharedOffice.ts
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

  // UI에서 쓰는 키(선택)
  pricePerMonth?: number | null;
};

export type SharedOffice = {
  id: number;
  name: string;
  description?: string;
  roomCount: number;
  size: number;
  location: string;
  maxCount: number;

  // 호스트 정보(백엔드에 일부 없을 수 있음)
  hostBusinessName?: string;
  hostRepresentativeName?: string;
  hostAddress?: string;
  businessRegistrationNumber?: string;
  hostContact?: string;

  thumbnailUrl?: string | null;
  pricePerMonth?: number | null;   // 프론트 표준 키
  distanceNote?: string | null;
};

/** 내부: 백엔드 → 프론트 매핑 */
function mapOffice(dto: any): SharedOffice {
  if (!dto || typeof dto !== "object") return dto;
  return {
    ...dto,
    // 백엔드 feeMonthly → 프론트 pricePerMonth 로 노출
    pricePerMonth:
      dto.pricePerMonth ?? (dto.feeMonthly !== undefined ? dto.feeMonthly : null),
  };
}

/** 내부: 사진 DTO 정규화 */
export type PhotoItem = {
  id: number;
  url: string;
  caption?: string | null;
  main?: boolean;
  seq?: number;
};

function mapPhoto(p: any): PhotoItem {
  return {
    id: p?.id ?? p?.photoId,
    url: p?.url,
    caption: p?.caption ?? null,
    main: p?.main ?? p?.isMain ?? false,
    seq: p?.seq,
  };
}

/** 1) 공간 생성: POST /api/shared-offices (JSON 본문) */
export async function createSharedOffice(payload: CreateSharedOfficeReq) {
  const roomCount = Number.parseInt(String(payload.roomCount), 10);
  const size = Number.parseInt(String(payload.size), 10);
  const maxCount = Number.parseInt(String(payload.maxCount), 10);

  const hostRepresentativeName = String(payload.hostRepresentativeName ?? "").trim();
  const businessRegistrationNumber = String(payload.businessRegistrationNumber ?? "").trim();
  const hostContact = String(payload.hostContact ?? "").trim();

  const feeMonthly =
    payload.pricePerMonth === null || payload.pricePerMonth === undefined
      ? undefined
      : Number.parseInt(String(payload.pricePerMonth), 10);

  const body: Record<string, unknown> = {
    name: String(payload.name ?? "").trim(),
    description: payload.description?.toString().trim() || undefined,
    roomCount,
    size,
    location: String(payload.location ?? "").trim(),
    maxCount,
    hostRepresentativeName,
    businessRegistrationNumber,
    hostContact,
    // 백엔드가 받는 이름
    feeMonthly,
  };

  Object.keys(body).forEach((k) => {
    if (body[k] === undefined) delete body[k];
  });

  const lacks: string[] = [];
  if (!body.name) lacks.push("name");
  if (!body.location) lacks.push("location");
  if (!Number.isFinite(roomCount) || roomCount <= 0) lacks.push("roomCount");
  if (!Number.isFinite(size) || size <= 0) lacks.push("size");
  if (!Number.isFinite(maxCount) || maxCount <= 0) lacks.push("maxCount");
  if (lacks.length) throw new Error(`필수값 누락/형식 오류: ${lacks.join(", ")}`);

  try {
    // eslint-disable-next-line no-console
    console.debug("[createSharedOffice] request body =", body);
    const { data } = await api.post("/api/shared-offices", body, {
      headers: { "Content-Type": "application/json" },
    });
    return mapOffice(data);
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
    // eslint-disable-next-line no-console
    console.error("[createSharedOffice] failed:", serverMsg, {
      status,
      data,
      url: "/api/shared-offices",
    });
    throw new Error(serverMsg);
  }
}

/** 2) 공간 목록: GET /api/shared-offices  */
export type ListSharedOfficesParams = {
  page?: number; // 1-based (백엔드 컨트롤러가 1-base 받도록 구현함)
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

  // 백엔드 @GetMapping(params={"page","size"})가 1-base를 받으므로 그대로 전달
  const { data } = await api.get("/api/shared-offices", {
    params: { page, size, ...rest },
  });

  // 방어: 리스트/페이지 두 형태 모두 처리
  if (Array.isArray(data)) {
    return {
      content: data.map(mapOffice),
      totalPages: 1,
      totalElements: data.length,
      number: 0,
      size: data.length,
    } as SharedOfficePage;
  }

  return {
    ...data,
    content: Array.isArray(data?.content) ? data.content.map(mapOffice) : [],
  } as SharedOfficePage;
}

/** 3) 상세: GET /api/shared-offices/{id} */
export async function fetchSharedOffice(id: number | string) {
  const { data } = await api.get(`/api/shared-offices/${id}`);
  return mapOffice(data);
}

/** 4) 사진 업로드 – POST /api/shared-offices/{officeId}/photos (multipart)
 *  백엔드 컨트롤러는 @RequestPart("files") 를 기대
 */
export async function uploadSharedOfficePhotos(
  officeId: number,
  files: File[],
  captions?: string[]
) {
  if (!files?.length) return;
  const fd = new FormData();
  files.forEach((f) => fd.append("files", f));      // ← 필드명 files 로 변경
  if (captions?.length) captions.forEach((c) => fd.append("captions", c));
  await api.post(`/api/shared-offices/${officeId}/photos`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

/** 5) 사진 목록: GET /api/shared-offices/{officeId}/photos */
export async function listSharedOfficePhotos(officeId: number) {
  const { data } = await api.get(`/api/shared-offices/${officeId}/photos`);
  return (Array.isArray(data) ? data.map(mapPhoto) : []) as PhotoItem[];
}

/** 6) 대표사진 지정: PATCH /api/shared-offices/{officeId}/photos/{photoId}/main */
export async function setMainPhoto(officeId: number, photoId: number) {
  await api.patch(`/api/shared-offices/${officeId}/photos/${photoId}/main`);
}

/** 7) 정렬 변경: PATCH /api/shared-offices/{officeId}/photos/reorder
 *  백엔드 ReorderRequest { orders: [{ photoId, seq }] } 형태 기대
 */
export async function reorderPhotos(officeId: number, orderedPhotoIds: number[]) {
  const orders = orderedPhotoIds.map((id, idx) => ({ photoId: id, seq: idx }));
  await api.patch(`/api/shared-offices/${officeId}/photos/reorder`, { orders });
}

/** 8) 삭제: DELETE /api/shared-offices/{officeId}/photos/{photoId} */
export async function deletePhoto(officeId: number, photoId: number) {
  await api.delete(`/api/shared-offices/${officeId}/photos/${photoId}`);
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
  const { data } = await api.post<ReservationResp>(`/api/shared-offices/${officeId}/reservations`, body);
  return data;
}

/** 🔮 추천: POST /api/shared-offices/recommend { location } */
export async function recommendSharedOfficesByRegion(location: string) {
  const { data } = await api.post("/api/shared-offices/recommend", { location });
  return (Array.isArray(data) ? data.map(mapOffice) : []) as SharedOffice[];
}

/** ✅ 호환 alias */
export const recommendSharedOfficesByLocation = recommendSharedOfficesByRegion;
