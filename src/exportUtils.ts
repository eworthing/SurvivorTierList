import type { Tiers, TierConfig, Contestant } from './types';

export function generateExportText({ group, date, themeName, tiers, tierConfig }: { group: string; date: string; themeName: string; tiers: Tiers; tierConfig: TierConfig }) {
  let text = `🏝️ My Survivor Tier Ranking - ${group}\n`;
  text += `Created: ${date}\n`;
  text += `Theme: ${themeName}\n\n`;
  text += Object.entries(tiers)
    .filter(([tier, contestants]) => tier !== 'unranked' && contestants.length > 0 && tierConfig[tier])
  .map(([tier, contestants]) => `${tierConfig[tier].name} Tier (${tierConfig[tier].description}): ${(contestants as Contestant[]).map((c) => c.name ?? '').join(', ')}`)
    .join('\n\n');
  return text;
}

export default { generateExportText };
