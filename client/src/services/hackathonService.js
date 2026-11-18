import api from './api.js';

export async function fetchHackathons(params = {}) {
  const cleanParams = {};

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      cleanParams[key] = value;
    }
  }

  const response = await api.get('/hackathons', { params: cleanParams });
  return response.data;
}

export async function fetchHackathonBySlug(slug) {
  const response = await api.get(`/hackathons/${encodeURIComponent(slug)}`);
  return response.data;
}

export async function createHackathon(payload) {
  const response = await api.post('/hackathons', payload);
  return response.data;
}

export async function updateHackathon(id, payload) {
  const response = await api.patch(`/hackathons/${encodeURIComponent(id)}`, payload);
  return response.data;
}

export async function deleteHackathon(id) {
  const response = await api.delete(`/hackathons/${encodeURIComponent(id)}`);
  return response.data;
}
