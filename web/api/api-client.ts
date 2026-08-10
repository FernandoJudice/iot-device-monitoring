import { clearToken, getAccessToken } from './auth/tokenStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  const token = getAccessToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 401) {
    clearToken();
  }

  return response;
}

export function getWebSocketUrl(path: string) {
  const token = getAccessToken();
  const url = new URL(`${API_URL}${path}`);

  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';

  if (token) {
    url.searchParams.set('token', token);
  }

  return url.toString();
}