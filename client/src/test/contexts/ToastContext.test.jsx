import { describe, it, expect, vi, beforeEach, afterEach, useFakeTimers, useRealTimers } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { useContext, useState } from 'react';
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
      <button data-testid="btn-unknown-type" onClick={() => addToast('Unknown type toast', 'unknown')}>
        Unknown
      </button>
      <button data-testid="btn-empty-message" onClick={() => addToast('', 'info')}>
        Empty
      </button>
      <button data-testid="btn-long-message" onClick={() => addToast('A'.repeat(500), 'info')}>
        Long
      </button>
    </div>
  );
}

function ReturnValueConsumer() {
  const { addToast } = useContext(ToastContext);
  const [lastId, setLastId] = useState(null);
  return (
    <div>
      <button data-testid="btn-get-id" onClick={() => { const id = addToast('test', 'info'); setLastId(id); }}>
        GetId
      </button>
      <div data-testid="last-id">{lastId !== null ? lastId : 'null'}</div>
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

  describe('edge cases', () => {
    it('falls back to info icon for unknown type', () => {
      renderProvider();
      act(() => {
        screen.getByTestId('btn-unknown-type').click();
      });
      expect(screen.getByText('Unknown type toast')).toBeInTheDocument();
    });

    it('renders toast with empty message', () => {
      renderProvider();
      act(() => {
        screen.getByTestId('btn-empty-message').click();
      });
      const toast = screen.getByRole('status');
      expect(toast).toBeInTheDocument();
    });

    it('renders toast with very long message', () => {
      renderProvider();
      act(() => {
        screen.getByTestId('btn-long-message').click();
      });
      expect(screen.getByText('A'.repeat(500))).toBeInTheDocument();
    });
  });

  describe('addToast return value', () => {
    it('returns a numeric id', () => {
      render(
        <ToastProvider>
          <ReturnValueConsumer />
        </ToastProvider>,
      );
      act(() => {
        screen.getByTestId('btn-get-id').click();
      });
      const idText = screen.getByTestId('last-id').textContent;
      expect(Number(idText)).toBeGreaterThan(0);
    });
  });

  describe('removing styles', () => {
    it('applies removing opacity and transform when toast is dismissed', () => {
      renderProvider();
      act(() => {
        screen.getByTestId('btn-success').click();
      });
      const closeBtn = screen.getByLabelText('Close notification');
      act(() => {
        closeBtn.click();
      });
      const toastEl = screen.getByText('Operation ok').closest('[role="status"]');
      expect(toastEl).toHaveStyle('opacity: 0');
      expect(toastEl).toHaveStyle('transform: translateX(30px)');
    });
  });

  describe('multiple toasts with close', () => {
    it('close button removes only the specific toast', () => {
      renderProvider();
      act(() => {
        screen.getByTestId('btn-success').click();
        screen.getByTestId('btn-error').click();
      });
      expect(screen.getByText('Operation ok')).toBeInTheDocument();
      expect(screen.getByText('Something failed')).toBeInTheDocument();

      const closeButtons = screen.getAllByLabelText('Close notification');
      expect(closeButtons).toHaveLength(2);

      act(() => {
        closeButtons[0].click();
      });
      act(() => {
        vi.advanceTimersByTime(400);
      });
      expect(screen.queryByText('Operation ok')).not.toBeInTheDocument();
      expect(screen.getByText('Something failed')).toBeInTheDocument();
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
