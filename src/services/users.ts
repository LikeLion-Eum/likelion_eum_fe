// 내 정보(프로필) 생성/수정 API
import api from "@/lib/api";

export type UserProfile = {
  id?: number;         // 생성 응답에 존재
  userId?: number;     // 수정 응답에 존재 가능
  name: string;
  email: string;
  location?: string;
  introduction?: string;
  skills?: string;
  career?: string;
  resumeUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

// 생성: POST /api/users
export async function createUserProfile(payload: Omit<UserProfile, "id"|"userId"|"createdAt"|"updatedAt">) {
  const { data } = await api.post<UserProfile>("/users", payload);
  return data;
}

// 수정: PATCH /api/users/{id}
export async function updateUserProfile(id: number, payload: Partial<UserProfile>) {
  const { data } = await api.patch<UserProfile>(`/users/${id}`, payload);
  return data;
}
