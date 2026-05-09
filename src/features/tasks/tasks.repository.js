const db = require('../../db');

const COLUMNS = [
  'tasks.id', 'tasks.organization_id', 'tasks.project_id', 'tasks.assignee_id',
  'tasks.created_by', 'tasks.title', 'tasks.description', 'tasks.status',
  'tasks.priority', 'tasks.due_date', 'tasks.created_at', 'tasks.updated_at',
];

function baseQuery(orgId) {
  return db('tasks').where('tasks.organization_id', orgId).whereNull('tasks.deleted_at');
}

async function findAll(orgId, filters = {}) {
  let q = baseQuery(orgId).select(COLUMNS);
  if (filters.status) q = q.where('tasks.status', filters.status);
  if (filters.priority) q = q.where('tasks.priority', filters.priority);
  if (filters.project_id) q = q.where('tasks.project_id', filters.project_id);
  if (filters.assignee_id) q = q.where('tasks.assignee_id', filters.assignee_id);
  return q.orderBy('tasks.created_at', 'desc');
}

async function findById(orgId, id) {
  return baseQuery(orgId).select(COLUMNS).where('tasks.id', id).first();
}

async function create(orgId, userId, data) {
  const [task] = await db('tasks')
    .insert({ ...data, organization_id: orgId, created_by: userId })
    .returning(COLUMNS.map((c) => c.replace('tasks.', '')));
  return task;
}

async function update(orgId, id, data) {
  const [task] = await db('tasks')
    .where({ id, organization_id: orgId })
    .whereNull('deleted_at')
    .update({ ...data, updated_at: db.fn.now() })
    .returning(COLUMNS.map((c) => c.replace('tasks.', '')));
  return task;
}

async function softDelete(orgId, id) {
  return db('tasks')
    .where({ id, organization_id: orgId })
    .whereNull('deleted_at')
    .update({ deleted_at: db.fn.now() });
}

module.exports = { findAll, findById, create, update, softDelete };
