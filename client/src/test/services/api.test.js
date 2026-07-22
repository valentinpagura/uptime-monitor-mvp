import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  registerUser,
  loginUser,
  createSitio,
  getSitios,
  deleteSitio,
  getLogs,
  getSitioDashboard,
  getSitioStats,
} from '../../services/api';

function mockFetchResponse(data, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  });
}

function mockFetchNetworkError() {
  return vi.fn().mockRejectedValue(new Error('Network error'));
}

describe('api', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe('registerUser', () => {
    it('sends POST to /auth/register with email and password', async () => {
      globalThis.fetch = mockFetchResponse({ token: 'abc', usuario: { id: 1, email: 'test@test.com' } });

      const result = await registerUser('test@test.com', 'secret123');

      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/auth/register',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@test.com', password: 'secret123' }),
        }),
      );
      expect(result).toEqual({ token: 'abc', usuario: { id: 1, email: 'test@test.com' } });
    });

    it('propagates network errors', async () => {
      globalThis.fetch = mockFetchNetworkError();

      await expect(registerUser('test@test.com', 'secret123')).rejects.toThrow('Network error');
    });
  });

  describe('loginUser', () => {
    it('sends POST to /auth/login with email and password', async () => {
      globalThis.fetch = mockFetchResponse({ token: 'xyz', usuario: { id: 2, email: 'user@test.com' } });

      const result = await loginUser('user@test.com', 'mypassword');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'user@test.com', password: 'mypassword' }),
        }),
      );
      expect(result).toEqual({ token: 'xyz', usuario: { id: 2, email: 'user@test.com' } });
    });

    it('propagates network errors', async () => {
      globalThis.fetch = mockFetchNetworkError();

      await expect(loginUser('user@test.com', 'mypassword')).rejects.toThrow('Network error');
    });
  });

  describe('createSitio', () => {
    it('sends POST to /sitios with url, nombre, frecuencia and Bearer token', async () => {
      globalThis.fetch = mockFetchResponse({ sitio: { id: 1, url: 'https://example.com' } });

      const result = await createSitio('https://example.com', 'Example', 5, 'my-token');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/sitios',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer my-token',
          },
          body: JSON.stringify({
            url: 'https://example.com',
            nombre: 'Example',
            frecuencia_minutos: 5,
          }),
        }),
      );
      expect(result).toEqual({ sitio: { id: 1, url: 'https://example.com' } });
    });

    it('propagates network errors', async () => {
      globalThis.fetch = mockFetchNetworkError();

      await expect(createSitio('https://example.com', 'Example', 5, 'token')).rejects.toThrow('Network error');
    });
  });

  describe('getSitios', () => {
    it('sends GET to /sitios with Bearer token', async () => {
      globalThis.fetch = mockFetchResponse({ sitios: [{ id: 1, url: 'https://example.com' }] });

      const result = await getSitios('my-token');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/sitios',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer my-token',
          },
        }),
      );
      expect(result).toEqual({ sitios: [{ id: 1, url: 'https://example.com' }] });
    });

    it('propagates network errors', async () => {
      globalThis.fetch = mockFetchNetworkError();

      await expect(getSitios('token')).rejects.toThrow('Network error');
    });
  });

  describe('deleteSitio', () => {
    it('sends DELETE to /sitios/:id with Bearer token', async () => {
      globalThis.fetch = mockFetchResponse({ message: 'Sitio eliminado exitosamente' });

      const result = await deleteSitio(42, 'my-token');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/sitios/42',
        expect.objectContaining({
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer my-token',
          },
        }),
      );
      expect(result).toEqual({ message: 'Sitio eliminado exitosamente' });
    });

    it('propagates network errors', async () => {
      globalThis.fetch = mockFetchNetworkError();

      await expect(deleteSitio(42, 'token')).rejects.toThrow('Network error');
    });
  });

  describe('getLogs', () => {
    it('sends GET to /sitios/:id/logs with Bearer token', async () => {
      globalThis.fetch = mockFetchResponse({ logs: [{ id: 1, latencia_ms: 100 }] });

      const result = await getLogs(7, 'my-token');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/sitios/7/logs',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Authorization': 'Bearer my-token',
          },
        }),
      );
      expect(result).toEqual({ logs: [{ id: 1, latencia_ms: 100 }] });
    });

    it('appends ?range= when range parameter is provided', async () => {
      globalThis.fetch = mockFetchResponse({ logs: [], range: '24h' });

      await getLogs(7, 'my-token', '24h');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/sitios/7/logs?range=24h',
        expect.any(Object),
      );
    });

    it('appends ?range=all when range=all', async () => {
      globalThis.fetch = mockFetchResponse({ logs: [], range: 'all' });

      await getLogs(7, 'my-token', 'all');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/sitios/7/logs?range=all',
        expect.any(Object),
      );
    });

    it('does not append range when range is undefined', async () => {
      globalThis.fetch = mockFetchResponse({ logs: [] });

      await getLogs(7, 'my-token', undefined);

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/sitios/7/logs',
        expect.any(Object),
      );
    });

    it('returns range in response body when given', async () => {
      globalThis.fetch = mockFetchResponse({ logs: [], range: '7d' });

      const result = await getLogs(7, 'my-token', '7d');

      expect(result.range).toBe('7d');
    });

    it('propagates network errors', async () => {
      globalThis.fetch = mockFetchNetworkError();

      await expect(getLogs(7, 'token')).rejects.toThrow('Network error');
    });
  });

  describe('getSitioDashboard', () => {
    it('sends GET to /sitios/:id/dashboard with Bearer token and default range', async () => {
      globalThis.fetch = mockFetchResponse({
        resumen: { latenciaPromedio: 150, uptime: 100 },
        timeline: [],
        range: '24h',
      });

      const result = await getSitioDashboard(3, 'my-token');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/sitios/3/dashboard?range=24h',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Authorization': 'Bearer my-token',
          },
        }),
      );
      expect(result.range).toBe('24h');
    });

    it('appends custom range parameter', async () => {
      globalThis.fetch = mockFetchResponse({ timeline: [], range: '7d', resumen: {} });

      await getSitioDashboard(3, 'my-token', '7d');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/sitios/3/dashboard?range=7d',
        expect.any(Object),
      );
    });

    it('propagates network errors', async () => {
      globalThis.fetch = mockFetchNetworkError();

      await expect(getSitioDashboard(3, 'token')).rejects.toThrow('Network error');
    });
  });

  describe('getSitioStats', () => {
    it('sends GET to /sitios/:id/stats with Bearer token', async () => {
      globalThis.fetch = mockFetchResponse({ latenciaPromedio: 150, uptime: 100 });

      const result = await getSitioStats(3, 'my-token');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/sitios/3/stats',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Authorization': 'Bearer my-token',
          },
        }),
      );
      expect(result).toEqual({ latenciaPromedio: 150, uptime: 100 });
    });

    it('propagates network errors', async () => {
      globalThis.fetch = mockFetchNetworkError();

      await expect(getSitioStats(3, 'token')).rejects.toThrow('Network error');
    });
  });

  describe('error handling', () => {
    it('returns error response body when server responds with 4xx and JSON body', async () => {
      globalThis.fetch = mockFetchResponse({ message: 'Credenciales inválidas' }, 401);

      const result = await loginUser('bad@test.com', 'wrong');

      expect(result).toEqual({ message: 'Credenciales inválidas' });
    });

    it('throws when response.json() fails (non-JSON response)', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Unexpected token')),
      });

      await expect(getSitios('token')).rejects.toThrow('Unexpected token');
    });
  });
});
