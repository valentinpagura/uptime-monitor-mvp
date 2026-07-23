import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../components/Particles', () => ({ default: () => null }));

vi.mock('../../services/api', () => ({
  getDashboardSummary: vi.fn(),
  deleteSitio: vi.fn(),
  createSitio: vi.fn(),
}));

import { AuthContext } from '../../contexts/AuthContext';
import { ToastContext } from '../../contexts/ToastContext';
import { DashboardPage } from '../../pages/DashboardPage';
import * as api from '../../services/api';

const mockSummaryData = {
  range: '24h',
  totalSitios: 2,
  totalChequeos: 15,
  resumen: {
    passing: 1,
    warning: 0,
    slow: 0,
    down: 1,
    sinDatos: 0,
    promedioGlobal: 120,
    uptimeGlobal: 50,
    minLatencia: 120,
    maxLatencia: 120,
  },
  tendencias: {
    promedioGlobal: { direccion: 'up', porcentaje: 5 },
    uptimeGlobal: { direccion: 'down', porcentaje: 10 },
    totalChequeos: { direccion: 'up', porcentaje: 20 },
  },
  sitios: [
    { id: 1, url: 'https://google.com', nombre: 'Google', frecuenciaMinutos: 5, avgLatencia: 120, uptime: 100, totalChequeos: 10, clasificacion: 'passing' },
    { id: 2, url: 'https://example.com', nombre: null, frecuenciaMinutos: 5, avgLatencia: null, uptime: 0, totalChequeos: 5, clasificacion: 'down' },
  ],
};

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
    api.getDashboardSummary.mockResolvedValue({ ...mockSummaryData, sitios: [] });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
    });
  });

  it('loads and displays sitios', async () => {
    api.getDashboardSummary.mockResolvedValue(mockSummaryData);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Google')).toBeInTheDocument();
    });

    expect(screen.getByText('https://google.com')).toBeInTheDocument();
    const exampleUrls = screen.getAllByText('https://example.com');
    expect(exampleUrls.length).toBeGreaterThanOrEqual(1);
  });

  it('shows KPI values based on site status', async () => {
    api.getDashboardSummary.mockResolvedValue(mockSummaryData);

    renderDashboard();

    await waitFor(() => {
      const passingElements = screen.getAllByText('Passing');
      expect(passingElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows error banner when API fails', async () => {
    api.getDashboardSummary.mockRejectedValue(new Error('Network error'));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('filters table when typing in search', async () => {
    api.getDashboardSummary.mockResolvedValue(mockSummaryData);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Google')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search systems...');
    const user = userEvent.setup();
    await user.type(searchInput, 'example');

    await waitFor(() => {
      const urls = screen.getAllByText('https://example.com');
      expect(urls.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows global site count in subtitle', async () => {
    api.getDashboardSummary.mockResolvedValue(mockSummaryData);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/Monitoring 2 active endpoints/i)).toBeInTheDocument();
    });
  });

  it('opens ConfirmModal when delete button is clicked in context menu', async () => {
    api.getDashboardSummary.mockResolvedValue(mockSummaryData);

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
    api.getDashboardSummary.mockResolvedValue(mockSummaryData);
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
    api.getDashboardSummary.mockResolvedValue(mockSummaryData);

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
