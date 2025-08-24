import axios from "axios";
// 👉 환경변수 안쓰고 서버 주소 고정
const api = axios.create({
    baseURL: "http://13.124.230.207", // ✅ 백엔드 주소 + /api
    withCredentials: false,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "ngrok-skip-browser-warning": "true",
    },
});
// 응답 인터셉터
api.interceptors.response.use((res) => res, (err) => {
    const msg = err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "요청 중 오류가 발생했습니다.";
    return Promise.reject(new Error(msg));
});
export default api;
