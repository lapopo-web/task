const repo = require('./tasks.repository');
const redis = require('../../cache/redis');

const CACHE_TTL = 60;

function cacheKey(orgId) {
  return `tasks:${orgId}`;
}

async function listTasks(orgId, filters) {
  const key = cacheKey(orgId);
  if (redis && !Object.keys(filters).length) {
    const cached = await redis.get(key).catch(() => null);
    if (cached) return JSON.parse(cached);
  }

  const tasks = await repo.findAll(orgId, filters);

  if (redis && !Object.keys(filters).length) {
    redis.set(key, JSON.stringify(tasks), 'EX', CACHE_TTL).catch(() => null);
  }

  return tasks;
}

async function getTask(orgId, id) {
  const task = await repo.findById(orgId, id);
  if (!task) {
    const err = new Error('Not found');
    err.status = 404;
    err.expose = true;
    throw err;
  }
  return task;
}

async function createTask(orgId, userId, data) {
  const task = await repo.create(orgId, userId, data);
  if (redis) redis.del(cacheKey(orgId)).catch(() => null);
  return task;
}

async function updateTask(orgId, id, data) {
  await getTask(orgId, id);
  const task = await repo.update(orgId, id, data);
  if (redis) redis.del(cacheKey(orgId)).catch(() => null);
  return task;
}

async function deleteTask(orgId, id) {
  await getTask(orgId, id);
  await repo.softDelete(orgId, id);
  if (redis) redis.del(cacheKey(orgId)).catch(() => null);
}

module.exports = { listTasks, getTask, createTask, updateTask, deleteTask };
