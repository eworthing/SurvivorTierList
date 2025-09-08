import type { Contestant } from '../types';
import type { Tiers } from '../types';

/**
 * Apply a head-to-head ranking into the provided tiers object.
 * This is intentionally conservative: it clones tiers, removes ranked contestants from `unranked` and
 * distributes them round-robin into the provided `tierNames` order.
 */
export function applyH2HRanking(loadedTiers: Tiers, tierNames: string[], ranking: { contestant: Contestant }[]): Tiers {
  const newTiers: Tiers = structuredClone(loadedTiers as unknown as Tiers);
  if (!Array.isArray(tierNames) || tierNames.length === 0) return newTiers;
  newTiers.unranked = newTiers.unranked || [];
  tierNames.forEach(n => { if (!Array.isArray(newTiers[n])) newTiers[n] = []; });

  for (let i = 0; i < ranking.length; i++) {
    const c = ranking[i].contestant;
    // remove from unranked if present
    const idx = (newTiers.unranked || []).findIndex((x: Contestant) => x.id === c.id);
    if (idx >= 0) newTiers.unranked.splice(idx, 1);
    const target = tierNames[i % tierNames.length];
    newTiers[target] = [...(newTiers[target] || []), c];
  }
  return newTiers;
}

export default { applyH2HRanking };
