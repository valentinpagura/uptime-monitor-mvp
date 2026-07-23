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

  it('uses LIMIT 10 when no range param', async () => {
    mockPool.query
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, usuario_id: 1 }] })
      .mockResolvedValueOnce({ rows: [] });

    await request(app)
      .get('/sitios/1/logs')
      .set('Authorization', `Bearer ${makeToken()}`);

    const sqlCall = mockPool.query.mock.calls[1][0];
    expect(sqlCall).toContain('LIMIT 10');
  });

  it('adds date filter for range=24h', async () => {
    mockPool.query
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, usuario_id: 1 }] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get('/sitios/1/logs?range=24h')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    const sqlCall = mockPool.query.mock.calls[1][0];
    expect(sqlCall).toContain('created_at >= NOW()');
    expect(sqlCall).toContain('$2::interval');
    expect(res.body.range).toBe('24h');
  });

  it('adds date filter for range=1h', async () => {
    mockPool.query
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, usuario_id: 1 }] })
      .mockResolvedValueOnce({ rows: [] });

    await request(app)
      .get('/sitios/1/logs?range=1h')
      .set('Authorization', `Bearer ${makeToken()}`);

    const params = mockPool.query.mock.calls[1][1];
    expect(params[1]).toBe('1 hour');
  });

  it('adds date filter for range=7d', async () => {
    mockPool.query
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, usuario_id: 1 }] })
      .mockResolvedValueOnce({ rows: [] });

    await request(app)
      .get('/sitios/1/logs?range=7d')
      .set('Authorization', `Bearer ${makeToken()}`);

    const params = mockPool.query.mock.calls[1][1];
    expect(params[1]).toBe('7 days');
  });

  it('returns all logs for range=all', async () => {
    mockPool.query
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, usuario_id: 1 }] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get('/sitios/1/logs?range=all')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    const sqlCall = mockPool.query.mock.calls[1][0];
    expect(sqlCall).not.toContain('LIMIT');
    expect(sqlCall).not.toContain('created_at >=');
  });

  it('returns 400 for invalid range value', async () => {
    mockPool.query
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, usuario_id: 1 }] });

    const res = await request(app)
      .get('/sitios/1/logs?range=invalid')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Rango inválido');
  });

  it('rejects non-numeric id', async () => {
    const res = await request(app)
      .get('/sitios/abc/logs')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(400);
  });

  it('returns 404 for non-owned sitio', async () => {
    mockPool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    const res = await request(app)
      .get('/sitios/999/logs')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(404);
  });
});

