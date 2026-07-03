import { createContext, useState, useCallback, useRef, useEffect } from 'react';

export const ToastContext = createContext();

let toastId = 0;

function ToastItem({ toast, onRemove }) {
  const removingRef = useRef(false);

  useEffect(() => {
    if (toast.removing && !removingRef.current) {
      removingRef.current = true;
      const timer = setTimeout(() => onRemove(toast.id), 300);
      return () => clearTimeout(timer);
    }
  }, [toast.removing, toast.id, onRemove]);

  const icons = {
    success: '\u2705',
    error: '\u274C',
    warning: '\u26A0\uFE0F',
    info: '\u2139\uFE0F',
  };

  return (
    <div
      style={{
        ...styles.toast,
        ...(toast.type === 'success' ? styles.success : {}),
        ...(toast.type === 'error' ? styles.error : {}),
        ...(toast.type === 'warning' ? styles.warning : {}),
        ...(toast.type === 'info' ? styles.info : {}),
        ...(toast.removing ? styles.removing : {}),
      }}
      role="status"
      aria-live="polite"
    >
      <span style={styles.icon}>{icons[toast.type] || icons.info}</span>
      <span style={styles.message}>{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        style={styles.closeBtn}
        aria-label="Close notification"
      >
        {'\u2716'}
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, removing: true } : t)),
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 400);
  }, []);

  const addToast = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message, type, removing: false }]);

      if (timersRef.current[id]) {
        clearTimeout(timersRef.current[id]);
      }

      timersRef.current[id] = setTimeout(() => {
        removeToast(id);
        delete timersRef.current[id];
      }, duration);

      return id;
    },
    [removeToast],
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {toasts.length > 0 && (
        <div style={styles.container} aria-label="Notifications">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

const styles = {
  container: {
    position: 'fixed',
    top: '16px',
    right: '16px',
    zIndex: 10000,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxWidth: '400px',
    width: '100%',
    pointerEvents: 'none',
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderRadius: '8px',
    pointerEvents: 'auto',
    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
    animation: 'db-fade-in 0.15s ease-out',
    backgroundColor: '#1d1b20',
    border: '1px solid #494551',
    color: '#e6e0e9',
    fontSize: '14px',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
  },
  removing: {
    opacity: 0,
    transform: 'translateX(30px)',
  },
  success: {
    borderColor: '#4ade80',
  },
  error: {
    borderColor: '#ff6b6b',
  },
  warning: {
    borderColor: '#e7c365',
  },
  info: {
    borderColor: '#cfbcff',
  },
  icon: {
    fontSize: '16px',
    flexShrink: 0,
  },
  message: {
    flex: 1,
    lineHeight: 1.4,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    cursor: 'pointer',
    padding: '2px 4px',
    fontSize: '14px',
    fontFamily: 'inherit',
    flexShrink: 0,
    lineHeight: 1,
  },
};
