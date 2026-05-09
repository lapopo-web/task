const request = require('supertest');
const app = require('../../app');
const db = require('../../db');

beforeAll(async () => {
  await db.migrate.latest();
});

afterEach(async () => {
  await db('users').del();
  await db('organizations').del();
});

afterAll(async () => {
  await db.destroy();
});

const validSignup = {
  name: 'Alice Martin',
  email: 'alice@example.com',
  password: 'password123',
  organizationName: 'Test Org',
};

describe('POST /api/auth/signup', () => {
  test('creates user and returns 201 with cookie', async () => {
    const res = await request(app).post('/api/auth/signup').send(validSignup);
    expect(res.status).toBe(201);
    expect(res.body.email).toBe('alice@example.com');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  test('returns 422 when email is missing', async () => {
    const { email, ...body } = validSignup;
    const res = await request(app).post('/api/auth/signup').send(body);
    expect(res.status).toBe(422);
    expect(res.body.details).toBeDefined();
  });

  test('returns 422 when password is too short', async () => {
    const res = await request(app).post('/api/auth/signup').send({ ...validSignup, password: 'short' });
    expect(res.status).toBe(422);
  });

  test('returns 409 when email already exists', async () => {
    await request(app).post('/api/auth/signup').send(validSignup);
    const res = await request(app).post('/api/auth/signup').send(validSignup);
    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/signup').send(validSignup);
  });

  test('returns 200 with token cookie on valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: validSignup.email,
      password: validSignup.password,
    });
    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  test('returns 401 on wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: validSignup.email,
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
  });

  test('returns 401 on unknown email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  test('returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('returns user data when authenticated', async () => {
    const signup = await request(app).post('/api/auth/signup').send(validSignup);
    const cookie = signup.headers['set-cookie'];
    const res = await request(app).get('/api/auth/me').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.id).toBeDefined();
  });
});
