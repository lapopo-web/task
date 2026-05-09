const Joi = require('joi');

const createTaskSchema = Joi.object({
  title: Joi.string().min(1).max(500).required(),
  description: Joi.string().max(5000).optional().allow(''),
  status: Joi.string().valid('todo', 'in_progress', 'done').default('todo'),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
  project_id: Joi.string().uuid().optional().allow(null),
  assignee_id: Joi.string().uuid().optional().allow(null),
  due_date: Joi.date().iso().optional().allow(null),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().min(1).max(500).optional(),
  description: Joi.string().max(5000).optional().allow(''),
  status: Joi.string().valid('todo', 'in_progress', 'done').optional(),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
  project_id: Joi.string().uuid().optional().allow(null),
  assignee_id: Joi.string().uuid().optional().allow(null),
  due_date: Joi.date().iso().optional().allow(null),
}).min(1);

module.exports = { createTaskSchema, updateTaskSchema };
