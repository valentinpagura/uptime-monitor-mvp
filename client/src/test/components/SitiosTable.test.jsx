import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SitiosTable } from '../../components/SitiosTable';

const mockSitios = [
  {
    id: 1,
    url: 'https://google.com',
    nombre: 'Google',
    frecuencia_minutos: 5,
    ultimoLog: { is_online: true, latencia_ms: 120, created_at: '2026-07-02T12:00:00Z' },
  },
  {
    id: 2,
    url: 'https://example.com',
    nombre: null,
    frecuencia_minutos: 5,
    ultimoLog: { is_online: false, latencia_ms: null, created_at: '2026-07-02T12:00:00Z' },
  },
  {
    id: 3,
    url: 'https://slow-site.com',
    nombre: 'Slow',
    frecuencia_minutos: 10,
    ultimoLog: { is_online: true, latencia_ms: 450, created_at: '2026-07-02T12:00:00Z' },
  },
  {
    id: 4,
    url: 'https://pending.com',
    nombre: 'Pending',
    frecuencia_minutos: 5,
    ultimoLog: null,
  },
];

describe('SitiosTable', () => {
  it('renders the table header', () => {
    render(<SitiosTable sitios={[]} onRowClick={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('Active Monitors')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('shows empty state when sitios array is empty', () => {
    render(<SitiosTable sitios={[]} onRowClick={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('No monitored sites yet')).toBeInTheDocument();
  });

  it('renders all sites', () => {
    render(<SitiosTable sitios={mockSitios} onRowClick={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.getAllByText('https://example.com').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Slow')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('shows UP status for healthy site', () => {
    render(<SitiosTable sitios={[mockSitios[0]]} onRowClick={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('UP')).toBeInTheDocument();
  });

  it('shows DOWN status for offline site', () => {
    render(<SitiosTable sitios={[mockSitios[1]]} onRowClick={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('DOWN')).toBeInTheDocument();
  });

  it('shows WARN status for high latency site', () => {
    render(<SitiosTable sitios={[mockSitios[2]]} onRowClick={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('WARN')).toBeInTheDocument();
  });

  it('shows PENDING status for site without logs', () => {
    render(<SitiosTable sitios={[mockSitios[3]]} onRowClick={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });

  it('shows latency in ms for online sites', () => {
    render(<SitiosTable sitios={[mockSitios[0]]} onRowClick={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('120ms')).toBeInTheDocument();
  });

  it('shows Timeout for offline sites', () => {
    render(<SitiosTable sitios={[mockSitios[1]]} onRowClick={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('Timeout')).toBeInTheDocument();
  });

  it('shows em dash for pending sites', () => {
    render(<SitiosTable sitios={[mockSitios[3]]} onRowClick={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('calls onRowClick when a row is clicked', () => {
    const onRowClick = vi.fn();
    render(<SitiosTable sitios={[mockSitios[0]]} onRowClick={onRowClick} onDelete={() => {}} />);
    fireEvent.click(screen.getByText('Google'));
    expect(onRowClick).toHaveBeenCalledWith(1);
  });

  it('shows View All button as inert with opacity 0.2', () => {
    render(<SitiosTable sitios={[]} onRowClick={() => {}} onDelete={() => {}} />);
    const viewAll = screen.getByText('View All');
    expect(viewAll).toBeInTheDocument();
    expect(viewAll).toHaveStyle('opacity: 0.2');
  });

  it('shows frequency in minutes', () => {
    render(<SitiosTable sitios={[mockSitios[0]]} onRowClick={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('5m')).toBeInTheDocument();
  });

  it('shows context menu button for each row', () => {
    const { container } = render(
      <SitiosTable sitios={[mockSitios[0]]} onRowClick={() => {}} onDelete={() => {}} />,
    );
    const menuBtn = container.querySelector('.db-row-menu-btn');
    expect(menuBtn).toBeInTheDocument();
  });

  it('opens context menu on button click and shows Eliminar', () => {
    render(<SitiosTable sitios={[mockSitios[0]]} onRowClick={() => {}} onDelete={() => {}} />);
    const menuBtn = document.querySelector('.db-row-menu-btn');
    fireEvent.click(menuBtn);
    expect(screen.getByText((c, el) => el.tagName === 'BUTTON' && c.includes('Eliminar'))).toBeInTheDocument();
  });

  it('calls onDelete with site id from context menu', () => {
    const onDelete = vi.fn();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<SitiosTable sitios={[mockSitios[0]]} onRowClick={() => {}} onDelete={onDelete} />);
    const menuBtn = document.querySelector('.db-row-menu-btn');
    fireEvent.click(menuBtn);
    fireEvent.click(screen.getByText((c, el) => el.tagName === 'BUTTON' && c.includes('Eliminar')));
    expect(onDelete).toHaveBeenCalledWith(1);
    confirmSpy.mockRestore();
  });

  it('shows site URL in table', () => {
    render(<SitiosTable sitios={[mockSitios[0]]} onRowClick={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('https://google.com')).toBeInTheDocument();
  });
});
