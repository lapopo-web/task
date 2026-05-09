const { Router } = require('express');
const { authLimiter } = require('../../middleware/rate-limit');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/authenticate');
const { signupSchema, loginSchema } = require('./auth.validation');
const ctrl = require('./auth.controller');

const router = Router();

router.post('/signup', authLimiter, validate(signupSchema), ctrl.signup);
router.post('/login', authLimiter, validate(loginSchema), ctrl.login);
router.post('/logout', ctrl.logout);
router.get('/me', authenticate, ctrl.me);

module.exports = router;
