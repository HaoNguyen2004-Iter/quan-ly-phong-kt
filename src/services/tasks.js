// src/services/tasks.js
import api from '../lib/api';
import { mapTaskFromApi, mapTaskToApiCreate, mapTaskToApiUpdate } from './mapper';

// ADMIN
export const getAdminTasks = async (params = {}) => {
  // BE đã có alias GET /api/Tasks cho admin
  const { data } = await api.get('/api/Tasks', { params });
  return Array.isArray(data) ? data.map(mapTaskFromApi) : [];
};

export const getTaskById = async (id) => {
  const { data } = await api.get(`/api/Tasks/${id}`);
  return mapTaskFromApi(data);
};

export const createTask = async (payload) => {
  const dto = mapTaskToApiCreate(payload);
  const { data } = await api.post('/api/Tasks', dto);
  return mapTaskFromApi(data);
};

export const updateTask = async (id, patch) => {
  const dto = mapTaskToApiUpdate(patch);
  // BE hỗ trợ cả PUT & PATCH, giữ nguyên PUT theo FE cũ
  const { data } = await api.put(`/api/Tasks/${id}`, dto);
  return mapTaskFromApi(data);
};

export const deleteTask = async (id) => {
  await api.delete(`/api/Tasks/${id}`);
  return true;
};

// STAFF (của tôi)
export const getMyTasks = async () => {
  const { data } = await api.get('/api/Tasks/my');
  return Array.isArray(data) ? data.map(mapTaskFromApi) : [];
};

export const completeTask = async (id) => {
  const { data } = await api.post(`/api/Tasks/${id}/complete`);
  return mapTaskFromApi(data);
};
