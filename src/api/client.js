const BASE = '/api';
const COLD_START_RETRIES = 6;   // 6 × 5 s = 30 s max (Render free cold-start)
const COLD_START_DELAY_MS = 5000;

async function request(method, path, body, _retries = COLD_START_RETRIES) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  // Render free tier returns an HTML page while cold-starting.
  // Retry transparently until the server is ready.
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    if (_retries > 0) {
      await new Promise((r) => setTimeout(r, COLD_START_DELAY_MS));
      return request(method, path, body, _retries - 1);
    }
    const err = new Error('Server is starting up — please refresh in a moment.');
    err.status = 503;
    throw err;
  }

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || 'Request failed');
    err.status = res.status;
    err.details = data.details;
    throw err;
  }
  return data;
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
};
