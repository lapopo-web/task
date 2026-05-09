const { Router } = require('express');
const authenticate = require('../../middleware/authenticate');
const validate = require('../../middleware/validate');
const { createTaskSchema, updateTaskSchema } = require('./tasks.validation');
const ctrl = require('./tasks.controller');

const router = Router();

router.use(authenticate);

router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', validate(createTaskSchema), ctrl.create);
router.patch('/:id', validate(updateTaskSchema), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
