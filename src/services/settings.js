import api from "../lib/api";

export async function getMySettings() {
  const { data } = await api.get("/api/Settings/me");
  return data;
}

export async function updateMySettings(payload) {
  const { data } = await api.put("/api/Settings/me", payload);
  return data;
}
