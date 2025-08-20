// 특정 오피스 예약 목록 조회
import api from "@/lib/api";

export type OfficeReservation = {
  id: number;
  sharedOfficeId: number;
  reserverName: string;
  reserverPhone: string;
  reserverEmail: string;
  startAt: string; // ISO
  months: number;
  inquiryNote?: string | null;
  createdAt: string;
};

// GET /api/shared-offices/{officeId}/reservations
export async function fetchOfficeReservations(officeId: number) {
  const { data } = await api.get<OfficeReservation[]>(
    `/shared-offices/${officeId}/reservations`
  );
  return data ?? [];
}
