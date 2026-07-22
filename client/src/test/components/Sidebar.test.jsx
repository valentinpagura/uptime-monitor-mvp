import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '../../components/Sidebar';

function renderSidebar(props = {}) {
  return render(<Sidebar {...props} />);
}

describe('Sidebar', () => {
  it('renders logo section with title and version', () => {
    renderSidebar();
    expect(screen.getByText('NOC-UPTIME')).toBeInTheDocument();
    expect(screen.getByText('V 2.4.0-Stable')).toBeInTheDocument();
  });

  it('renders Deploy Probe button with aria-label', () => {
    renderSidebar();
    const btn = screen.getByRole('button', { name: /add new monitor probe/i });
    expect(btn).toBeInTheDocument();
  });

  it('renders all nav items', () => {
    renderSidebar();
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Monitors')).toBeInTheDocument();
    expect(screen.getByText('Incidents')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders bottom items: Help and Sign Out', () => {
    renderSidebar();
    expect(screen.getByText('Help')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('marks Overview with aria-current="page"', () => {
    renderSidebar();
    const overview = screen.getByText('Overview').closest('[aria-current]');
    expect(overview).toHaveAttribute('aria-current', 'page');
  });

  it('marks inert items with aria-disabled="true"', () => {
    renderSidebar();
    const monitors = screen.getByText('Monitors').closest('[aria-disabled]');
    expect(monitors).toHaveAttribute('aria-disabled', 'true');
  });

  it('marks Help as inert with aria-disabled', () => {
    renderSidebar();
    const help = screen.getByText('Help').closest('[aria-disabled]');
    expect(help).toHaveAttribute('aria-disabled', 'true');
  });

  it('calls onLogout when Sign Out is clicked', () => {
    const onLogout = vi.fn();
    renderSidebar({ onLogout });
    fireEvent.click(screen.getByText('Sign Out'));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('calls onAddProbe when Deploy Probe is clicked', () => {
    const onAddProbe = vi.fn();
    renderSidebar({ onAddProbe });
    fireEvent.click(screen.getByRole('button', { name: /add new monitor probe/i }));
    expect(onAddProbe).toHaveBeenCalledTimes(1);
  });

  it('calls onLogout via Enter key on Sign Out', () => {
    const onLogout = vi.fn();
    renderSidebar({ onLogout });
    const signOut = screen.getByText('Sign Out').closest('[role="menuitem"]');
    fireEvent.keyDown(signOut, { key: 'Enter' });
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('calls onLogout via Space key on Sign Out', () => {
    const onLogout = vi.fn();
    renderSidebar({ onLogout });
    const signOut = screen.getByText('Sign Out').closest('[role="menuitem"]');
    fireEvent.keyDown(signOut, { key: ' ' });
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('does not throw when callbacks are undefined', () => {
    renderSidebar();
    expect(() => {
      fireEvent.click(screen.getByRole('button', { name: /add new monitor probe/i }));
    }).not.toThrow();
  });

  it('nav has aria-label="Main navigation"', () => {
    renderSidebar();
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
  });

  it('Sign Out has tabIndex={0}', () => {
    renderSidebar();
    const signOut = screen.getByText('Sign Out').closest('[tabindex]');
    expect(signOut).toHaveAttribute('tabindex', '0');
  });
});
