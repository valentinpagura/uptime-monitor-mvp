import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../components/Particles', () => ({ default: () => null }));

vi.mock('../../services/api', () => ({
  getSitios: vi.fn(),
  getLogs: vi.fn(),
  deleteSitio: vi.fn(),
  createSitio: vi.fn(),
}));

import { AuthContext } from '../../contexts/AuthContext';
import { ToastContext } from '../../contexts/ToastContext';
import { DashboardPage } from '../../pages/DashboardPage';
import * as api from '../../services/api';

const mockSitios = [
  { id: 1, url: 'https://google.com', nombre: 'Google', frecuencia_minutos: 5 },
  { id: 2, url: 'https://example.com', nombre: null, frecuencia_minutos: 5 },
];

const mockLogs1 = [
  { id: 1, sitio_id: 1, latencia_ms: 120, is_online: true, status_code: 200, created_at: '2026-07-02T12:00:00Z' },
];

const mockLogs2 = [
  { id: 2, sitio_id: 2, latencia_ms: null, is_online: false, status_code: null, created_at: '2026-07-02T12:00:00Z' },
];

function renderDashboard() {
  const addToast = vi.fn();
  const logout = vi.fn();

  return {
    addToast,
    logout,
    ...render(
      <AuthContext.Provider value={{ token: 'fake-token', user: { id: 1, email: 'test@test.com' }, logout }}>
        <ToastContext.Provider value={{ addToast }}>
          <DashboardPage />
        </ToastContext.Provider>
      </AuthContext.Provider>,
    ),
  };
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the sidebar and topbar', async () => {
    api.getSitios.mockResolvedValue({ sitios: [] });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
    });
  });

  it('loads and displays sitios', async () => {
    api.getSitios.mockResolvedValue({ sitios: mockSitios });
    api.getLogs
      .mockResolvedValueOnce({ logs: mockLogs1 })
      .mockResolvedValueOnce({ logs: mockLogs2 });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Google')).toBeInTheDocument();
    });

    expect(screen.getByText('https://google.com')).toBeInTheDocument();
    const exampleUrls = screen.getAllByText('https://example.com');
    expect(exampleUrls.length).toBeGreaterThanOrEqual(1);
  });

  it('shows KPI values based on site status', async () => {
    api.getSitios.mockResolvedValue({ sitios: mockSitios });
    api.getLogs
      .mockResolvedValueOnce({ logs: mockLogs1 })
      .mockResolvedValueOnce({ logs: mockLogs2 });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows error banner when API fails', async () => {
    api.getSitios.mockRejectedValue(new Error('Network error'));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Error al cargar los sitios')).toBeInTheDocument();
    });
  });

  it('shows search dropdown with matching results while keeping full table', async () => {
    api.getSitios.mockResolvedValue({ sitios: mockSitios });
    api.getLogs
      .mockResolvedValueOnce({ logs: mockLogs1 })
      .mockResolvedValueOnce({ logs: mockLogs2 });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Google')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search systems...');
    const user = userEvent.setup();
    await user.type(searchInput, 'example');

    await waitFor(
      () => {
        const urls = screen.getAllByText('https://example.com');
        expect(urls.length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('Google')).toBeInTheDocument();
      },
      { timeout: 500 },
    );
  });

  it('shows global site count in subtitle', async () => {
    api.getSitios.mockResolvedValue({ sitios: mockSitios });
    api.getLogs
      .mockResolvedValueOnce({ logs: mockLogs1 })
      .mockResolvedValueOnce({ logs: mockLogs2 });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/Monitoring 2 active endpoints?/i)).toBeInTheDocument();
    });
  });

  it('opens ConfirmModal when delete button is clicked in context menu', async () => {
    api.getSitios.mockResolvedValue({ sitios: mockSitios });
    api.getLogs
      .mockResolvedValueOnce({ logs: mockLogs1 })
      .mockResolvedValueOnce({ logs: mockLogs2 });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Google')).toBeInTheDocument();
    });

    const menuBtn = document.querySelector('.db-row-menu-btn');
    fireEvent.click(menuBtn);
    const deleteBtn = screen.getByText((c, el) => el.tagName === 'BUTTON' && c.includes('Eliminar'));
    fireEvent.click(deleteBtn);

    expect(screen.getByText('Delete Monitor')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this monitor? This action cannot be undone.')).toBeInTheDocument();
  });

  it('deletes site when ConfirmModal confirm is clicked', async () => {
    api.getSitios.mockResolvedValue({ sitios: mockSitios });
    api.getLogs
      .mockResolvedValueOnce({ logs: mockLogs1 })
      .mockResolvedValueOnce({ logs: mockLogs2 });
    api.deleteSitio.mockResolvedValue({});

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Google')).toBeInTheDocument();
    });

    const menuBtn = document.querySelector('.db-row-menu-btn');
    fireEvent.click(menuBtn);
    fireEvent.click(screen.getByText((c, el) => el.tagName === 'BUTTON' && c.includes('Eliminar')));

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(api.deleteSitio).toHaveBeenCalledWith(1, 'fake-token');
    });
  });

  it('cancels delete when ConfirmModal cancel is clicked', async () => {
    api.getSitios.mockResolvedValue({ sitios: mockSitios });
    api.getLogs
      .mockResolvedValueOnce({ logs: mockLogs1 })
      .mockResolvedValueOnce({ logs: mockLogs2 });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Google')).toBeInTheDocument();
    });

    const menuBtn = document.querySelector('.db-row-menu-btn');
    fireEvent.click(menuBtn);
    fireEvent.click(screen.getByText((c, el) => el.tagName === 'BUTTON' && c.includes('Eliminar')));

    fireEvent.click(screen.getByText('Cancel'));

    await waitFor(() => {
      expect(screen.queryByText('Delete Monitor')).not.toBeInTheDocument();
    });
  });

});
