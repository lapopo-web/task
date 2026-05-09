exports.up = async (knex) => {
  await knex.schema.createTable('organizations', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('name', 255).notNullable();
    t.string('slug', 100).notNullable().unique();
    t.timestamps(true, true);
    t.timestamp('deleted_at').nullable();
  });

  await knex.schema.createTable('users', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('organization_id').notNullable().references('id').inTable('organizations').onDelete('CASCADE');
    t.string('email', 255).notNullable().unique();
    t.string('password_hash', 255).notNullable();
    t.string('name', 255).notNullable();
    t.enum('role', ['owner', 'member']).notNullable().defaultTo('member');
    t.timestamps(true, true);
    t.timestamp('deleted_at').nullable();
    t.index('organization_id');
    t.index('email');
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('organizations');
};
