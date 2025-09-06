// src/services/auth.js
import api from "../lib/api";

export async function login(email, password) {
  const { data } = await api.post("/api/Auth/login", { email, password });
  // data: { userId, email, fullName, role, token }
  localStorage.setItem("qlkt_token", data.token);
  localStorage.setItem(
    "qlkt_user",
    JSON.stringify({
      userId: data.userId,
      email: data.email,
      fullName: data.fullName || data.email,
      role: (data.role || "staff").toLowerCase(),
    })
  );
  return data;
}

export function getUser() {
  const raw = localStorage.getItem("qlkt_user");
  return raw ? JSON.parse(raw) : null;
}

export function logout() {
  localStorage.removeItem("qlkt_token");
  localStorage.removeItem("qlkt_user");
}
