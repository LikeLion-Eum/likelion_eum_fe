// src/services/sharedOffice.ts
import api from "@/lib/api";
/** 내부: 백엔드 → 프론트 매핑 */
function mapOffice(dto) {
    if (!dto || typeof dto !== "object")
        return dto;
    // ✅ 백엔드(mainPhotoUrl) ↔ 프론트(thumbnailUrl) 호환 보정
    const mainPhotoUrl = dto.mainPhotoUrl ?? dto.thumbnailUrl ?? null;
    // ✅ 요금 키 보정 (feeMonthly → pricePerMonth)
    const pricePerMonth = dto.pricePerMonth ?? (dto.feeMonthly !== undefined ? dto.feeMonthly : null);
    return {
        ...dto,
        mainPhotoUrl,
        thumbnailUrl: dto.thumbnailUrl ?? mainPhotoUrl ?? null,
        pricePerMonth,
    };
}
function mapPhoto(p) {
    return {
        id: p?.id ?? p?.photoId,
        url: p?.url,
        caption: p?.caption ?? null,
        main: p?.main ?? p?.isMain ?? false,
        seq: p?.seq,
    };
}
/** 1) 공간 생성: POST /api/shared-offices (JSON 본문) */
export async function createSharedOffice(payload) {
    const roomCount = Number.parseInt(String(payload.roomCount), 10);
    const size = Number.parseInt(String(payload.size), 10);
    const maxCount = Number.parseInt(String(payload.maxCount), 10);
    const hostRepresentativeName = String(payload.hostRepresentativeName ?? "").trim();
    const businessRegistrationNumber = String(payload.businessRegistrationNumber ?? "").trim();
    const hostContact = String(payload.hostContact ?? "").trim();
    const feeMonthly = payload.pricePerMonth === null || payload.pricePerMonth === undefined
        ? undefined
        : Number.parseInt(String(payload.pricePerMonth), 10);
    const body = {
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
        if (body[k] === undefined)
            delete body[k];
    });
    const lacks = [];
    if (!body.name)
        lacks.push("name");
    if (!body.location)
        lacks.push("location");
    if (!Number.isFinite(roomCount) || roomCount <= 0)
        lacks.push("roomCount");
    if (!Number.isFinite(size) || size <= 0)
        lacks.push("size");
    if (!Number.isFinite(maxCount) || maxCount <= 0)
        lacks.push("maxCount");
    if (lacks.length)
        throw new Error(`필수값 누락/형식 오류: ${lacks.join(", ")}`);
    try {
        // eslint-disable-next-line no-console
        console.debug("[createSharedOffice] request body =", body);
        const { data } = await api.post("/api/shared-offices", body, {
            headers: { "Content-Type": "application/json" },
        });
        return mapOffice(data);
    }
    catch (err) {
        const status = err?.response?.status;
        const data = err?.response?.data;
        const serverMsg = data?.error ||
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
export async function listSharedOffices(params = {}) {
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
        };
    }
    return {
        ...data,
        content: Array.isArray(data?.content) ? data.content.map(mapOffice) : [],
    };
}
/** 3) 상세: GET /api/shared-offices/{id} */
export async function fetchSharedOffice(id) {
    const { data } = await api.get(`/api/shared-offices/${id}`);
    return mapOffice(data);
}
/** 4) 사진 업로드 – POST /api/shared-offices/{officeId}/photos (multipart)
 *  백엔드 컨트롤러는 @RequestPart("files") 를 기대
 */
export async function uploadSharedOfficePhotos(officeId, files, captions) {
    if (!files?.length)
        return;
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f)); // ← 필드명 files
    if (captions?.length)
        captions.forEach((c) => fd.append("captions", c));
    await api.post(`/api/shared-offices/${officeId}/photos`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
    });
}
/** 5) 사진 목록: GET /api/shared-offices/{officeId}/photos */
export async function listSharedOfficePhotos(officeId) {
    const { data } = await api.get(`/api/shared-offices/${officeId}/photos`);
    return (Array.isArray(data) ? data.map(mapPhoto) : []);
}
/** 6) 대표사진 지정: PATCH /api/shared-offices/{officeId}/photos/{photoId}/main */
export async function setMainPhoto(officeId, photoId) {
    await api.patch(`/api/shared-offices/${officeId}/photos/${photoId}/main`);
}
/** 7) 정렬 변경: PATCH /api/shared-offices/{officeId}/photos/reorder
 *  백엔드 ReorderRequest { orders: [{ photoId, seq }] } 형태 기대
 */
export async function reorderPhotos(officeId, orderedPhotoIds) {
    const orders = orderedPhotoIds.map((id, idx) => ({ photoId: id, seq: idx }));
    await api.patch(`/api/shared-offices/${officeId}/photos/reorder`, { orders });
}
/** 8) 삭제: DELETE /api/shared-offices/{officeId}/photos/{photoId} */
export async function deletePhoto(officeId, photoId) {
    await api.delete(`/api/shared-offices/${officeId}/photos/${photoId}`);
}
export async function createReservation(officeId, body) {
    const { data } = await api.post(`/api/shared-offices/${officeId}/reservations`, body);
    return data;
}
/** 🔮 추천: POST /api/shared-offices/recommend { location } */
export async function recommendSharedOfficesByRegion(location) {
    const { data } = await api.post("/api/shared-offices/recommend", { location });
    return (Array.isArray(data) ? data.map(mapOffice) : []);
}
/** ✅ 호환 alias */
export const recommendSharedOfficesByLocation = recommendSharedOfficesByRegion;
