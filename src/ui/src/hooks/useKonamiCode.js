import { useEffect, useRef } from 'react';

// ↑ ↑ ↓ ↓ ← → ← → B A
const KONAMI = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
  'b', 'a',
];

/**
 * Listens for the Konami code globally and calls `onMatch` when it's completed.
 * The sequence resets after 2 s of inactivity so partial presses don't linger.
 */
export function useKonamiCode(onMatch) {
  const progress = useRef(0);
  const resetTimer = useRef(null);

  useEffect(() => {
    const handleKey = (e) => {
      const expected = KONAMI[progress.current];

      if (e.key === expected) {
        progress.current += 1;

        // Reset the inactivity timer
        clearTimeout(resetTimer.current);
        resetTimer.current = setTimeout(() => { progress.current = 0; }, 2000);

        if (progress.current === KONAMI.length) {
          progress.current = 0;
          clearTimeout(resetTimer.current);
          onMatch();
        }
      } else {
        // Wrong key — restart from scratch (but allow re-entry if this key
        // happens to be the first key in the sequence)
        progress.current = e.key === KONAMI[0] ? 1 : 0;
        clearTimeout(resetTimer.current);
        if (progress.current > 0) {
          resetTimer.current = setTimeout(() => { progress.current = 0; }, 2000);
        }
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      clearTimeout(resetTimer.current);
    };
  }, [onMatch]);
}
