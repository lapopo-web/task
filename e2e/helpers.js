const BASE_API = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8080';

async function resetDb() {
  const res = await fetch(`${BASE_API}/api/test/reset-db`, { method: 'POST' });
  if (!res.ok) throw new Error('DB reset failed');
}

async function apiSignup(data) {
  const res = await fetch(`${BASE_API}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Signup failed: ' + await res.text());
  return res.json();
}

module.exports = { resetDb, apiSignup };
