import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LatencyGauge } from '../../components/LatencyGauge';

describe('LatencyGauge', () => {
  it('renders the gauge SVG', () => {
    const { container } = render(<LatencyGauge latencia={100} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('shows latency value in ms', () => {
    render(<LatencyGauge latencia={150} />);
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('ms')).toBeInTheDocument();
  });

  it('shows em dash when latencia is null', () => {
    render(<LatencyGauge latencia={null} />);
    expect(screen.getByText('\u2014')).toBeInTheDocument();
  });

  it('does not show ms unit when latencia is null', () => {
    render(<LatencyGauge latencia={null} />);
    expect(screen.queryByText('ms')).not.toBeInTheDocument();
  });

  it('uses dynamic max when maxLatencia is provided', () => {
    const { container } = render(<LatencyGauge latencia={100} maxLatencia={800} />);
    const texts = container.querySelectorAll('text');
    const textContents = Array.from(texts).map((t) => t.textContent);
    expect(textContents).toContain('520');
    expect(textContents).toContain('1040');
  });

  it('uses default max of 500 when no maxLatencia', () => {
    const { container } = render(<LatencyGauge latencia={300} />);
    const texts = container.querySelectorAll('text');
    const textContents = Array.from(texts).map((t) => t.textContent);
    expect(textContents).toContain('250');
    expect(textContents).toContain('500');
  });

  it('shows green color for latency under 200ms', () => {
    const { container } = render(<LatencyGauge latencia={50} />);
    const valueEl = container.querySelector('[style*="font-size: 32px"]');
    expect(valueEl).toHaveStyle('color: #4ade80');
  });

  it('shows yellow color for latency between 200 and 400ms', () => {
    const { container } = render(<LatencyGauge latencia={300} />);
    const valueEl = container.querySelector('[style*="font-size: 32px"]');
    expect(valueEl).toHaveStyle('color: #e7c365');
  });

  it('shows red color for latency over 400ms', () => {
    const { container } = render(<LatencyGauge latencia={500} />);
    const valueEl = container.querySelector('[style*="font-size: 32px"]');
    expect(valueEl).toHaveStyle('color: #ff6b6b');
  });

  it('shows gray color when latencia is null', () => {
    const { container } = render(<LatencyGauge latencia={null} />);
    const valueEl = container.querySelector('[style*="font-size: 32px"]');
    expect(valueEl).toHaveStyle('color: var(--db-outline-variant)');
  });

  it('treats NaN as no data (gray, no ms unit)', () => {
    render(<LatencyGauge latencia={NaN} />);
    expect(screen.getByText('\u2014')).toBeInTheDocument();
    expect(screen.queryByText('ms')).not.toBeInTheDocument();
  });

  it('treats undefined as no data', () => {
    render(<LatencyGauge latencia={undefined} />);
    expect(screen.getByText('\u2014')).toBeInTheDocument();
  });

  it('applies magic-glow-card class', () => {
    const { container } = render(<LatencyGauge latencia={100} />);
    const div = container.firstChild;
    expect(div).toHaveClass('magic-glow-card');
  });

  it('renders scale labels 0, half, and max', () => {
    const { container } = render(<LatencyGauge latencia={100} maxLatencia={500} />);
    const texts = container.querySelectorAll('text');
    const textContents = Array.from(texts).map((t) => t.textContent);
    expect(textContents).toContain('0');
    expect(textContents).toContain('325');
    expect(textContents).toContain('650');
  });

  it('renders header with "Latencia Actual" label', () => {
    render(<LatencyGauge latencia={100} />);
    expect(screen.getByText('Latencia Actual')).toBeInTheDocument();
  });

  it('renders max latency hint when maxLatencia provided', () => {
    render(<LatencyGauge latencia={100} maxLatencia={500} />);
    expect(screen.getByText('Máx: 500 ms')).toBeInTheDocument();
  });
});
