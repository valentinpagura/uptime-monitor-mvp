import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KpiCard } from '../../components/KpiCard';

describe('KpiCard', () => {
  it('renders label and value', () => {
    render(<KpiCard label="Passing Sites" value="42" variant="primary" />);
    expect(screen.getByText('Passing Sites')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders value with unit for neutral variant', () => {
    render(<KpiCard label="Avg Latency" value={150} unit="ms" variant="neutral" />);
    expect(screen.getByText('Avg Latency')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('ms')).toBeInTheDocument();
  });

  it('does not render unit when value is null', () => {
    render(<KpiCard label="Avg Latency" value={null} unit="ms" variant="neutral" />);
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.queryByText('ms')).not.toBeInTheDocument();
  });

  it('shows em dash for null value', () => {
    render(<KpiCard label="Test" value={null} variant="primary" />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('does not render dot for neutral variant', () => {
    const { container } = render(
      <KpiCard label="Test" value="10" variant="neutral" />,
    );
    const dot = container.querySelector('[style*="border-radius: 50%"]');
    expect(dot).not.toBeInTheDocument();
  });

  it('renders status dot for primary variant', () => {
    const { container } = render(
      <KpiCard label="Passing" value="5" variant="primary" />,
    );
    const outerDots = container.querySelectorAll('[style*="border-radius: 50%"]');
    expect(outerDots.length).toBeGreaterThanOrEqual(1);
  });

  it('renders with error variant', () => {
    render(<KpiCard label="Failed" value="1" variant="error" />);
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders with warning variant', () => {
    render(<KpiCard label="Warnings" value="3" variant="warning" />);
    expect(screen.getByText('Warnings')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
