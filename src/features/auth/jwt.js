const jwt = require('jsonwebtoken');

const isProd = process.env.COOKIE_SECURE === 'true';

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: isProd ? 'none' : 'lax',
  secure: isProd,
  domain: process.env.COOKIE_DOMAIN || 'localhost',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function setTokenCookie(res, token) {
  res.cookie('token', token, COOKIE_OPTS);
}

function clearTokenCookie(res) {
  res.clearCookie('token', { ...COOKIE_OPTS, maxAge: 0 });
}

module.exports = { signToken, setTokenCookie, clearTokenCookie };
