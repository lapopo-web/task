const service = require('./tasks.service');

async function list(req, res, next) {
  try {
    const { status, priority, project_id, assignee_id } = req.query;
    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (project_id) filters.project_id = project_id;
    if (assignee_id) filters.assignee_id = assignee_id;
    const tasks = await service.listTasks(req.user.org, filters);
    res.json({ data: tasks, count: tasks.length });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const task = await service.getTask(req.user.org, req.params.id);
    res.json(task);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const task = await service.createTask(req.user.org, req.user.sub, req.body);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const task = await service.updateTask(req.user.org, req.params.id, req.body);
    res.json(task);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await service.deleteTask(req.user.org, req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, update, remove };
