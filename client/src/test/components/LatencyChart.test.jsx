import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LatencyChart } from '../../components/LatencyChart';

const mockLine = vi.hoisted(() => vi.fn(() => <div data-testid="mock-chart" />));
vi.mock('react-chartjs-2', () => ({
  Line: mockLine,
}));

afterEach(() => {
  vi.restoreAllMocks();
});

function makeBucket(latencia_promedio, was_online, bucket, latencia_min, latencia_max) {
  return { latencia_promedio, was_online, bucket, latencia_min, latencia_max, checks: 1 };
}

describe('LatencyChart', () => {
  it('returns null when timeline is empty', () => {
    const { container } = render(<LatencyChart timeline={[]} range="24h" />);
    expect(container.innerHTML).toBe('');
  });

  it('returns null when timeline is undefined', () => {
    const { container } = render(<LatencyChart timeline={undefined} range="24h" />);
    expect(container.innerHTML).toBe('');
  });

  it('shows waiting message when timeline has exactly 1 point', () => {
    render(
      <LatencyChart
        timeline={[makeBucket(150, true, '2026-07-22T10:00:00Z')]}
        range="24h"
      />,
    );

    expect(screen.getByText('Esperando más datos para mostrar el gráfico.')).toBeInTheDocument();
    expect(screen.getByText('150 ms')).toBeInTheDocument();
  });

  it('shows "Sin respuesta" when single point is offline', () => {
    render(
      <LatencyChart
        timeline={[makeBucket(null, false, '2026-07-22T10:00:00Z')]}
        range="24h"
      />,
    );

    expect(screen.getByText('Sin respuesta')).toBeInTheDocument();
  });

  it('renders chart title and reset button when 2+ points exist', () => {
    render(
      <LatencyChart
        timeline={[
          makeBucket(100, true, '2026-07-22T10:00:00Z'),
          makeBucket(200, true, '2026-07-22T11:00:00Z'),
        ]}
        range="24h"
      />,
    );

    expect(screen.getByText('Histórico de Latencia')).toBeInTheDocument();
    expect(screen.getByText('Reset Zoom')).toBeInTheDocument();
  });

  it('passes data with x as Date and y as latency to Line (2+ points)', () => {
    render(
      <LatencyChart
        timeline={[
          makeBucket(150, true, '2026-07-22T10:00:00Z'),
          makeBucket(200, true, '2026-07-22T11:00:00Z'),
        ]}
        range="24h"
      />,
    );

    const lastCall = mockLine.mock.calls[mockLine.mock.calls.length - 1][0];
    const data = lastCall.data.datasets[0].data;
    expect(data).toHaveLength(2);
    expect(data[0].x).toBeInstanceOf(Date);
    expect(data[0].y).toBe(150);
    expect(data[1].y).toBe(200);
  });

  it('sets y to null for offline points (2+ points)', () => {
    render(
      <LatencyChart
        timeline={[
          makeBucket(300, false, '2026-07-22T10:00:00Z'),
          makeBucket(100, true, '2026-07-22T11:00:00Z'),
        ]}
        range="24h"
      />,
    );

    const lastCall = mockLine.mock.calls[mockLine.mock.calls.length - 1][0];
    expect(lastCall.data.datasets[0].data[0].y).toBeNull();
    expect(lastCall.data.datasets[0].data[1].y).toBe(100);
  });

  it('sets spanGaps to false', () => {
    render(
      <LatencyChart
        timeline={[makeBucket(100, true, '2026-07-22T10:00:00Z')]}
        range="24h"
      />,
    );

    const lastCall = mockLine.mock.calls[mockLine.mock.calls.length - 1][0];
    expect(lastCall.data.datasets[0].spanGaps).toBe(false);
  });

  it('uses TimeScale for x axis', () => {
    render(
      <LatencyChart
        timeline={[makeBucket(100, true, '2026-07-22T10:00:00Z')]}
        range="24h"
      />,
    );

    const lastCall = mockLine.mock.calls[mockLine.mock.calls.length - 1][0];
    expect(lastCall.options.scales.x.type).toBe('time');
  });

  it('renders range hint with bucket count', () => {
    render(
      <LatencyChart
        timeline={[
          makeBucket(100, true, '2026-07-22T10:00:00Z'),
          makeBucket(200, true, '2026-07-22T11:00:00Z'),
        ]}
        range="24h"
      />,
    );

    expect(screen.getByText(/Rango: 24h/)).toBeInTheDocument();
    expect(screen.getByText(/2 buckets/)).toBeInTheDocument();
  });

  it('tooltip shows full datetime on title callback', () => {
    render(
      <LatencyChart
        timeline={[makeBucket(150, true, '2026-07-22T10:00:00Z')]}
        range="24h"
      />,
    );

    const lastCall = mockLine.mock.calls[mockLine.mock.calls.length - 1][0];
    const tooltip = lastCall.options.plugins.tooltip;
    const title = tooltip.callbacks.title([{ raw: { x: new Date('2026-07-22T10:00:00Z') } }]);
    expect(title).toContain('22/07/2026');
  });

  it('tooltip shows "Online · N ms" for valid data', () => {
    render(
      <LatencyChart
        timeline={[makeBucket(250, true, '2026-07-22T10:00:00Z')]}
        range="24h"
      />,
    );

    const lastCall = mockLine.mock.calls[mockLine.mock.calls.length - 1][0];
    const tooltip = lastCall.options.plugins.tooltip;
    const label = tooltip.callbacks.label({ raw: { y: 250 } });
    expect(label).toContain('Online');
    expect(label).toContain('250 ms');
  });

  it('tooltip shows "Offline — Sin respuesta" for null data', () => {
    render(
      <LatencyChart
        timeline={[makeBucket(null, false, '2026-07-22T10:00:00Z')]}
        range="24h"
      />,
    );

    const lastCall = mockLine.mock.calls[mockLine.mock.calls.length - 1][0];
    const tooltip = lastCall.options.plugins.tooltip;
    const label = tooltip.callbacks.label({ raw: { y: null } });
    expect(label).toContain('Offline');
    expect(label).toContain('Sin respuesta');
  });

  it('enables zoom plugin with pan and wheel zoom', () => {
    render(
      <LatencyChart
        timeline={[makeBucket(100, true, '2026-07-22T10:00:00Z')]}
        range="24h"
      />,
    );

    const lastCall = mockLine.mock.calls[mockLine.mock.calls.length - 1][0];
    const zoom = lastCall.options.plugins.zoom;
    expect(zoom.pan.enabled).toBe(true);
    expect(zoom.zoom.wheel.enabled).toBe(true);
  });

});
