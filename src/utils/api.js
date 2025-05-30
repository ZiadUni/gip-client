// src/utils/api.js
import i18n from 'i18next';

const API_BASE_URL = 'https://gip-backend.onrender.com/api';

export const apiFetch = async (endpoint, options = {}) => {
  const lang = i18n.language || 'en';

  const separator = endpoint.includes('?') ? '&' : '?';
  const fullEndpoint = endpoint.replace(/^\/+/, ''); // remove starting slashes
  const url = `${API_BASE_URL}/${fullEndpoint}${separator}lang=${lang}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }

  const data = await response.json();
  return data;
};
