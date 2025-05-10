const API_BASE = import.meta.env.VITE_API_URL;

export const apiFetch = (endpoint, options = {}) => {
  const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  const path = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  return fetch(base + path, options);
};
