// Platform detection helpers (lightweight, no external deps)
// tvOS note: Capacitor does not officially support tvOS; we rely on user agent heuristics.

export const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

export const isIOS = () => isBrowser && /iPad|iPhone|iPod/.test(navigator.userAgent);

// Heuristic: Apple TV simulators and devices expose 'AppleTV' in userAgent.
export const isTvOS = () => isBrowser && /AppleTV/.test(navigator.userAgent);

export const isTouchPrimary = () => isBrowser && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

// Consolidated platform tag for conditional UI logic.
export const platformTag = () => {
  if (isTvOS()) return 'tvos';
  if (isIOS()) return 'ios';
  return 'web';
};

// Utility to conditionally execute code only on non-tvOS targets
export const ifNotTvOS = (fn: () => void) => { if (!isTvOS()) fn(); };
