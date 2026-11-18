import api from './api.js';

export function extractApiError(error, fallbackMessage = 'Something went wrong. Please try again.') {
  const responseData = error?.response?.data;

  if (responseData) {
    return {
      message: responseData.message || fallbackMessage,
      fieldErrors:
        responseData.errors && typeof responseData.errors === 'object' ? responseData.errors : {},
      statusCode: error.response?.status || 500,
    };
  }

  return {
    message: error?.message || fallbackMessage,
    fieldErrors: {},
    statusCode: 0,
  };
}

export async function registerUser(payload) {
  const response = await api.post('/auth/register', payload);
  return response.data;
}

export async function loginUser(payload) {
  const response = await api.post('/auth/login', payload);
  return response.data;
}

export async function fetchCurrentUser() {
  const response = await api.get('/auth/me');
  return response.data;
}

export async function logoutUser() {
  const response = await api.post('/auth/logout');
  return response.data;
}
