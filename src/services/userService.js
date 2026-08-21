import { api } from './apiClient.js';

export async function getUsers() {
  try {
    const res = await api.get('/users');
    return res.data || [];
  } catch (err) {
    return [];
  }
}

export async function getUser(id) {
  const res = await api.get(`/users/${id}`);
  return res.data;
}

export async function createUser(data) {
  const res = await api.post('/users', data);
  return res.data;
}

export async function updateUser(id, data) {
  const res = await api.put(`/users/${id}`, data);
  return res.data;
}

export async function deactivateUser(id) {
  const res = await api.patch(`/users/${id}/suspend`);
  return res.data;
}

export function canDelete(id) {
  return { canDelete: false, reason: 'Users cannot be deleted due to audit requirements.' };
}
