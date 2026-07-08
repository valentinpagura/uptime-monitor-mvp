import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmModal } from '../../components/ConfirmModal';

describe('ConfirmModal', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ConfirmModal isOpen={false} onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders modal content when isOpen is true', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        title="Delete Monitor"
        description="Are you sure?"
      />,
    );

    expect(screen.getByText('Delete Monitor')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmModal
        isOpen={true}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
        title="Confirm"
      />,
    );

    fireEvent.click(screen.getByText('Delete'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(
      <ConfirmModal
        isOpen={true}
        onConfirm={vi.fn()}
        onCancel={onCancel}
        title="Confirm"
      />,
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when overlay is clicked', () => {
    const onCancel = vi.fn();
    render(
      <ConfirmModal
        isOpen={true}
        onConfirm={vi.fn()}
        onCancel={onCancel}
        title="Confirm"
      />,
    );

    const overlay = screen.getByRole('dialog');
    fireEvent.click(overlay);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when Escape is pressed', () => {
    const onCancel = vi.fn();
    render(
      <ConfirmModal
        isOpen={true}
        onConfirm={vi.fn()}
        onCancel={onCancel}
        title="Confirm"
      />,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('does not close when clicking inside the modal', () => {
    const onCancel = vi.fn();
    render(
      <ConfirmModal
        isOpen={true}
        onConfirm={vi.fn()}
        onCancel={onCancel}
        title="Confirm"
      />,
    );

    const modal = screen.getByText('Confirm').closest('.confirm-modal');
    fireEvent.click(modal);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('sets aria-modal and role attributes', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        title="Test Title"
      />,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'confirm-title');
  });

  it('uses default labels when not provided', () => {
    render(
      <ConfirmModal isOpen={true} onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );

    expect(screen.getByText('Confirm action')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('uses custom labels when provided', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        title="Clear Data"
        confirmLabel="Clear"
        cancelLabel="Keep"
      />,
    );

    expect(screen.getByText('Clear')).toBeInTheDocument();
    expect(screen.getByText('Keep')).toBeInTheDocument();
  });

  it('sets body overflow to hidden when open', () => {
    render(
      <ConfirmModal isOpen={true} onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body overflow when closed', () => {
    const { rerender } = render(
      <ConfirmModal isOpen={true} onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <ConfirmModal isOpen={false} onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );

    expect(document.body.style.overflow).toBe('');
  });

  it('shows danger variant icon', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        variant="danger"
      />,
    );

    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('shows confirm variant icon', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        variant="default"
      />,
    );

    expect(screen.getByText('❓')).toBeInTheDocument();
  });
});
