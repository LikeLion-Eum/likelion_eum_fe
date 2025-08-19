import api from "@/lib/api";

export async function sendLoveCall(payload: {
  fromPostId: number;
  toProfileId?: number;
  toName?: string;
  message: string;
}) {
  // 예상 스펙: POST /love-calls
  // 백엔드가 준비되지 않았을 수 있으니 실패해도 throw하지 않도록 처리하는 쪽에서 감싸 주세요.
  const { data } = await api.post("/love-calls", payload);
  return data;
}
