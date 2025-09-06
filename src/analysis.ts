import type { Contestant, TierConfigEntry } from './types';

export function generateTierAnalysis(tierName: string, tierInfo: TierConfigEntry, contestants: Contestant[] = []) {
  let analysis = `${tierInfo.name} Tier Analysis - ${tierInfo.description}\n\n`;
  analysis += `You've placed ${contestants.length} contestant${contestants.length !== 1 ? 's' : ''} in this tier:\n\n`;
  contestants.forEach(contestant => {
    analysis += `• ${contestant.name} (Season ${contestant.season}, ${contestant.status})\n`;
    if (contestant.description) analysis += `  ${contestant.description}\n\n`;
  });
  return analysis;
}

export default { generateTierAnalysis };
