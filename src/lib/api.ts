// src/lib/api.ts
import axios from "axios";

const base = (import.meta as any).env?.VITE_API_BASE || "/api";

const api = axios.create({
  baseURL: base,
  timeout: 20000,
});

export default api;
