const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export async function fetchAuthAccess(token) {
  return fetch(`${API_BASE}/auth/access`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

