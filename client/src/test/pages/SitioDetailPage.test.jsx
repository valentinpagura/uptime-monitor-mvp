import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

vi.mock('../../services/api', () => ({
  getSitioDashboard: vi.fn(),
}));

vi.mock('gsap', () => ({
  gsap: {
    to: vi.fn((_target, vars) => { if (vars.onComplete) vars.onComplete(); }),
    fromTo: vi.fn(),
    killTweensOf: vi.fn(),
  },
}));

vi.mock('../../components/LatencyChart', () => ({
  LatencyChart: function DummyChart() { return <div data-testid="latency-chart" />; },
}));

import { AuthContext } from '../../contexts/AuthContext';
import { SitioDetailPage } from '../../pages/SitioDetailPage';
import * as api from '../../services/api';

const mockDashboard = {
  message: 'Dashboard data obtained',
  sitio: { id: 1, url: 'https://example.com', nombre: 'Example' },
  range: '24h',
  totalGlobal: 20,
  resumen: {
    latenciaPromedio: 150,
    latenciaMin: 50,
    latenciaMax: 300,
    uptime: 95,
    totalChequeos: 20,
  },
  timeline: [
    { bucket: '2026-07-22T12:00:00Z', latencia_promedio: 120, latencia_min: 100, latencia_max: 140, checks: 5, was_online: true },
    { bucket: '2026-07-22T12:05:00Z', latencia_promedio: null, latencia_min: null, latencia_max: null, checks: 5, was_online: false },
    { bucket: '2026-07-22T12:10:00Z', latencia_promedio: 120, latencia_min: 100, latencia_max: 140, checks: 5, was_online: true },
  ],
};

const mockEmptyDashboard = {
  message: 'Sin datos de monitoreo en el rango seleccionado',
  sitio: { id: 1, url: 'https://empty.com', nombre: 'Empty' },
  range: '24h',
  totalGlobal: 0,
  resumen: {
    latenciaPromedio: null,
    latenciaMin: null,
    latenciaMax: null,
    uptime: null,
    totalChequeos: 0,
  },
  timeline: [],
};

const mockRangeEmptyDashboard = {
  message: 'Sin datos de monitoreo en el rango seleccionado',
  sitio: { id: 1, url: 'https://data-old.com', nombre: 'OldSite' },
  range: '1h',
  totalGlobal: 50,
  resumen: {
    latenciaPromedio: null,
    latenciaMin: null,
    latenciaMax: null,
    uptime: null,
    totalChequeos: 0,
  },
  timeline: [],
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
    api.getSitioDashboard.mockReturnValue(new Promise(() => {}));

    const { container } = renderSitioDetail(1);
    const skeletons = container.querySelectorAll('.db-skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays site info after loading', async () => {
    api.getSitioDashboard.mockResolvedValue(mockDashboard);

    renderSitioDetail(1);

    await waitFor(() => {
      expect(screen.getByText('Example')).toBeInTheDocument();
    });

    expect(screen.getByText('https://example.com')).toBeInTheDocument();
    expect(screen.getByText('Current Latency')).toBeInTheDocument();
    expect(screen.getByText('Historical Average')).toBeInTheDocument();
    expect(screen.getByText('Uptime')).toBeInTheDocument();
  });

  it('shows empty state when dashboard has no data and no global data', async () => {
    api.getSitioDashboard.mockResolvedValue(mockEmptyDashboard);

    renderSitioDetail(1);

    await waitFor(() => {
      expect(screen.getByText('Sin datos de monitoreo')).toBeInTheDocument();
    });

    expect(screen.getByText(/agregó recientemente/)).toBeInTheDocument();
  });

  it('shows range-empty state when site has data but not in current range', async () => {
    api.getSitioDashboard.mockResolvedValue(mockRangeEmptyDashboard);

    renderSitioDetail(1);

    await waitFor(() => {
      expect(screen.getByText('Sin datos en este rango')).toBeInTheDocument();
    });

    expect(screen.getByText(/50 chequeos/)).toBeInTheDocument();
    expect(screen.getByText('OldSite')).toBeInTheDocument();
  });

  it('shows error state when API fails', async () => {
    api.getSitioDashboard.mockRejectedValue(new Error('API Error'));

    renderSitioDetail(1);

    await waitFor(() => {
      expect(screen.getByText('Error cargando dashboard')).toBeInTheDocument();
    });
  });

  it('displays status badge with label', async () => {
    api.getSitioDashboard.mockResolvedValue(mockDashboard);

    renderSitioDetail(1);

    await waitFor(() => {
      expect(screen.getByText('UP')).toBeInTheDocument();
    });
  });

  it('shows total check count', async () => {
    api.getSitioDashboard.mockResolvedValue(mockDashboard);

    renderSitioDetail(1);

    const totalText = await screen.findByText(/Total de chequeos/);
    expect(totalText).toBeInTheDocument();
  });

  it('displays latency gauge with values', async () => {
    api.getSitioDashboard.mockResolvedValue(mockDashboard);

    renderSitioDetail(1);

    await waitFor(() => {
      expect(screen.getAllByText('ms').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('calls onBack when back button is clicked', async () => {
    api.getSitioDashboard.mockResolvedValue(mockDashboard);

    const { onBack } = renderSitioDetail(1);

    await waitFor(() => {
      expect(screen.getByText('Example')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('\u2190 Volver'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('renders LatencyChart via Suspense when timeline has data', async () => {
    api.getSitioDashboard.mockResolvedValue(mockDashboard);

    renderSitioDetail(1);

    await waitFor(() => {
      expect(screen.getByTestId('latency-chart')).toBeInTheDocument();
    });
  });

  it('shows error box with back button on API failure', async () => {
    api.getSitioDashboard.mockRejectedValue(new Error('API Error'));

    const { onBack } = renderSitioDetail(1);

    await waitFor(() => {
      expect(screen.getByText('Error cargando dashboard')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('\u2190 Volver'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('shows empty box with back button when no data', async () => {
    api.getSitioDashboard.mockResolvedValue(mockEmptyDashboard);

    const { onBack } = renderSitioDetail(1);

    await waitFor(() => {
      expect(screen.getByText('Sin datos de monitoreo')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('\u2190 Volver al Dashboard'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('displays info box with total checks, range, and last check time', async () => {
    api.getSitioDashboard.mockResolvedValue(mockDashboard);

    renderSitioDetail(1);

    await waitFor(() => {
      expect(screen.getByText(/Total de chequeos/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Rango/)).toBeInTheDocument();
  });

  it('renders range selector with 6 buttons', async () => {
    api.getSitioDashboard.mockResolvedValue(mockDashboard);

    renderSitioDetail(1);

    await waitFor(() => {
      expect(screen.getByText('Example')).toBeInTheDocument();
    });

    expect(screen.getByText('1h')).toBeInTheDocument();
    const rangeButtons = screen.getAllByText('24h');
    expect(rangeButtons.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('7d')).toBeInTheDocument();
    expect(screen.getByText('30d')).toBeInTheDocument();
    expect(screen.getByText('90d')).toBeInTheDocument();
    expect(screen.getByText('All')).toBeInTheDocument();
  });

  it('calls getSitioDashboard on mount with default range 24h', async () => {
    api.getSitioDashboard.mockResolvedValue(mockDashboard);

    renderSitioDetail(1);

    await waitFor(() => {
      expect(api.getSitioDashboard).toHaveBeenCalledWith(1, 'fake-token', '24h');
    });
  });
});
