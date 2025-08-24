import api from "@/lib/api";

/** 서버가 주는 사진 항목 */
export type PhotoItem = {
  id: number;        // Long (photoId)
  url: string;       // 표시용 이미지 URL
  caption?: string;
  main?: boolean;    // 대표 여부
  seq?: number;      // 정렬 순서
};

export type UploadPhotosResponse = {
  items: PhotoItem[];
};

/** 사진 목록 조회 */
export async function listSharedOfficePhotos(officeId: number) {
  const { data } = await api.get<PhotoItem[]>(
    `/api/shared-offices/${officeId}/photos`
  );
  return data;
}

/** 사진 여러 장 업로드 (files[], captions[]) */
export async function uploadSharedOfficePhotos(
  officeId: number,
  files: File[],
  captions?: string[]
) {
  const fd = new FormData();
  files.forEach((f) => fd.append("files", f));
  (captions ?? []).forEach((c) => fd.append("captions", c));

  const { data } = await api.post<UploadPhotosResponse>(
    `/api/shared-offices/${officeId}/photos`,
    fd,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

/** 대표 사진 지정 */
export async function setMainSharedOfficePhoto(
  officeId: number,
  photoId: number
) {
  await api.patch(`/api/shared-offices/${officeId}/photos/${photoId}/main`);
}

/** 순서 변경: 서버 ReorderRequest는 { ids: Long[] } */
export async function reorderSharedOfficePhotos(
  officeId: number,
  ids: number[]
) {
  await api.patch(`/api/shared-offices/${officeId}/photos/reorder`, { ids });
}

/** 사진 삭제 */
export async function deleteSharedOfficePhoto(
  officeId: number,
  photoId: number
) {
  await api.delete(`/api/shared-offices/${officeId}/photos/${photoId}`);
}
