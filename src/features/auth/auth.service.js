const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const db = require('../../db');

async function signup({ name, email, password, organizationName }) {
  const existing = await db('users').where({ email }).whereNull('deleted_at').first();
  if (existing) {
    const err = new Error('Email already in use');
    err.status = 409;
    err.expose = true;
    throw err;
  }

  const orgId = uuidv4();
  const userId = uuidv4();
  const slug = organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + orgId.slice(0, 6);
  const passwordHash = await bcrypt.hash(password, 12);

  await db.transaction(async (trx) => {
    await trx('organizations').insert({ id: orgId, name: organizationName, slug });
    await trx('users').insert({
      id: userId,
      organization_id: orgId,
      email,
      password_hash: passwordHash,
      name,
      role: 'owner',
    });
  });

  return db('users').where({ id: userId }).first();
}

async function login({ email, password }) {
  const user = await db('users').where({ email }).whereNull('deleted_at').first();
  if (!user) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    err.expose = true;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    err.expose = true;
    throw err;
  }

  return user;
}

async function getById(id) {
  return db('users')
    .select('id', 'email', 'name', 'role', 'organization_id')
    .where({ id })
    .whereNull('deleted_at')
    .first();
}

module.exports = { signup, login, getById };
