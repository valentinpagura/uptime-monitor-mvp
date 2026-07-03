const request = require('supertest');
const jwt = require('jsonwebtoken');
const createApp = require('../../app');

process.env.JWT_SECRET = 'test-secret';

function createMockPool() {
  const query = vi.fn();
  return { query, on: vi.fn(), end: vi.fn() };
}

function makeToken(overrides = {}) {
  return jwt.sign(
    { id: overrides.id || 1, email: overrides.email || 'user@example.com' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

describe('POST /sitios', () => {
  let mockPool;
  let app;

  beforeEach(() => {
    mockPool = createMockPool();
    app = createApp(mockPool);
  });

  it('creates a sitio for authenticated user', async () => {
    mockPool.query.mockResolvedValue({
      rows: [{ id: 1, usuario_id: 1, url: 'https://example.com', nombre: 'Example', frecuencia_minutos: 5 }],
    });

    const res = await request(app)
      .post('/sitios')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ url: 'https://example.com', nombre: 'Example' });

    expect(res.status).toBe(201);
    expect(res.body.sitio.url).toBe('https://example.com');
  });

  it('rejects missing url', async () => {
    const res = await request(app)
      .post('/sitios')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ nombre: 'No URL' });

    expect(res.status).toBe(400);
  });

  it('rejects invalid url format', async () => {
    const res = await request(app)
      .post('/sitios')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ url: 'not-a-url' });

    expect(res.status).toBe(400);
  });

  it('rejects request without token', async () => {
    const res = await request(app)
      .post('/sitios')
      .send({ url: 'https://example.com' });

    expect(res.status).toBe(401);
  });

  it('rejects invalid token', async () => {
    const res = await request(app)
      .post('/sitios')
      .set('Authorization', 'Bearer bad-token')
      .send({ url: 'https://example.com' });

    expect(res.status).toBe(401);
  });
});

describe('GET /sitios', () => {
  let mockPool;
  let app;

  beforeEach(() => {
    mockPool = createMockPool();
    app = createApp(mockPool);
  });

  it('lists sitios for authenticated user', async () => {
    mockPool.query.mockResolvedValue({
      rows: [
        { id: 1, usuario_id: 1, url: 'https://example.com', nombre: 'Example', frecuencia_minutos: 5 },
        { id: 2, usuario_id: 1, url: 'https://google.com', nombre: 'Google', frecuencia_minutos: 5 },
      ],
    });

    const res = await request(app)
      .get('/sitios')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.sitios).toHaveLength(2);
  });

  it('returns empty array when no sitios', async () => {
    mockPool.query.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .get('/sitios')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.sitios).toEqual([]);
  });
});

describe('DELETE /sitios/:id', () => {
  let mockPool;
  let app;

  beforeEach(() => {
    mockPool = createMockPool();
    app = createApp(mockPool);
  });

  it('deletes a sitio owned by user', async () => {
    mockPool.query.mockResolvedValue({
      rowCount: 1,
      rows: [{ id: 1, usuario_id: 1, url: 'https://example.com', nombre: 'Example', frecuencia_minutos: 5 }],
    });

    const res = await request(app)
      .delete('/sitios/1')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/eliminado/i);
  });

  it('returns 404 for non-existent sitio', async () => {
    mockPool.query.mockResolvedValue({ rowCount: 0, rows: [] });

    const res = await request(app)
      .delete('/sitios/999')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(404);
  });

  it('rejects non-numeric id', async () => {
    const res = await request(app)
      .delete('/sitios/abc')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(400);
  });
});

describe('GET /sitios/:id/logs', () => {
  let mockPool;
  let app;

  beforeEach(() => {
    mockPool = createMockPool();
    app = createApp(mockPool);
  });

  it('returns logs for owned sitio', async () => {
    mockPool.query
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, usuario_id: 1 }] })
      .mockResolvedValueOnce({
        rows: [
          { id: 1, sitio_id: 1, status_code: 200, latencia_ms: 100, is_online: true, created_at: new Date().toISOString() },
        ],
      });

    const res = await request(app)
      .get('/sitios/1/logs')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.logs).toHaveLength(1);
  });

  it('rejects non-numeric id', async () => {
    const res = await request(app)
      .get('/sitios/abc/logs')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(400);
  });
});

describe('GET /sitios/:id/stats', () => {
  let mockPool;
  let app;

  beforeEach(() => {
    mockPool = createMockPool();
    app = createApp(mockPool);
  });

  it('returns stats for owned sitio', async () => {
    mockPool.query
      .mockResolvedValueOnce({ rows: [{ id: 1, usuario_id: 1, url: 'https://example.com', nombre: 'Example' }] })
      .mockResolvedValueOnce({
        rows: [
          { is_online: true, latencia_ms: 100, created_at: new Date().toISOString() },
          { is_online: true, latencia_ms: 200, created_at: new Date().toISOString() },
          { is_online: false, latencia_ms: null, created_at: new Date().toISOString() },
        ],
      });

    const res = await request(app)
      .get('/sitios/1/stats')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('latenciaPromedio');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body.totalChequeos).toBe(3);
  });

  it('rejects non-numeric id', async () => {
    const res = await request(app)
      .get('/sitios/abc/stats')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(400);
  });
});
