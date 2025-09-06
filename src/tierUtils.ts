import { deepClone } from './utils';
import type { Contestant, Tiers } from './types';

export const moveContestant = (tiers: Tiers, contestantId: string, targetTierName: string): Tiers => {
  if (!contestantId || !targetTierName || typeof tiers !== 'object') return tiers;
  const newTiers: Tiers = deepClone(tiers as unknown) as Tiers;

  let sourceTier: string | null = null;
  let contestant: Contestant | null = null;

  for (const [tierName, arr] of Object.entries(newTiers)) {
    if (!Array.isArray(arr)) continue;
    const idx = arr.findIndex(c => c && c.id === contestantId);
    if (idx !== -1) {
      sourceTier = tierName;
      contestant = arr[idx];
      newTiers[tierName] = [...arr.slice(0, idx), ...arr.slice(idx + 1)];
      break;
    }
  }

  if (!contestant) return tiers; // no change if not found
  if (sourceTier === targetTierName) return tiers; // no-op

  if (!Array.isArray(newTiers[targetTierName])) newTiers[targetTierName] = [];
  newTiers[targetTierName] = [...newTiers[targetTierName], contestant];

  return newTiers;
};

export const validateTiersShape = (tiers: unknown): tiers is Tiers => {
  if (!tiers || typeof tiers !== 'object') return false;
  return Object.values(tiers as Record<string, unknown>).every((v) => Array.isArray(v));
};

export default { moveContestant, validateTiersShape };
