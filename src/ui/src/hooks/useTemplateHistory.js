import { useState, useCallback } from 'react';

export function useTemplateHistory() {
  const [past, setPast] = useState([]);
  const [present, setPresent] = useState(null);
  const [future, setFuture] = useState([]);

  const pushToHistory = useCallback((template) => {
    if (present) {
      setPast((prev) => [...prev, present]);
    }
    setPresent(template);
    setFuture([]); // Clear future when new action is performed
  }, [present]);

  const undo = useCallback(() => {
    if (past.length === 0 || !present) {
      return null;
    }

    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);
    setPast(newPast);
    setFuture([present, ...future]);
    setPresent(previous);
    return previous;
  }, [past, present, future]);

  const redo = useCallback(() => {
    if (future.length === 0) {
      return null;
    }

    const next = future[0];
    const newFuture = future.slice(1);
    setPast([...past, present]);
    setPresent(next);
    setFuture(newFuture);
    return next;
  }, [past, present, future]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  return {
    history: { past, present, future },
    pushToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}

