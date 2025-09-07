import type { Tiers } from './types';

export const deepClone = <T>(obj: T): T => {
  try {
    // Prefer structuredClone when available (preserves more types)
    const maybe = globalThis as unknown as { structuredClone?: (v: unknown) => unknown };
    if (typeof maybe.structuredClone === 'function') {
      return maybe.structuredClone(obj) as T;
    }
    return JSON.parse(JSON.stringify(obj));
  } catch {
    // Fallback for non-serializable objects
    if (Array.isArray(obj)) {
      return [...obj] as unknown as T;
    }
    if (obj && typeof obj === 'object') {
      return { ...obj } as T;
    }
    return obj;
  }
};

export const calculateRankedCount = (tiers: Tiers) => {
  return Object.entries(tiers || {}).reduce((sum, [key, arr]) => {
    if (key === 'unranked' || !Array.isArray(arr)) return sum;
    return sum + arr.length;
  }, 0);
};

export default { deepClone, calculateRankedCount };

// Try to extract a simple dominant/average color from an image URL.
// Returns a hex color string or null on failure. Uses a small canvas sample.
export const getDominantColorFromImage = async (src: string): Promise<string | null> => {
  try {
    return await new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        try {
          const w = Math.min(64, img.naturalWidth);
          const h = Math.min(64, img.naturalHeight);
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(null);
          ctx.drawImage(img, 0, 0, w, h);
          const data = ctx.getImageData(0, 0, w, h).data;
          let r = 0, g = 0, b = 0, count = 0;
          for (let i = 0; i < data.length; i += 4) {
            const alpha = data[i+3];
            if (alpha === 0) continue;
            r += data[i]; g += data[i+1]; b += data[i+2]; count++;
          }
          if (count === 0) return resolve(null);
          r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count);
          const hex = `#${((1<<24) + (r<<16) + (g<<8) + b).toString(16).slice(1)}`;
          resolve(hex);
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = src;
      // If loading from cache, onload will fire; otherwise give a timeout fallback
      setTimeout(() => resolve(null), 1200);
    });
  } catch {
    return null;
  }
};

// Small seeded RNG factory. If no seed is provided, returns Math.random.
// Uses a 32-bit Lehmer LCG when seeded for deterministic sequences.
export const createRng = (seed?: number): (() => number) => {
  if (typeof seed !== 'number') return Math.random;
  // Ensure seed is a positive 32-bit integer
  let state = Math.abs(Math.floor(seed)) % 2147483647;
  if (state === 0) state = 1;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
};
