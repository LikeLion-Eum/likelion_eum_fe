import api from "@/lib/api";
/** 사진 목록 조회 */
export async function listSharedOfficePhotos(officeId) {
    const { data } = await api.get(`/api/shared-offices/${officeId}/photos`);
    return data;
}
/** 사진 여러 장 업로드 (files[], captions[]) */
export async function uploadSharedOfficePhotos(officeId, files, captions) {
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));
    (captions ?? []).forEach((c) => fd.append("captions", c));
    const { data } = await api.post(`/api/shared-offices/${officeId}/photos`, fd, { headers: { "Content-Type": "multipart/form-data" } });
    return data;
}
/** 대표 사진 지정 */
export async function setMainSharedOfficePhoto(officeId, photoId) {
    await api.patch(`/api/shared-offices/${officeId}/photos/${photoId}/main`);
}
/** 순서 변경: 서버 ReorderRequest는 { ids: Long[] } */
export async function reorderSharedOfficePhotos(officeId, ids) {
    await api.patch(`/api/shared-offices/${officeId}/photos/reorder`, { ids });
}
/** 사진 삭제 */
export async function deleteSharedOfficePhoto(officeId, photoId) {
    await api.delete(`/api/shared-offices/${officeId}/photos/${photoId}`);
}
