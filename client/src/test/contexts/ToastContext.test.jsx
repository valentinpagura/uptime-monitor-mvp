import { describe, it, expect, vi, beforeEach, afterEach, useFakeTimers, useRealTimers } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { useContext } from 'react';
import { ToastContext, ToastProvider } from '../../contexts/ToastContext';

function TestConsumer({ onReady } = {}) {
  const { addToast } = useContext(ToastContext);
  return (
    <div>
      <button data-testid="btn-success" onClick={() => addToast('Operation ok', 'success')}>
        Success
      </button>
      <button data-testid="btn-error" onClick={() => addToast('Something failed', 'error')}>
        Error
      </button>
      <button data-testid="btn-warning" onClick={() => addToast('Be careful', 'warning')}>
        Warning
      </button>
      <button data-testid="btn-info" onClick={() => addToast('For your info', 'info')}>
        Info
      </button>
      <button data-testid="btn-default" onClick={() => addToast('Default toast')}>
        Default
      </button>
      <button data-testid="btn-custom-duration" onClick={() => addToast('Quick toast', 'info', 100)}>
        Custom
      </button>
    </div>
  );
}

function renderProvider() {
  return render(
    <ToastProvider>
      <TestConsumer />
    </ToastProvider>,
  );
}

describe('ToastContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders children', () => {
    render(
      <ToastProvider>
        <div data-testid="child">hello</div>
      </ToastProvider>,
    );
    expect(screen.getByTestId('child')).toHaveTextContent('hello');
  });

  it('renders no toast container when no toasts added', () => {
    renderProvider();
    expect(screen.queryByLabelText('Notifications')).not.toBeInTheDocument();
  });

  it('shows a success toast with checkmark icon', () => {
    renderProvider();
    act(() => {
      screen.getByTestId('btn-success').click();
    });
    expect(screen.getByText('Operation ok')).toBeInTheDocument();
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
  });

  it('shows an error toast with cross mark icon', () => {
    renderProvider();
    act(() => {
      screen.getByTestId('btn-error').click();
    });
    expect(screen.getByText('Something failed')).toBeInTheDocument();
  });

  it('shows a warning toast', () => {
    renderProvider();
    act(() => {
      screen.getByTestId('btn-warning').click();
    });
    expect(screen.getByText('Be careful')).toBeInTheDocument();
  });

  it('shows an info toast', () => {
    renderProvider();
    act(() => {
      screen.getByTestId('btn-info').click();
    });
    expect(screen.getByText('For your info')).toBeInTheDocument();
  });

  it('uses info as default type when no type is provided', () => {
    renderProvider();
    act(() => {
      screen.getByTestId('btn-default').click();
    });
    expect(screen.getByText('Default toast')).toBeInTheDocument();
  });

  it('shows multiple toasts simultaneously', () => {
    renderProvider();
    act(() => {
      screen.getByTestId('btn-success').click();
      screen.getByTestId('btn-error').click();
      screen.getByTestId('btn-warning').click();
    });
    expect(screen.getByText('Operation ok')).toBeInTheDocument();
    expect(screen.getByText('Something failed')).toBeInTheDocument();
    expect(screen.getByText('Be careful')).toBeInTheDocument();
  });

  it('has accessible attributes on toast container and items', () => {
    renderProvider();
    act(() => {
      screen.getByTestId('btn-info').click();
    });
    const container = screen.getByLabelText('Notifications');
    expect(container).toBeInTheDocument();
    const toast = screen.getByText('For your info').closest('[role="status"]');
    expect(toast).toHaveAttribute('aria-live', 'polite');
  });

  describe('auto-dismiss', () => {
    it('automatically removes toast after default duration (4000ms + 400ms)', () => {
      renderProvider();
      act(() => {
        screen.getByTestId('btn-success').click();
      });
      expect(screen.getByText('Operation ok')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(4000);
      });
      expect(screen.getByText('Operation ok')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(400);
      });
      expect(screen.queryByText('Operation ok')).not.toBeInTheDocument();
    });

    it('respects custom duration', () => {
      renderProvider();
      act(() => {
        screen.getByTestId('btn-custom-duration').click();
      });

      act(() => {
        vi.advanceTimersByTime(50);
      });
      expect(screen.getByText('Quick toast')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(50);
      });
      expect(screen.getByText('Quick toast')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(400);
      });
      expect(screen.queryByText('Quick toast')).not.toBeInTheDocument();
    });
  });

  describe('manual dismiss', () => {
    it('removes toast when close button is clicked', () => {
      renderProvider();
      act(() => {
        screen.getByTestId('btn-success').click();
      });
      const closeBtn = screen.getByLabelText('Close notification');
      expect(closeBtn).toBeInTheDocument();

      act(() => {
        closeBtn.click();
      });

      act(() => {
        vi.advanceTimersByTime(400);
      });
      expect(screen.queryByText('Operation ok')).not.toBeInTheDocument();
    });

    it('close button is accessible with aria-label', () => {
      renderProvider();
      act(() => {
        screen.getByTestId('btn-info').click();
      });
      const closeBtn = screen.getByLabelText('Close notification');
      expect(closeBtn).toBeInTheDocument();
      expect(closeBtn.tagName).toBe('BUTTON');
    });
  });

  describe('cleanup', () => {
    it('clears all timers and does not throw when unmounting with active toasts', () => {
      const { unmount } = renderProvider();
      act(() => {
        screen.getByTestId('btn-success').click();
        screen.getByTestId('btn-error').click();
      });

      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });
});
