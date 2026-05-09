exports.up = async (knex) => {
  await knex.schema.createTable('projects', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('organization_id').notNullable().references('id').inTable('organizations').onDelete('CASCADE');
    t.string('name', 255).notNullable();
    t.text('description').nullable();
    t.timestamps(true, true);
    t.timestamp('deleted_at').nullable();
    t.index('organization_id');
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('projects');
};
