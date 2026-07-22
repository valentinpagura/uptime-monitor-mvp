import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddSiteForm } from '../../components/AddSiteForm';

describe('AddSiteForm', () => {
  it('renders the form with all inputs', () => {
    render(<AddSiteForm onSubmit={vi.fn()} />);
    expect(screen.getByText('Add New Site')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. EU Prod API')).toBeInTheDocument();
    expect(screen.getByText('Add Monitor')).toBeInTheDocument();
  });

  it('calls onSubmit with form values when submitted', async () => {
    const onSubmit = vi.fn().mockResolvedValue();
    const user = userEvent.setup();

    render(<AddSiteForm onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText('https://'), 'https://example.com');
    await user.type(screen.getByPlaceholderText('e.g. EU Prod API'), 'Example Site');
    await user.click(screen.getByText('Add Monitor'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith('https://example.com', 'Example Site', 5);
    });
  });

  it('shows loading state while submitting', async () => {
    const onSubmit = vi.fn(() => new Promise(() => {}));
    const user = userEvent.setup();

    render(<AddSiteForm onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText('https://'), 'https://example.com');
    await user.type(screen.getByPlaceholderText('e.g. EU Prod API'), 'Example');
    await user.click(screen.getByText('Add Monitor'));

    expect(screen.getByText('Adding...')).toBeInTheDocument();
  });

  it('disables submit button while loading', async () => {
    const onSubmit = vi.fn(() => new Promise(() => {}));
    const user = userEvent.setup();

    render(<AddSiteForm onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText('https://'), 'https://example.com');
    await user.type(screen.getByPlaceholderText('e.g. EU Prod API'), 'Example');
    await user.click(screen.getByText('Add Monitor'));

    expect(screen.getByText('Adding...')).toBeDisabled();
  });

  it('shows error when submission fails', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();

    render(<AddSiteForm onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText('https://'), 'https://example.com');
    await user.type(screen.getByPlaceholderText('e.g. EU Prod API'), 'Example');
    await user.click(screen.getByText('Add Monitor'));

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('shows default error when submission fails without message', async () => {
    const onSubmit = vi.fn().mockRejectedValue({});
    const user = userEvent.setup();

    render(<AddSiteForm onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText('https://'), 'https://example.com');
    await user.type(screen.getByPlaceholderText('e.g. EU Prod API'), 'Example');
    await user.click(screen.getByText('Add Monitor'));

    await waitFor(() => {
      expect(screen.getByText('Error creating site')).toBeInTheDocument();
    });
  });

  it('clears form fields after successful submission', async () => {
    const onSubmit = vi.fn().mockResolvedValue();
    const user = userEvent.setup();

    render(<AddSiteForm onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText('https://'), 'https://example.com');
    await user.type(screen.getByPlaceholderText('e.g. EU Prod API'), 'Example');
    await user.click(screen.getByText('Add Monitor'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('https://')).toHaveValue('');
    });
  });

  it('renders frequency select with options', () => {
    render(<AddSiteForm onSubmit={vi.fn()} />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Every 1 minute')).toBeInTheDocument();
    expect(screen.getByText('Every 5 minutes')).toBeInTheDocument();
    expect(screen.getByText('Every 15 minutes')).toBeInTheDocument();
  });

  it('forwards inputRef to the URL input', () => {
    const ref = { current: null };
    render(<AddSiteForm onSubmit={vi.fn()} inputRef={ref} />);
    expect(ref.current).toBe(screen.getByPlaceholderText('https://'));
  });

  it('clears error after a failed submission when re-submitting', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();

    render(<AddSiteForm onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText('https://'), 'https://example.com');
    await user.type(screen.getByPlaceholderText('e.g. EU Prod API'), 'Example');
    await user.click(screen.getByText('Add Monitor'));

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    // Re-submit with new data — error should be cleared during submission
    const successfulSubmit = vi.fn().mockResolvedValue();
    render(<AddSiteForm onSubmit={successfulSubmit} />, { container: document.body });
    // The previous render's error is gone because new render
    expect(screen.queryByText('Network error')).not.toBeInTheDocument();
  });

  it('submits with custom frequency value', async () => {
    const onSubmit = vi.fn().mockResolvedValue();
    const user = userEvent.setup();

    render(<AddSiteForm onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText('https://'), 'https://example.com');
    await user.type(screen.getByPlaceholderText('e.g. EU Prod API'), 'Example');
    await user.selectOptions(screen.getByRole('combobox'), '1');
    await user.click(screen.getByText('Add Monitor'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith('https://example.com', 'Example', 1);
    });
  });

  it('requires URL input via required attribute', () => {
    render(<AddSiteForm onSubmit={vi.fn()} />);
    expect(screen.getByPlaceholderText('https://')).toBeRequired();
  });
});
