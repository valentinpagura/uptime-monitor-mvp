import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { useContext } from 'react';
import { AuthContext, AuthProvider } from '../../contexts/AuthContext';

vi.mock('../../services/api', () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
}));

import * as api from '../../services/api';

function createToken(payload) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.fake-signature`;
}

function TestConsumer() {
  const ctx = useContext(AuthContext);
  if (!ctx) return <div>No context</div>;
  return (
    <div>
      <div data-testid="user">{ctx.user ? JSON.stringify(ctx.user) : 'null'}</div>
      <div data-testid="token">{ctx.token || 'null'}</div>
      <div data-testid="loading">{String(ctx.loading)}</div>
      <div data-testid="error">{ctx.error || 'null'}</div>
      <button data-testid="btn-login" onClick={() => ctx.login('a@b.com', '123456')}>
        Login
      </button>
      <button data-testid="btn-register" onClick={() => ctx.register('a@b.com', '123456')}>
        Register
      </button>
      <button data-testid="btn-logout" onClick={() => ctx.logout()}>
        Logout
      </button>
    </div>
  );
}

function renderProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>,
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('initial state', () => {
    it('renders children', () => {
      render(
        <AuthProvider>
          <div data-testid="child">hello</div>
        </AuthProvider>,
      );
      expect(screen.getByTestId('child')).toHaveTextContent('hello');
    });

    it('starts with user null, loading false, error null when no token', () => {
      renderProvider();
      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('token')).toHaveTextContent('null');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('error')).toHaveTextContent('null');
    });
  });

  describe('session restoration', () => {
    it('restores session when a valid unexpired token exists in localStorage', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const token = createToken({ id: 5, email: 'user@test.com', exp: futureExp });
      localStorage.setItem('token', token);

      renderProvider();

      expect(screen.getByTestId('token')).toHaveTextContent(token);
      expect(screen.getByTestId('user')).toHaveTextContent('"id":5');
      expect(screen.getByTestId('user')).toHaveTextContent('"email":"user@test.com"');
    });

    it('clears session when token is expired', () => {
      const pastExp = Math.floor(Date.now() / 1000) - 3600;
      const token = createToken({ id: 5, email: 'user@test.com', exp: pastExp });
      localStorage.setItem('token', token);

      renderProvider();

      expect(screen.getByTestId('token')).toHaveTextContent('null');
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });

    it('clears session when token is malformed', () => {
      localStorage.setItem('token', 'not-a-valid-jwt');

      renderProvider();

      expect(screen.getByTestId('token')).toHaveTextContent('null');
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });

    it('stays null when no token exists', () => {
      renderProvider();
      expect(screen.getByTestId('token')).toHaveTextContent('null');
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });
  });

  describe('login', () => {
    it('sets user and token on successful login', async () => {
      api.loginUser.mockResolvedValue({
        token: 'new-token',
        usuario: { id: 1, email: 'a@b.com' },
      });

      renderProvider();
      await act(async () => {
        screen.getByTestId('btn-login').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('token')).toHaveTextContent('new-token');
        expect(screen.getByTestId('user')).toHaveTextContent('"id":1');
        expect(screen.getByTestId('user')).toHaveTextContent('"email":"a@b.com"');
      });
      expect(localStorage.getItem('token')).toBe('new-token');
    });

    it('sets error when login returns no token', async () => {
      api.loginUser.mockResolvedValue({ message: 'Credenciales inválidas' });

      renderProvider();
      await act(async () => {
        screen.getByTestId('btn-login').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Credenciales inválidas');
      });
      expect(screen.getByTestId('token')).toHaveTextContent('null');
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });

    it('sets generic error when server is unreachable', async () => {
      api.loginUser.mockRejectedValue(new Error('Network error'));

      renderProvider();
      await act(async () => {
        screen.getByTestId('btn-login').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Error conectando con el servidor');
      });
    });

    it('shows loading state during login', async () => {
      let resolvePromise;
      api.loginUser.mockReturnValue(new Promise((resolve) => { resolvePromise = resolve; }));

      renderProvider();

      await act(async () => {
        screen.getByTestId('btn-login').click();
      });

      expect(screen.getByTestId('loading')).toHaveTextContent('true');

      await act(async () => {
        resolvePromise({ token: 't', usuario: { id: 1, email: 'a@b.com' } });
      });

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
    });

    it('clears previous error before login', async () => {
      api.loginUser
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce({ token: 't', usuario: { id: 1, email: 'a@b.com' } });

      renderProvider();

      await act(async () => { screen.getByTestId('btn-login').click(); });
      await waitFor(() => {
        expect(screen.getByTestId('error')).not.toHaveTextContent('null');
      });

      api.loginUser.mockClear();
      api.loginUser.mockResolvedValue({ token: 't2', usuario: { id: 2, email: 'b@b.com' } });

      await act(async () => { screen.getByTestId('btn-login').click(); });
      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('null');
      });
    });
  });

  describe('register', () => {
    it('sets user and token on successful register', async () => {
      api.registerUser.mockResolvedValue({
        token: 'reg-token',
        usuario: { id: 2, email: 'new@user.com' },
      });

      renderProvider();
      await act(async () => {
        screen.getByTestId('btn-register').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('token')).toHaveTextContent('reg-token');
        expect(screen.getByTestId('user')).toHaveTextContent('"id":2');
      });
      expect(localStorage.getItem('token')).toBe('reg-token');
    });

    it('sets error when register returns no token', async () => {
      api.registerUser.mockResolvedValue({ message: 'Email ya registrado' });

      renderProvider();
      await act(async () => {
        screen.getByTestId('btn-register').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Email ya registrado');
      });
    });

    it('sets generic error on network failure during register', async () => {
      api.registerUser.mockRejectedValue(new Error('Network error'));

      renderProvider();
      await act(async () => {
        screen.getByTestId('btn-register').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Error conectando con el servidor');
      });
    });
  });

  describe('logout', () => {
    it('clears user, token, and error', () => {
      localStorage.setItem('token', 'some-token');
      renderProvider();

      act(() => {
        screen.getByTestId('btn-logout').click();
      });

      expect(screen.getByTestId('token')).toHaveTextContent('null');
      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('error')).toHaveTextContent('null');
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('context shape', () => {
    it('provides all expected values', () => {
      let captured;
      function Capture() {
        captured = useContext(AuthContext);
        return null;
      }
      render(
        <AuthProvider>
          <Capture />
        </AuthProvider>,
      );

      expect(captured).toHaveProperty('user');
      expect(captured).toHaveProperty('token');
      expect(captured).toHaveProperty('loading');
      expect(captured).toHaveProperty('error');
      expect(captured).toHaveProperty('login');
      expect(captured).toHaveProperty('register');
      expect(captured).toHaveProperty('logout');
      expect(typeof captured.login).toBe('function');
      expect(typeof captured.register).toBe('function');
      expect(typeof captured.logout).toBe('function');
    });

    it('returns null when used outside provider', () => {
      function Outside() {
        const ctx = useContext(AuthContext);
        return <div>{ctx === undefined ? 'undefined' : 'has value'}</div>;
      }
      render(<Outside />);
      expect(screen.getByText('undefined')).toBeInTheDocument();
    });
  });
});
