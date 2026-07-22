import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RangeSelector } from '../../components/RangeSelector';

describe('RangeSelector', () => {
  it('renders all 6 range buttons', () => {
    render(<RangeSelector activeRange="24h" onRangeChange={() => {}} />);

    expect(screen.getByText('1h')).toBeInTheDocument();
    expect(screen.getByText('24h')).toBeInTheDocument();
    expect(screen.getByText('7d')).toBeInTheDocument();
    expect(screen.getByText('30d')).toBeInTheDocument();
    expect(screen.getByText('90d')).toBeInTheDocument();
    expect(screen.getByText('All')).toBeInTheDocument();
  });

  it('highlights the active range button', () => {
    render(<RangeSelector activeRange="7d" onRangeChange={() => {}} />);

    const btn = screen.getByText('7d');
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('does not highlight inactive buttons', () => {
    render(<RangeSelector activeRange="7d" onRangeChange={() => {}} />);

    expect(screen.getByText('1h')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('24h')).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onRangeChange with the clicked range key', () => {
    const onRangeChange = vi.fn();
    render(<RangeSelector activeRange="24h" onRangeChange={onRangeChange} />);

    fireEvent.click(screen.getByText('90d'));
    expect(onRangeChange).toHaveBeenCalledWith('90d');
  });

  it('has role="group" with accessible label', () => {
    render(<RangeSelector activeRange="24h" onRangeChange={() => {}} />);

    const group = screen.getByRole('group');
    expect(group).toHaveAttribute('aria-label', 'Rango de tiempo');
  });
});
