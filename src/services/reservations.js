// 특정 오피스 예약 목록 조회
import api from "@/lib/api";
// GET /api/shared-offices/{officeId}/reservations
export async function fetchOfficeReservations(officeId) {
    const { data } = await api.get(`/api/shared-offices/${officeId}/reservations`);
    return data ?? [];
}
