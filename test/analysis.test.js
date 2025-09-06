import { describe, it, expect } from 'vitest';
import { generateTierAnalysis } from '../src/analysis.ts';

describe('analysis', () => {
  it('formats tier analysis text', () => {
    const tierInfo = { name: 'S', description: 'Legendary' };
    const contestants = [{ name: 'Alice', season: 1, status: 'Winner', description: 'A strategic player' }];
    const text = generateTierAnalysis('S', tierInfo, contestants);
    expect(text).toContain('S Tier Analysis - Legendary');
    expect(text).toContain('Alice (Season 1, Winner)');
    expect(text).toContain('A strategic player');
  });
});
