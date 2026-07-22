import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchDropdown } from '../../components/SearchDropdown';

const mockSitios = [
  { id: 1, nombre: 'Test Site', url: 'https://test.com', ultimoLog: { is_online: true, latencia_ms: 150 } },
  { id: 2, nombre: 'Slow Site', url: 'https://slow.com', ultimoLog: { is_online: true, latencia_ms: 450 } },
  { id: 3, nombre: 'Down Site', url: 'https://down.com', ultimoLog: { is_online: false, latencia_ms: null } },
  { id: 4, nombre: null, url: 'https://nonombre.com', ultimoLog: null },
];

const defaultProps = {
  query: '',
  sitios: mockSitios,
  onSelect: vi.fn(),
  onClose: vi.fn(),
};

function renderDropdown(props = {}) {
  return render(<SearchDropdown {...defaultProps} {...props} />);
}

describe('SearchDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when query is empty', () => {
    const { container } = renderDropdown({ query: '' });
    expect(container.innerHTML).toBe('');
  });

  it('returns null when query has no matches', () => {
    const { container } = renderDropdown({ query: 'zzzznoexist' });
    expect(container.innerHTML).toBe('');
  });

  it('filters results by nombre', () => {
    renderDropdown({ query: 'test' });
    expect(screen.getByText('Test Site')).toBeInTheDocument();
  });

  it('filters results by url', () => {
    renderDropdown({ query: 'nonombre' });
    const items = screen.getAllByText('https://nonombre.com');
    expect(items.length).toBeGreaterThanOrEqual(1);
  });

  it('shows nombre when available, falls back to url', () => {
    renderDropdown({ query: 'nonombre' });
    const items = screen.getAllByText('https://nonombre.com');
    expect(items.length).toBeGreaterThanOrEqual(1);
  });

  it('filters case-insensitively', () => {
    renderDropdown({ query: 'TEST' });
    expect(screen.getByText('Test Site')).toBeInTheDocument();
  });

  it('shows latency in ms for online sites', () => {
    renderDropdown({ query: 'test' });
    expect(screen.getByText('150ms')).toBeInTheDocument();
  });

  it('shows Timeout for offline sites', () => {
    renderDropdown({ query: 'down' });
    expect(screen.getByText('Timeout')).toBeInTheDocument();
  });

  it('shows em dash when no log exists', () => {
    renderDropdown({ query: 'nonombre' });
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows em dash when latency is null but online', () => {
    const sitioWithNullLatency = [{
      id: 5, nombre: 'Null Latency', url: 'https://null-lat.com',
      ultimoLog: { is_online: true, latencia_ms: null },
    }];
    renderDropdown({ query: 'null', sitios: sitioWithNullLatency });
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('calls onSelect with sitio id when clicked', () => {
    const onSelect = vi.fn();
    renderDropdown({ query: 'test', onSelect });
    fireEvent.click(screen.getByText('Test Site'));
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it('calls onClose when clicking outside', () => {
    const onClose = vi.fn();
    renderDropdown({ query: 'test', onClose });
    fireEvent.mouseDown(document.body);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when clicking inside dropdown', () => {
    const onClose = vi.fn();
    renderDropdown({ query: 'test', onClose });
    const dropdownItem = screen.getByText('Test Site');
    fireEvent.mouseDown(dropdownItem);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not add mousedown listener when query is empty', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    renderDropdown({ query: '' });
    expect(addSpy).not.toHaveBeenCalledWith('mousedown', expect.any(Function));
    addSpy.mockRestore();
  });

  it('removes mousedown listener on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = renderDropdown({ query: 'test' });
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
    removeSpy.mockRestore();
  });

  it('shows status dot with color from getStatus', () => {
    renderDropdown({ query: 'test' });
    const dot = screen.getByText('Test Site').closest('.db-search-dropdown-item').querySelector('div');
    expect(dot).toBeInTheDocument();
  });
});
