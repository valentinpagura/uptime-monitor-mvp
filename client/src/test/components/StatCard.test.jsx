import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from '../../components/StatCard';

describe('StatCard', () => {
  it('renders title and value', () => {
    render(<StatCard title="Latency" value={120} unit="ms" color="#4ade80" icon="⚡" />);
    expect(screen.getByText('Latency')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
  });

  it('renders unit next to value', () => {
    render(<StatCard title="Uptime" value={99.5} unit="%" color="#4ade80" icon="✅" />);
    expect(screen.getByText('99.5')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('shows em dash when value is null', () => {
    render(<StatCard title="Current Latency" value={null} unit="ms" color="gray" icon="⚡" />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders with zero value', () => {
    render(<StatCard title="Test" value={0} unit="ms" color="#fff" icon="📊" />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders the provided icon', () => {
    render(<StatCard title="Min" value={5} unit="ms" color="#4ade80" icon="📉" />);
    expect(screen.getByText('📉')).toBeInTheDocument();
  });

  it('applies color to the value text', () => {
    render(
      <StatCard title="Max" value={500} unit="ms" color="#ff6b6b" icon="📈" />,
    );
    expect(screen.getByText('500')).toHaveStyle('color: #ff6b6b');
  });
});
