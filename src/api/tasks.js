import { api } from './client';

export const tasksApi = {
  list: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/tasks${params ? `?${params}` : ''}`);
  },
  get: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.patch(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};
