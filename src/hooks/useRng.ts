import { useMemo } from 'react';
import { createRng } from '../utils';

// Small convenience hook returning a memoized RNG function.
// Pass an optional numeric seed for deterministic sequences.
export const useRng = (seed?: number): (() => number) => {
  return useMemo(() => createRng(seed), [seed]);
};

export default useRng;
