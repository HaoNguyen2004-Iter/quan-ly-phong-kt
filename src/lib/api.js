// src/lib/api.js
import axios from "axios";

const base = (import.meta.env.VITE_API_BASE || "http://localhost:5234").replace(/\/+$/, "");
console.log("[API] baseURL =", base);

const api = axios.create({
  baseURL: base,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("qlkt_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("[API ERROR]", {
      url: err?.config?.url,
      method: err?.config?.method,
      status: err?.response?.status,
      data: err?.response?.data,
    });

    if (err?.response?.status === 401) {
      localStorage.removeItem("qlkt_token");
      localStorage.removeItem("qlkt_user");
      window.location.assign("/");
    }
    return Promise.reject(err);
  }
);

export default api;
