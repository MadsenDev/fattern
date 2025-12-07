import { useState, useCallback } from 'react';

let toastIdCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, variant = 'info', duration = 5000) => {
    const id = `toast-${++toastIdCounter}`;
    const toast = { id, message, variant, duration };
    setToasts((prev) => [...prev, toast]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (message, variant, duration) => addToast(message, variant, duration),
    [addToast]
  );

  toast.success = useCallback(
    (message, duration = 4000) => addToast(message, 'success', duration),
    [addToast]
  );

  toast.error = useCallback(
    (message, duration = 6000) => addToast(message, 'error', duration),
    [addToast]
  );

  toast.warning = useCallback(
    (message, duration = 5000) => addToast(message, 'warning', duration),
    [addToast]
  );

  toast.info = useCallback(
    (message, duration = 4000) => addToast(message, 'info', duration),
    [addToast]
  );

  return {
    toasts,
    toast,
    removeToast,
  };
}

