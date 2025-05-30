import i18n from 'i18next';

const API_BASE_URL = 'https://gip-backend.onrender.com/api';

const api = async (endpoint, options = {}) => {
  const lang = i18n.language || 'en';
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${API_BASE_URL}${endpoint}${separator}lang=${lang}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const data = await res.json();
  return { status: res.status, data };
};

export const apiFetch = api;
