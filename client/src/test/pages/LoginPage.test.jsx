import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthContext } from '../../contexts/AuthContext';
import { LoginPage } from '../../pages/LoginPage';

const defaultCtx = {
  login: vi.fn(),
  register: vi.fn(),
  loading: false,
  error: null,
};

function renderPage(ctx = {}) {
  const value = { ...defaultCtx, ...ctx };
  return render(
    <AuthContext.Provider value={value}>
      <LoginPage />
    </AuthContext.Provider>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('tab switching', () => {
    it('shows Sign In form by default', () => {
      renderPage();
      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByText('Initialize Session')).toBeInTheDocument();
    });

    it('switches to Register form when Register tab is clicked', () => {
      renderPage();
      fireEvent.click(screen.getByText('Register'));
      expect(screen.getByText('Confirm Password')).toBeInTheDocument();
    });

    it('switches back to Sign In from Register', () => {
      renderPage();
      fireEvent.click(screen.getByText('Register'));
      fireEvent.click(screen.getByText('Sign In'));
      expect(screen.getByText('Initialize Session')).toBeInTheDocument();
    });
  });

  describe('login form', () => {
    it('calls login with email and password on submit', async () => {
      const login = vi.fn();
      renderPage({ login });
      fireEvent.change(screen.getByPlaceholderText('operator@domain.com'), { target: { value: 'a@b.com' } });
      const passwordInputs = screen.getAllByPlaceholderText('••••••••');
      fireEvent.change(passwordInputs[0], { target: { value: 'secret' } });
      fireEvent.click(screen.getByText('Initialize Session'));
      await waitFor(() => {
        expect(login).toHaveBeenCalledWith('a@b.com', 'secret');
      });
    });

    it('shows loading text when loading is true', () => {
      renderPage({ loading: true });
      expect(screen.getByText('Initializing...')).toBeInTheDocument();
    });

    it('shows auth error when error is set', () => {
      renderPage({ error: 'Invalid credentials' });
      expect(screen.getByText(/Invalid credentials/)).toBeInTheDocument();
    });

    it('disables submit button when loading', () => {
      renderPage({ loading: true });
      expect(screen.getByText('Initializing...')).toBeDisabled();
    });

    it('toggles password visibility', () => {
      renderPage();
      const passwordInputs = screen.getAllByPlaceholderText('••••••••');
      expect(passwordInputs[0]).toHaveAttribute('type', 'password');
      fireEvent.click(screen.getByText('👁️'));
      expect(passwordInputs[0]).toHaveAttribute('type', 'text');
    });
  });

  describe('register form', () => {
    function renderRegisterPage(ctx = {}) {
      const value = { ...defaultCtx, ...ctx };
      const result = render(
        <AuthContext.Provider value={value}>
          <LoginPage />
        </AuthContext.Provider>,
      );
      fireEvent.click(screen.getByText('Register'));
      return result;
    }

    it('calls register with email and password on submit', async () => {
      const register = vi.fn();
      renderRegisterPage({ register });
      fireEvent.change(screen.getByPlaceholderText('operator@domain.com'), { target: { value: 'new@user.com' } });
      const pwds = screen.getAllByPlaceholderText('••••••••');
      fireEvent.change(pwds[0], { target: { value: '123456' } });
      fireEvent.change(pwds[1], { target: { value: '123456' } });
      fireEvent.click(screen.getAllByText('Initialize Session')[0]);
      await waitFor(() => {
        expect(register).toHaveBeenCalledWith('new@user.com', '123456');
      });
    });

    it('shows validation error when passwords do not match', async () => {
      renderRegisterPage();
      fireEvent.change(screen.getByPlaceholderText('operator@domain.com'), { target: { value: 'a@b.com' } });
      const pwds = screen.getAllByPlaceholderText('••••••••');
      fireEvent.change(pwds[0], { target: { value: '123456' } });
      fireEvent.change(pwds[1], { target: { value: '654321' } });
      fireEvent.click(screen.getAllByText('Initialize Session')[0]);
      await waitFor(() => {
        expect(screen.getByText(/Las contraseñas no coinciden/)).toBeInTheDocument();
      });
    });

    it('shows validation error when password is too short', async () => {
      renderRegisterPage();
      fireEvent.change(screen.getByPlaceholderText('operator@domain.com'), { target: { value: 'a@b.com' } });
      const pwds = screen.getAllByPlaceholderText('••••••••');
      fireEvent.change(pwds[0], { target: { value: '123' } });
      fireEvent.change(pwds[1], { target: { value: '123' } });
      fireEvent.click(screen.getAllByText('Initialize Session')[0]);
      await waitFor(() => {
        const matches = screen.getAllByText(/Mínimo 6 caracteres/);
        expect(matches.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('toggles register password visibility', () => {
      renderRegisterPage();
      const pwds = screen.getAllByPlaceholderText('••••••••');
      const eyeButtons = screen.getAllByRole('button');
      const showPwdEye = eyeButtons.find((btn) => btn.textContent === '👁️');
      expect(pwds[0]).toHaveAttribute('type', 'password');
      fireEvent.click(showPwdEye);
      expect(pwds[0]).toHaveAttribute('type', 'text');
    });
  });

  describe('decorative panel', () => {
    it('renders enterprise title', () => {
      renderPage();
      expect(screen.getByText(/Enterprise-Grade/)).toBeInTheDocument();
    });

    it('renders feature list', () => {
      renderPage();
      expect(screen.getByText('Multi-Protocol Monitoring')).toBeInTheDocument();
      expect(screen.getByText('Intelligent Alerting')).toBeInTheDocument();
      expect(screen.getByText('Distributed Tracing')).toBeInTheDocument();
    });

    it('renders stats', () => {
      renderPage();
      expect(screen.getByText('99.999%')).toBeInTheDocument();
      expect(screen.getByText('~45ms')).toBeInTheDocument();
    });
  });

  describe('layout', () => {
    it('renders footer with copyright', () => {
      renderPage();
      expect(screen.getByText(/2024 UPTIME MONITOR/)).toBeInTheDocument();
    });

    it('renders logo', () => {
      renderPage();
      expect(screen.getByText('UPTIME MONITOR')).toBeInTheDocument();
    });
  });
});
