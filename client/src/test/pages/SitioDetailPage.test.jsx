import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('../../services/api', () => ({
  getSitioStats: vi.fn(),
}));

import { AuthContext } from '../../contexts/AuthContext';
import { SitioDetailPage } from '../../pages/SitioDetailPage';
import * as api from '../../services/api';

const mockStats = {
  message: 'Estadísticas del sitio obtenidas',
  sitio: { id: 1, url: 'https://example.com', nombre: 'Example' },
  latenciaPromedio: 150,
  latenciaMin: 50,
  latenciaMax: 300,
  ultimoLog: {
    id: 5,
    sitio_id: 1,
    latencia_ms: 120,
    is_online: true,
    status_code: 200,
    created_at: '2026-07-02T12:00:00Z',
  },
  uptime: 95,
  totalChequeos: 20,
  logs: [
    { id: 5, latencia_ms: 120, is_online: true, created_at: '2026-07-02T12:00:00Z' },
    { id: 4, latencia_ms: 200, is_online: true, created_at: '2026-07-02T11:50:00Z' },
    { id: 3, latencia_ms: null, is_online: false, created_at: '2026-07-02T11:40:00Z' },
  ],
};

const mockEmptyStats = {
  message: 'Sin datos de monitoreo aún',
  sitio: { id: 1, url: 'https://empty.com', nombre: 'Empty' },
  latenciaPromedio: 0,
  latenciaMin: 0,
  latenciaMax: 0,
  ultimoLog: null,
  uptime: 0,
  totalChequeos: 0,
};

function renderSitioDetail(sitioId = 1) {
  const onBack = vi.fn();
  return {
    onBack,
    ...render(
      <AuthContext.Provider value={{ token: 'fake-token', user: { id: 1, email: 'test@test.com' } }}>
        <SitioDetailPage sitioId={sitioId} onBack={onBack} />
      </AuthContext.Provider>,
    ),
  };
}

describe('SitioDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading skeleton initially', () => {
    api.getSitioStats.mockReturnValue(new Promise(() => {}));

    const { container } = renderSitioDetail(1);
    const skeletons = container.querySelectorAll('.db-skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays site stats after loading', async () => {
    api.getSitioStats.mockResolvedValue(mockStats);

    renderSitioDetail(1);

    await waitFor(() => {
      expect(screen.getByText('Example')).toBeInTheDocument();
    });

    expect(screen.getByText('https://example.com')).toBeInTheDocument();
    expect(screen.getByText('Current Latency')).toBeInTheDocument();
    expect(screen.getByText('Historical Average')).toBeInTheDocument();
    expect(screen.getByText('Uptime')).toBeInTheDocument();
  });

  it('shows empty state when no stats data', async () => {
    api.getSitioStats.mockResolvedValue(mockEmptyStats);

    renderSitioDetail(1);

    await waitFor(() => {
      expect(screen.getByText('Sin datos de monitoreo')).toBeInTheDocument();
    });
  });

  it('shows error state when API fails', async () => {
    api.getSitioStats.mockRejectedValue(new Error('API Error'));

    renderSitioDetail(1);

    await waitFor(() => {
      expect(screen.getByText('Error cargando estadísticas')).toBeInTheDocument();
    });
  });

  it('displays status badge with label', async () => {
    api.getSitioStats.mockResolvedValue(mockStats);

    renderSitioDetail(1);

    await waitFor(() => {
      expect(screen.getByText('UP')).toBeInTheDocument();
    });
  });

  it('shows total check count', async () => {
    api.getSitioStats.mockResolvedValue(mockStats);

    renderSitioDetail(1);

    const totalText = await screen.findByText(/Total de chequeos/);
    expect(totalText).toBeInTheDocument();
  });

  it('displays latency gauge', async () => {
    api.getSitioStats.mockResolvedValue(mockStats);

    renderSitioDetail(1);

    await waitFor(() => {
      expect(screen.getAllByText('ms').length).toBeGreaterThanOrEqual(1);
    });
  });
});
