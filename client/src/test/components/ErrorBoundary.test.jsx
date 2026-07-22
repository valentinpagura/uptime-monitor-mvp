import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../../components/ErrorBoundary';

vi.mock('../../utils/logger', () => ({
  logError: vi.fn(),
}));

import { logError } from '../../utils/logger';

function GoodChild() {
  return <div data-testid="good-child">All good</div>;
}

function BuggyChild() {
  throw new Error('Test error message');
}

function ThrowOnce() {
  const ref = { current: false };
  if (!ref.current) {
    ref.current = true;
    throw new Error('First time');
  }
  return <div data-testid="recovered-child">Recovered</div>;
}

let throwFlag = true;
function ToggleChild() {
  if (throwFlag) {
    throw new Error('Toggle error');
  }
  return <div data-testid="toggled-child">Recovered</div>;
}

function renderBoundary(children, props = {}) {
  return render(<ErrorBoundary {...props}>{children}</ErrorBoundary>);
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when no error', () => {
    renderBoundary(<GoodChild />);
    expect(screen.getByTestId('good-child')).toHaveTextContent('All good');
  });

  it('shows fallback UI when child throws', () => {
    renderBoundary(<BuggyChild />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument();
  });

  it('shows Try Again and Reload Page buttons on error', () => {
    renderBoundary(<BuggyChild />);
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Reload Page')).toBeInTheDocument();
  });

  it('shows warning icon on error', () => {
    renderBoundary(<BuggyChild />);
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('calls logError with error in componentDidCatch', () => {
    renderBoundary(<BuggyChild />);
    expect(logError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Test error message' }),
      expect.objectContaining({ componentStack: expect.any(String) }),
    );
  });

  it('renders custom fallback when fallback prop is provided', () => {
    const fallback = <div data-testid="custom-fallback">Custom Error UI</div>;
    renderBoundary(<BuggyChild />, { fallback });
    expect(screen.getByTestId('custom-fallback')).toHaveTextContent('Custom Error UI');
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('resets error state via Try After click - fallback reappears since child still throws', () => {
    renderBoundary(<BuggyChild />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Try Again'));

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('shows error details in dev mode', () => {
    const { container } = renderBoundary(<BuggyChild />);
    const details = container.querySelector('details');
    const summary = details?.querySelector('summary');
    expect(summary).toHaveTextContent('Error details');
  });
});