describe('GET /sitios/:id/dashboard', () => {
  let mockPool;
  let app;
  const now = new Date().toISOString();

  beforeEach(() => {
    mockPool = createMockPool();
    app = createApp(mockPool);
  });

  it('returns dashboard with resumen and timeline for owned sitio (default range)', async () => {
    mockPool.query
      .mockResolvedValueOnce({ rows: [{ id: 1, url: 'https://example.com', nombre: 'Example' }] })
      .mockResolvedValueOnce({
        rows: [{
          total_chequeos: 10,
          online_count: 9,
          latencia_promedio: 150,
          latencia_min: 50,
          latencia_max: 500,
        }],
      })
      .mockResolvedValueOnce({ rows: [{ total_global: 10 }] })
      .mockResolvedValueOnce({
        rows: [
          { bucket: now, latencia_promedio: 100, latencia_min: 50, latencia_max: 200, checks: 5, was_online: true },
          { bucket: now, latencia_promedio: 200, latencia_min: 100, latencia_max: 500, checks: 5, was_online: true },
        ],
      });

    const res = await request(app)
      .get('/sitios/1/dashboard')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('range', '24h');
    expect(res.body).toHaveProperty('totalGlobal', 10);
    expect(res.body).toHaveProperty('resumen');
    expect(res.body.resumen).toMatchObject({
      latenciaPromedio: 150,
      latenciaMin: 50,
      latenciaMax: 500,
      uptime: 90,
      totalChequeos: 10,
    });
    expect(res.body.timeline).toHaveLength(2);
    expect(res.body.timeline[0]).toHaveProperty('bucket');
    expect(res.body.timeline[0]).toHaveProperty('was_online');
  });

  it('accepts explicit range=1h', async () => {
    mockPool.query
      .mockResolvedValueOnce({ rows: [{ id: 1, url: 'https://example.com', nombre: 'Example' }] })
      .mockResolvedValueOnce({
        rows: [{ total_chequeos: 5, online_count: 5, latencia_promedio: 100, latencia_min: 80, latencia_max: 120 }],
      })
      .mockResolvedValueOnce({ rows: [{ total_global: 5 }] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get('/sitios/1/dashboard?range=1h')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.range).toBe('1h');
  });

  it('accepts range=all', async () => {
    mockPool.query
      .mockResolvedValueOnce({ rows: [{ id: 1, url: 'https://example.com', nombre: 'Example' }] })
      .mockResolvedValueOnce({
        rows: [{ total_chequeos: 100, online_count: 95, latencia_promedio: 200, latencia_min: 50, latencia_max: 800 }],
      })
      .mockResolvedValueOnce({ rows: [{ total_global: 100 }] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get('/sitios/1/dashboard?range=all')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.range).toBe('all');
  });

  it('returns empty state when no logs ever', async () => {
    mockPool.query
      .mockResolvedValueOnce({ rows: [{ id: 1, url: 'https://example.com', nombre: 'Example' }] })
      .mockResolvedValueOnce({
        rows: [{ total_chequeos: 0, online_count: 0, latencia_promedio: null, latencia_min: null, latencia_max: null }],
      })
      .mockResolvedValueOnce({ rows: [{ total_global: 0 }] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get('/sitios/1/dashboard')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.resumen.latenciaPromedio).toBeNull();
    expect(res.body.resumen.uptime).toBeNull();
    expect(res.body.resumen.totalChequeos).toBe(0);
    expect(res.body.timeline).toEqual([]);
    expect(res.body.totalGlobal).toBe(0);
  });

  it('returns 400 for invalid range value', async () => {
    mockPool.query
      .mockResolvedValueOnce({ rows: [{ id: 1, url: 'https://example.com', nombre: 'Example' }] });

    const res = await request(app)
      .get('/sitios/1/dashboard?range=invalid')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Rango inválido');
  });

  it('rejects non-numeric id', async () => {
    const res = await request(app)
      .get('/sitios/abc/dashboard')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(400);
  });

  it('returns 404 for non-owned sitio', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get('/sitios/999/dashboard')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(404);
  });

  it('rejects request without token', async () => {
    const res = await request(app)
      .get('/sitios/1/dashboard');

    expect(res.status).toBe(401);
  });

  it('runs aggregation, global, and timeline queries in parallel', async () => {
    mockPool.query
      .mockResolvedValueOnce({ rows: [{ id: 1, url: 'https://example.com', nombre: 'Example' }] })
      .mockResolvedValueOnce({
        rows: [{ total_chequeos: 1, online_count: 1, latencia_promedio: 100, latencia_min: 100, latencia_max: 100 }],
      })
      .mockResolvedValueOnce({ rows: [{ total_global: 1 }] })
      .mockResolvedValueOnce({
        rows: [{ bucket: now, latencia_promedio: 100, latencia_min: 100, latencia_max: 100, checks: 1, was_online: true }],
      });

    await request(app)
      .get('/sitios/1/dashboard')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(mockPool.query).toHaveBeenCalledTimes(4);
    const aggCall = mockPool.query.mock.calls[1][0];
    const globalCall = mockPool.query.mock.calls[2][0];
    const timelineCall = mockPool.query.mock.calls[3][0];
    expect(aggCall).toContain('AVG');
    expect(aggCall).toContain('COUNT');
    expect(globalCall).toContain('COUNT');
    expect(timelineCall).toContain('date_trunc');
    expect(timelineCall).toContain('GROUP BY');
  });

  it('passes bucket parameter to date_trunc', async () => {
    mockPool.query
      .mockResolvedValueOnce({ rows: [{ id: 1, url: 'https://example.com', nombre: 'Example' }] })
      .mockResolvedValueOnce({
        rows: [{ total_chequeos: 1, online_count: 1, latencia_promedio: 100, latencia_min: 100, latencia_max: 100 }],
      })
      .mockResolvedValueOnce({ rows: [{ total_global: 1 }] })
      .mockResolvedValueOnce({ rows: [] });

    await request(app)
      .get('/sitios/1/dashboard?range=7d')
      .set('Authorization', `Bearer ${makeToken()}`);

    const timelineParams = mockPool.query.mock.calls[3][1];
    expect(timelineParams[2]).toBe('1 hour');
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

describe('GET /sitios/summary', () => {
  let mockPool;
  let app;

  beforeEach(() => {
    mockPool = createMockPool();
    app = createApp(mockPool);
  });

  it('returns summary with aggregated data across all sites', async () => {
    mockPool.query
      .mockResolvedValueOnce({
        rows: [
          { id: 1, url: 'https://site1.com', nombre: 'Site 1', total_chequeos: 100, online_chequeos: 99, avg_latencia: 120, min_latencia: 50, max_latencia: 300 },
          { id: 2, url: 'https://site2.com', nombre: 'Site 2', total_chequeos: 50, online_chequeos: 50, avg_latencia: 350, min_latencia: 100, max_latencia: 600 },
          { id: 3, url: 'https://site3.com', nombre: null, total_chequeos: 0, online_chequeos: 0, avg_latencia: null, min_latencia: null, max_latencia: null },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ total_chequeos: 0, avg_latencia: null, online_count: 0 }] });

    const res = await request(app)
      .get('/sitios/summary?range=24h')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('range', '24h');
    expect(res.body).toHaveProperty('totalSitios', 3);
    expect(res.body.totalChequeos).toBe(150);
    expect(res.body.resumen).toMatchObject({
      passing: 1,
      warning: 1,
      slow: 0,
      down: 0,
      sinDatos: 1,
    });
    expect(res.body.sitios).toHaveLength(3);
    expect(res.body.sitios[0].clasificacion).toBe('passing');
    expect(res.body.sitios[1].clasificacion).toBe('warning');
    expect(res.body.sitios[2].clasificacion).toBe('sin_datos');
  });

  it('uses default range=24h when no range param', async () => {
    mockPool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ total_chequeos: 0, avg_latencia: null, online_count: 0 }] });

    const res = await request(app)
      .get('/sitios/summary')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.range).toBe('24h');
    expect(res.body.totalSitios).toBe(0);
  });

  it('returns 400 for invalid range value', async () => {
    const res = await request(app)
      .get('/sitios/summary?range=invalid')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Rango inválido');
  });

  it('returns site list with per-site uptime and clasificacion', async () => {
    mockPool.query
      .mockResolvedValueOnce({
        rows: [
          { id: 1, url: 'https://good.com', nombre: 'Good', total_chequeos: 100, online_chequeos: 100, avg_latencia: 50, min_latencia: 10, max_latencia: 150 },
          { id: 2, url: 'https://slow.com', nombre: 'Slow', total_chequeos: 100, online_chequeos: 100, avg_latencia: 500, min_latencia: 200, max_latencia: 900 },
          { id: 3, url: 'https://down.com', nombre: 'Down', total_chequeos: 100, online_chequeos: 80, avg_latencia: 150, min_latencia: 50, max_latencia: 300 },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ total_chequeos: 0, avg_latencia: null, online_count: 0 }] });

    const res = await request(app)
      .get('/sitios/summary?range=7d')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.sitios[0]).toMatchObject({ id: 1, clasificacion: 'passing', uptime: 100, avgLatencia: 50 });
    expect(res.body.sitios[1]).toMatchObject({ id: 2, clasificacion: 'slow', uptime: 100, avgLatencia: 500 });
    expect(res.body.sitios[2]).toMatchObject({ id: 3, clasificacion: 'down', uptime: 80, avgLatencia: 150 });
    expect(res.body.resumen.passing).toBe(1);
    expect(res.body.resumen.slow).toBe(1);
    expect(res.body.resumen.down).toBe(1);
  });

  it('computes global averages correctly', async () => {
    mockPool.query
      .mockResolvedValueOnce({
        rows: [
          { id: 1, url: 'https://a.com', nombre: 'A', total_chequeos: 100, online_chequeos: 95, avg_latencia: 100, min_latencia: 10, max_latencia: 200 },
          { id: 2, url: 'https://b.com', nombre: 'B', total_chequeos: 200, online_chequeos: 180, avg_latencia: 200, min_latencia: 50, max_latencia: 500 },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ total_chequeos: 0, avg_latencia: null, online_count: 0 }] });

    const res = await request(app)
      .get('/sitios/summary?range=24h')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.body.resumen.promedioGlobal).toBe(150);
    expect(res.body.resumen.uptimeGlobal).toBe(92);
    expect(res.body.resumen.minLatencia).toBe(10);
    expect(res.body.resumen.maxLatencia).toBe(500);
  });

  it('rejects request without token', async () => {
    const res = await request(app).get('/sitios/summary');
    expect(res.status).toBe(401);
  });

  it('returns sin_datos for sites with no logs', async () => {
    mockPool.query
      .mockResolvedValueOnce({
        rows: [
          { id: 1, url: 'https://new.com', nombre: null, total_chequeos: 0, online_chequeos: 0, avg_latencia: null, min_latencia: null, max_latencia: null },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ total_chequeos: 0, avg_latencia: null, online_count: 0 }] });

    const res = await request(app)
      .get('/sitios/summary')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.body.sitios[0].clasificacion).toBe('sin_datos');
    expect(res.body.sitios[0].uptime).toBeNull();
    expect(res.body.sitios[0].avgLatencia).toBeNull();
    expect(res.body.resumen.sinDatos).toBe(1);
  });
});
