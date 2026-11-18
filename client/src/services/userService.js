import api from './api.js';

export async function fetchMyProfile() {
  const response = await api.get('/users/me');
  return response.data;
}

export async function updateMyProfile(payload) {
  const response = await api.patch('/users/me', payload);
  return response.data;
}

export async function fetchPublicUserProfile(userId) {
  const response = await api.get(`/users/${userId}`);
  return response.data;
}
