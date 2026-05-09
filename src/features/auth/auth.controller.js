const authService = require('./auth.service');
const { signToken, setTokenCookie, clearTokenCookie } = require('./jwt');

async function signup(req, res, next) {
  try {
    const user = await authService.signup(req.body);
    const token = signToken({ sub: user.id, org: user.organization_id, role: user.role });
    setTokenCookie(res, token);
    res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const user = await authService.login(req.body);
    const token = signToken({ sub: user.id, org: user.organization_id, role: user.role });
    setTokenCookie(res, token);
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (err) {
    next(err);
  }
}

function logout(req, res) {
  clearTokenCookie(res);
  res.json({ message: 'Logged out' });
}

async function me(req, res, next) {
  try {
    const user = await authService.getById(req.user.sub);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role, org: req.user.org });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login, logout, me };
