import { describe, it, expect } from 'vitest';
import { generateExportText } from '../src/exportUtils.ts';

describe('exportUtils', () => {
  it('generates human-readable export text and skips unranked', () => {
    const tiers = {
      S: [{ name: 'Alice' }],
      A: [],
      unranked: [{ name: 'Bob' }]
    };
    const tierConfig = { S: { name: 'S', description: 'Legendary' }, A: { name: 'A', description: 'Great' } };
    const text = generateExportText({ group: 'Test', date: 'today', themeName: 'Ocean', tiers, tierConfig });
    expect(text).toContain('S Tier (Legendary): Alice');
    expect(text).not.toContain('Bob');
  });
});
