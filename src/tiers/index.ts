import { deepClone } from '../utils';
import type { Contestant, Tiers } from '../types';

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

export const clearTier = (tiers: Tiers, tierName: string): { tiers: Tiers; moved: Contestant[] } => {
  const newTiers = deepClone(tiers as unknown) as Tiers;
  const moved = newTiers[tierName] || [];
  newTiers[tierName] = [];
  newTiers.unranked = [...(newTiers.unranked || []), ...moved];
  return { tiers: newTiers, moved };
};

export const validateTiersShape = (tiers: unknown): tiers is Tiers => {
  if (!tiers || typeof tiers !== 'object') return false;
  return Object.values(tiers as Record<string, unknown>).every((v) => Array.isArray(v));
};

export const reorderList = <T>(list: T[], from: number, to: number): T[] => {
  if (!Array.isArray(list)) return list;
  const copy = [...list];
  const item = copy.splice(from, 1)[0];
  copy.splice(to, 0, item);
  return copy;
};

export const reorderWithinTier = (tiers: Tiers, tierName: string, from: number, to: number): Tiers => {
  if (!tiers || !Array.isArray(tiers[tierName])) return tiers;
  const newTiers = deepClone(tiers as unknown) as Tiers;
  const list = newTiers[tierName] || [];
  newTiers[tierName] = reorderList(list, from, to);
  return newTiers;
};

export const randomizeIntoTiers = (contestants: Contestant[], tierNames: string[], rng?: () => number): Tiers => {
  const rand = typeof rng === 'function' ? rng : Math.random;
  const n = Array.isArray(contestants) ? contestants.length : 0;
  const newTiers: Tiers = {
    ...Object.fromEntries(tierNames.map((name) => [name, []])),
    unranked: []
  };
  if (!n) return newTiers;

  // Fisher-Yates shuffle on a shallow copy
  const arr = [...contestants];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }

  // Round-robin distribution across tiers for even spread
  arr.forEach((c, idx) => {
    const target = tierNames[idx % tierNames.length];
    if (!Array.isArray(newTiers[target])) newTiers[target] = [];
    newTiers[target].push(c);
  });

  return newTiers;
};

export default { moveContestant, clearTier, validateTiersShape, reorderList, reorderWithinTier, randomizeIntoTiers };

