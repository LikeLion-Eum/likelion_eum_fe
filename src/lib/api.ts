import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE, // https://<...>.ngrok-free.app/api
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "ngrok-skip-browser-warning": "true",  // ✅ ngrok 인터스티셜 우회
  },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      "요청 중 오류가 발생했습니다.";
    return Promise.reject(new Error(msg));
  }
);

export default api;
