const { Router } = require('express');
const db = require('../db');

const router = Router();

router.post('/reset-db', async (req, res, next) => {
  try {
    await db('tasks').del();
    await db('projects').del();
    await db('users').del();
    await db('organizations').del();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
