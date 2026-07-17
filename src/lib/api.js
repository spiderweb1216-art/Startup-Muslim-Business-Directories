const defaultApiUrl = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api';
const API_URL = (process.env.REACT_APP_API_URL || defaultApiUrl).replace(/\/$/, '');
const TOKEN_KEY = 'csl_mysql_auth_token_v3';
const USER_KEY = 'csl_mysql_auth_user_v3';

export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; }
};
export const getCachedUser = () => {
  try { const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
};
export const storeSession = (token, user, remember = true) => {
  const primary = remember ? localStorage : sessionStorage;
  const secondary = remember ? sessionStorage : localStorage;
  try {
    primary.setItem(TOKEN_KEY, token);
    primary.setItem(USER_KEY, JSON.stringify(user));
    secondary.removeItem(TOKEN_KEY);
    secondary.removeItem(USER_KEY);
  } catch {}
};
export const clearSession = () => {
  try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); sessionStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(USER_KEY); } catch {}
};

export async function api(path, options = {}) {
  const { method = 'GET', body, auth = true, headers = {} } = options;
  const token = getToken();
  const response = await fetch(`${API_URL}${path.startsWith('/') ? path : `/${path}`}`, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type':'application/json' } : {}),
      ...(auth && token ? { Authorization:`Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (response.status === 204) return null;
  let payload = {};
  try { payload = await response.json(); } catch {}
  if (!response.ok) {
    const error = new Error(payload.message || `Request failed with status ${response.status}.`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

export { API_URL };
