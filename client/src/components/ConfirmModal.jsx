import { useEffect, useRef, useCallback } from 'react';

export function ConfirmModal({ isOpen, onConfirm, onCancel, title, description, confirmLabel, cancelLabel, variant = 'danger' }) {
  const overlayRef = useRef(null);
  const confirmBtnRef = useRef(null);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onCancel?.();
        return;
      }
      if (e.key === 'Tab' && overlayRef.current) {
        const focusable = overlayRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [onCancel],
  );

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.activeElement;
    confirmBtnRef.current?.focus();
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      prev?.focus();
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      style={styles.overlay}
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
    >
      <div
        style={styles.modal}
        onClick={(e) => e.stopPropagation()}
        className="confirm-modal"
      >
        <div style={variant === 'danger' ? styles.dangerIcon : styles.iconWrap}>
          {variant === 'danger' ? '\u26A0\uFE0F' : '\u2753'}
        </div>
        <h2 id="confirm-title" style={styles.title}>
          {title || 'Confirm action'}
        </h2>
        {description && (
          <p id="confirm-desc" style={styles.description}>
            {description}
          </p>
        )}
        <div style={styles.actions}>
          <button
            onClick={onCancel}
            style={styles.cancelBtn}
            aria-label={cancelLabel || 'Cancel'}
          >
            {cancelLabel || 'Cancel'}
          </button>
          <button
            ref={confirmBtnRef}
            onClick={onConfirm}
            style={variant === 'danger' ? styles.dangerBtn : styles.confirmBtn}
            aria-label={confirmLabel || (variant === 'danger' ? 'Delete' : 'Confirm')}
          >
            {confirmLabel || (variant === 'danger' ? 'Delete' : 'Confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9000,
    animation: 'db-fade-in 0.1s ease-out',
  },
  modal: {
    backgroundColor: '#1d1b20',
    border: '1px solid #494551',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '420px',
    width: '90%',
    textAlign: 'center',
    boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
  },
  iconWrap: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    fontSize: '24px',
    backgroundColor: 'rgba(207,188,255,0.1)',
    border: '1px solid rgba(207,188,255,0.2)',
  },
  dangerIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    fontSize: '24px',
    backgroundColor: 'rgba(255,107,107,0.1)',
    border: '1px solid rgba(255,107,107,0.2)',
  },
  title: {
    margin: '0 0 8px',
    fontSize: '18px',
    fontWeight: 600,
    color: '#e6e0e9',
  },
  description: {
    margin: '0 0 24px',
    fontSize: '14px',
    color: '#cbc4d2',
    lineHeight: 1.5,
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  cancelBtn: {
    padding: '10px 24px',
    borderRadius: '9999px',
    border: '1px solid #494551',
    backgroundColor: 'transparent',
    color: '#e6e0e9',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background-color 0.2s',
  },
  confirmBtn: {
    padding: '10px 24px',
    borderRadius: '9999px',
    border: 'none',
    backgroundColor: '#cfbcff',
    color: '#1d1b20',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'opacity 0.2s',
  },
  dangerBtn: {
    padding: '10px 24px',
    borderRadius: '9999px',
    border: 'none',
    backgroundColor: '#ff6b6b',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'opacity 0.2s',
  },
};
