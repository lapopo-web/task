const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

exports.seed = async (knex) => {
  await knex('tasks').del();
  await knex('projects').del();
  await knex('users').del();
  await knex('organizations').del();

  const org1Id = uuidv4();
  const org2Id = uuidv4();
  const user1Id = uuidv4();
  const user2Id = uuidv4();
  const user3Id = uuidv4();
  const proj1Id = uuidv4();
  const proj2Id = uuidv4();

  await knex('organizations').insert([
    { id: org1Id, name: 'Acme Corp', slug: 'acme' },
    { id: org2Id, name: 'Globex Inc', slug: 'globex' },
  ]);

  const hash = await bcrypt.hash('password123', 12);

  await knex('users').insert([
    { id: user1Id, organization_id: org1Id, email: 'alice@acme.com', password_hash: hash, name: 'Alice Martin', role: 'owner' },
    { id: user2Id, organization_id: org1Id, email: 'bob@acme.com', password_hash: hash, name: 'Bob Dupont', role: 'member' },
    { id: user3Id, organization_id: org2Id, email: 'carol@globex.com', password_hash: hash, name: 'Carol Smith', role: 'owner' },
  ]);

  await knex('projects').insert([
    { id: proj1Id, organization_id: org1Id, name: 'Project Alpha', description: 'Main project for Acme' },
    { id: proj2Id, organization_id: org2Id, name: 'Project Beta', description: 'Main project for Globex' },
  ]);

  const statuses = ['todo', 'in_progress', 'done'];
  const priorities = ['low', 'medium', 'high'];

  const acmeTasks = Array.from({ length: 10 }, (_, i) => ({
    id: uuidv4(),
    organization_id: org1Id,
    project_id: proj1Id,
    created_by: user1Id,
    assignee_id: i % 2 === 0 ? user1Id : user2Id,
    title: `Acme Task ${i + 1}`,
    description: `Description for Acme task ${i + 1}`,
    status: statuses[i % 3],
    priority: priorities[i % 3],
  }));

  const globexTasks = Array.from({ length: 10 }, (_, i) => ({
    id: uuidv4(),
    organization_id: org2Id,
    project_id: proj2Id,
    created_by: user3Id,
    assignee_id: user3Id,
    title: `Globex Task ${i + 1}`,
    description: `Description for Globex task ${i + 1}`,
    status: statuses[i % 3],
    priority: priorities[i % 3],
  }));

  await knex('tasks').insert([...acmeTasks, ...globexTasks]);
};
