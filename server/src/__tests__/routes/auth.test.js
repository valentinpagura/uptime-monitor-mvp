const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const createApp = require('../../app');

process.env.JWT_SECRET = 'test-secret';

function createMockPool() {
  const query = vi.fn();
  return { query, on: vi.fn(), end: vi.fn() };
}

describe('POST /auth/register', () => {
  let mockPool;
  let app;

  beforeEach(() => {
    mockPool = createMockPool();
    app = createApp(mockPool);
  });

  it('registers a new user and returns token', async () => {
    mockPool.query.mockResolvedValue({
      rows: [{ id: 1, email: 'new@example.com', fecha_registro: new Date().toISOString() }],
    });

    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'new@example.com', password: '123456' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.usuario.email).toBe('new@example.com');
  });

  it('rejects missing fields', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'test@example.com' });

    expect(res.status).toBe(400);
  });

  it('rejects invalid email', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'bad-email', password: '123456' });

    expect(res.status).toBe(400);
  });

  it('rejects short password', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'test@example.com', password: '12345' });

    expect(res.status).toBe(400);
  });

  it('handles duplicate email gracefully', async () => {
    mockPool.query.mockRejectedValue({ code: '23505' });

    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'dup@example.com', password: '123456' });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/registrado/i);
  });
});

describe('POST /auth/login', () => {
  let mockPool;
  let app;

  beforeEach(() => {
    mockPool = createMockPool();
    app = createApp(mockPool);
  });

  it('logs in with valid credentials', async () => {
    const hashedPassword = bcrypt.hashSync('123456', 10);
    mockPool.query.mockResolvedValue({
      rows: [{ id: 1, email: 'test@example.com', password: hashedPassword, fecha_registro: new Date().toISOString() }],
    });

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: '123456' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.usuario.email).toBe('test@example.com');
  });

  it('rejects wrong password', async () => {
    const hashedPassword = bcrypt.hashSync('correctpass', 10);
    mockPool.query.mockResolvedValue({
      rows: [{ id: 1, email: 'test@example.com', password: hashedPassword, fecha_registro: new Date().toISOString() }],
    });

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpass' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/contraseña/i);
  });

  it('rejects non-existent user', async () => {
    mockPool.query.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'nobody@example.com', password: '123456' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/no encontrado/i);
  });

  it('rejects missing fields', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com' });

    expect(res.status).toBe(400);
  });
});
