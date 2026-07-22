import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TopBar } from '../../components/TopBar';

const defaultProps = {
  searchValue: '',
  onSearchChange: vi.fn(),
  onRefresh: vi.fn(),
  sitios: [],
  onSearchSelect: vi.fn(),
  onSearchClose: vi.fn(),
};

function renderTopBar(props = {}) {
  return render(<TopBar {...defaultProps} {...props} />);
}

describe('TopBar', () => {
  it('renders search input with placeholder', () => {
    renderTopBar();
    const input = screen.getByPlaceholderText('Search systems...');
    expect(input).toBeInTheDocument();
  });

  it('renders search input with aria-label', () => {
    renderTopBar();
    expect(screen.getByLabelText('Search monitors')).toBeInTheDocument();
  });

  it('renders System Monitor title', () => {
    renderTopBar();
    expect(screen.getByText('System Monitor')).toBeInTheDocument();
  });

  it('renders Notifications button with aria-label', () => {
    renderTopBar();
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
  });

  it('renders Refresh button with aria-label', () => {
    renderTopBar();
    expect(screen.getByLabelText('Refresh')).toBeInTheDocument();
  });

  it('renders Terminal button with aria-label', () => {
    renderTopBar();
    expect(screen.getByLabelText('Terminal')).toBeInTheDocument();
  });

  it('calls onRefresh when Refresh button is clicked', () => {
    const onRefresh = vi.fn();
    renderTopBar({ onRefresh });
    fireEvent.click(screen.getByLabelText('Refresh'));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('passes searchValue to input', () => {
    renderTopBar({ searchValue: 'test-query' });
    expect(screen.getByPlaceholderText('Search systems...')).toHaveValue('test-query');
  });

  it('calls onSearchChange when input changes', () => {
    const onSearchChange = vi.fn();
    renderTopBar({ onSearchChange });
    fireEvent.change(screen.getByPlaceholderText('Search systems...'), { target: { value: 'a' } });
    expect(onSearchChange).toHaveBeenCalledTimes(1);
  });

  it('header has role="banner"', () => {
    renderTopBar();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('search icon has aria-hidden="true"', () => {
    renderTopBar();
    const icon = screen.getByText('🔍').closest('[aria-hidden]');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('Notifications and Terminal buttons have tabIndex={-1}', () => {
    renderTopBar();
    expect(screen.getByLabelText('Notifications')).toHaveAttribute('tabindex', '-1');
    expect(screen.getByLabelText('Terminal')).toHaveAttribute('tabindex', '-1');
  });
});
