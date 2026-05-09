exports.up = async (knex) => {
  await knex.schema.createTable('tasks', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('organization_id').notNullable().references('id').inTable('organizations').onDelete('CASCADE');
    t.uuid('project_id').nullable().references('id').inTable('projects').onDelete('SET NULL');
    t.uuid('assignee_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    t.uuid('created_by').notNullable().references('id').inTable('users');
    t.string('title', 500).notNullable();
    t.text('description').nullable();
    t.enum('status', ['todo', 'in_progress', 'done']).notNullable().defaultTo('todo');
    t.enum('priority', ['low', 'medium', 'high']).notNullable().defaultTo('medium');
    t.date('due_date').nullable();
    t.timestamps(true, true);
    t.timestamp('deleted_at').nullable();
    t.index('organization_id');
    t.index('project_id');
    t.index('assignee_id');
    t.index('status');
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('tasks');
};
