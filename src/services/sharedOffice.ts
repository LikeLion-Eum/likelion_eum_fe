import api from "@/lib/api";

/** 생성 */
export type CreateSharedOfficeReq = {
  name: string;
  location: string;
  roomCount: number;
  size: number;
  maxCount: number;
  description?: string;
  hostRepresentativeName: string;
  businessRegistrationNumber: string; // 하이픈 유/무 허용
  hostContact: string;                 // 하이픈 유/무 허용
};

export type SharedOffice = {
  id: number;
  name: string;
  location: string;
  roomCount: number;
  size: number;
  maxCount: number;
  description?: string;
  // 호스트 정보는 상세/내부 용도일 수 있어 optional
  hostRepresentativeName?: string;
  businessRegistrationNumber?: string;
  hostContact?: string;
  // 카드 노출용 필드(백엔드에서 채워줄 수 있음)
  thumbnailUrl?: string | null;
  pricePerMonth?: number | null;
  distanceNote?: string | null; // "강남역 도보 2분" 같은 문구 (추가 예정)
};

/** 1) 공간 생성: POST /api/shared-offices */
export async function createSharedOffice(payload: CreateSharedOfficeReq) {
  const { data } = await api.post<SharedOffice>("/shared-offices", payload);
  return data;
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
