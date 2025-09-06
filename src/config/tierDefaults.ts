import type { TierConfig } from '../types';

export const DEFAULT_TIER_CONFIG: TierConfig = {
  S: { name: 'S', color: 'from-red-400 to-red-500', hexColor: '#f87171', description: 'Legendary' },
  A: { name: 'A', color: 'from-orange-400 to-orange-500', hexColor: '#fb923c', description: 'Outstanding' },
  B: { name: 'B', color: 'from-amber-400 to-yellow-500', hexColor: '#fbbf24', description: 'Great' },
  C: { name: 'C', color: 'from-lime-400 to-green-500', hexColor: '#84cc16', description: 'Good' },
  D: { name: 'D', color: 'from-teal-400 to-teal-500', hexColor: '#2dd4bf', description: 'Average' },
  F: { name: 'F', color: 'from-gray-500 to-gray-600', hexColor: '#6b7280', description: 'Underwhelming' }
};
