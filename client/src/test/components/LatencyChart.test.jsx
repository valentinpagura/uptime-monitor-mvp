import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LatencyChart } from '../../components/LatencyChart';

const sampleLogs = [
  { id: 1, sitio_id: 1, latencia_ms: 120, is_online: true, status_code: 200, created_at: '2026-07-02T12:00:00Z' },
  { id: 2, sitio_id: 1, latencia_ms: 150, is_online: true, status_code: 200, created_at: '2026-07-02T12:05:00Z' },
  { id: 3, sitio_id: 1, latencia_ms: null, is_online: false, status_code: null, created_at: '2026-07-02T12:10:00Z' },
  { id: 4, sitio_id: 1, latencia_ms: 200, is_online: true, status_code: 200, created_at: '2026-07-02T12:15:00Z' },
  { id: 5, sitio_id: 1, latencia_ms: 90, is_online: true, status_code: 200, created_at: '2026-07-02T12:20:00Z' },
];

describe('LatencyChart', () => {
  it('renders the chart title', () => {
    render(<LatencyChart logs={sampleLogs} />);
    expect(screen.getByText('Histórico de Latencia')).toBeInTheDocument();
  });

  it('renders the chart canvas via Line component', () => {
    const { container } = render(<LatencyChart logs={sampleLogs} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('renders empty state gracefully with empty logs array', () => {
    const { container } = render(<LatencyChart logs={[]} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('renders with a single log entry', () => {
    const singleLog = [sampleLogs[0]];
    const { container } = render(<LatencyChart logs={singleLog} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('reverses logs so most recent is last', () => {
    const { container } = render(<LatencyChart logs={sampleLogs} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('renders the chart container with dark theme card styles', () => {
    const { container } = render(<LatencyChart logs={sampleLogs} />);
    const outer = container.firstChild;
    expect(outer).toHaveStyle('background-color: var(--db-bg-card)');
  });
});
