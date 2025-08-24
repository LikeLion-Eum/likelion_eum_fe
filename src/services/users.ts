// src/services/users.ts
import api from "@/lib/api";

export type UserProfile = {
  id?: number;
  userId?: number;
  name: string;
  email: string;
  location?: string;
  introduction?: string;
  skills?: string;  // 서버가 배열이면 string[] 로 변경
  career?: string;
  resumeUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

const FIXED_USER_ID = 1;

export async function fetchUser1(): Promise<UserProfile | null> {
  try {
    const { data } = await api.get(`/api/users/${FIXED_USER_ID}`);   // ✅ /api 붙임
    return data ?? null;
  } catch (e: any) {
    if (e?.response?.status === 404) return null;
    throw e;
  }
}

export async function updateUser1(payload: Partial<UserProfile>) {
  // 서버가 PATCH 미지원이면 .put(`/api/users/${FIXED_USER_ID}`, payload)
  const { data } = await api.patch(`/api/users/${FIXED_USER_ID}`, payload);  // ✅ /api 붙임
  return data as UserProfile;
}
