const request = require('supertest');
const app = require('../../app');
const db = require('../../db');

let cookie;
let cookie2;
let orgId;

beforeAll(async () => {
  await db.migrate.latest();

  const res1 = await request(app).post('/api/auth/signup').send({
    name: 'Alice', email: 'alice@tasks.test', password: 'password123', organizationName: 'Tasks Org',
  });
  cookie = res1.headers['set-cookie'];
  orgId = res1.body.id;

  const res2 = await request(app).post('/api/auth/signup').send({
    name: 'Bob', email: 'bob@tasks.test', password: 'password123', organizationName: 'Other Org',
  });
  cookie2 = res2.headers['set-cookie'];
});

afterAll(async () => {
  await db('tasks').del();
  await db('users').del();
  await db('organizations').del();
  await db.destroy();
});

describe('POST /api/tasks', () => {
  test('RED: fails without auth (401)', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'My task' });
    expect(res.status).toBe(401);
  });

  test('RED: fails without title (422)', async () => {
    const res = await request(app).post('/api/tasks').set('Cookie', cookie).send({});
    expect(res.status).toBe(422);
  });

  test('GREEN: creates task and returns 201', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Cookie', cookie)
      .send({ title: 'Write tests', priority: 'high' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Write tests');
    expect(res.body.status).toBe('todo');
    expect(res.body.priority).toBe('high');
    expect(res.body.id).toBeDefined();
  });
});

describe('GET /api/tasks/:id', () => {
  let taskId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Cookie', cookie)
      .send({ title: 'Fetch me' });
    taskId = res.body.id;
  });

  test('GREEN: returns task for owner org', async () => {
    const res = await request(app).get(`/api/tasks/${taskId}`).set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(taskId);
  });

  test('RED → 404: cross-tenant access returns 404, not 403', async () => {
    const res = await request(app).get(`/api/tasks/${taskId}`).set('Cookie', cookie2);
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/tasks/:id', () => {
  let taskId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Cookie', cookie)
      .send({ title: 'To update' });
    taskId = res.body.id;
  });

  test('updates status successfully', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set('Cookie', cookie)
      .send({ status: 'in_progress' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('in_progress');
  });

  test('returns 422 on invalid status', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set('Cookie', cookie)
      .send({ status: 'invalid' });
    expect(res.status).toBe(422);
  });
});

describe('DELETE /api/tasks/:id', () => {
  test('soft-deletes and returns 204', async () => {
    const create = await request(app)
      .post('/api/tasks')
      .set('Cookie', cookie)
      .send({ title: 'To delete' });
    const taskId = create.body.id;

    const del = await request(app).delete(`/api/tasks/${taskId}`).set('Cookie', cookie);
    expect(del.status).toBe(204);

    const get = await request(app).get(`/api/tasks/${taskId}`).set('Cookie', cookie);
    expect(get.status).toBe(404);
  });
});
