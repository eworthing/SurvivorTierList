import { useCallback } from 'react';
import type { Contestant, TierConfig, Tiers } from '../types';
import { MESSAGES } from '../constants/messages';
import { THEMES } from '../config/themes';

export const useExportImport = () => {
  const STORAGE_KEY = 'survivor-tierlist-save-v1';

  const saveToLocal = useCallback((group: string, tiers: Tiers, theme: string, tierConfig: TierConfig) => {
    try {
      const data = {
        version: 1,
        group,
        theme,
        tierConfig,
        tiers,
        savedAt: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Failed to save ranking:', e);
      return false;
    }
  }, []);

  const loadFromLocal = useCallback((): null | { group: string; theme: string; tierConfig: TierConfig; tiers: Tiers } => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      if (!parsed.tiers || typeof parsed.tiers !== 'object') return null;
      return {
        group: parsed.group,
        theme: parsed.theme,
        tierConfig: parsed.tierConfig,
        tiers: parsed.tiers,
      };
    } catch (e) {
      console.error('Failed to load ranking:', e);
      return null;
    }
  }, []);

  const exportRanking = useCallback(async (
    selectedGroupName: string, 
    tiers: Record<string, Contestant[]>, 
    currentTheme: string, 
    tierConfig: TierConfig
  ) => {
    // Persist locally
    saveToLocal(selectedGroupName, tiers as Tiers, currentTheme, tierConfig);

    const exportData = { 
      group: selectedGroupName, 
      date: new Date().toLocaleDateString(), 
      theme: currentTheme, 
      tiers: Object.fromEntries(
        Object.entries(tiers).map(([tier, contestantsRaw]) => {
          const contestants = Array.isArray(contestantsRaw) ? contestantsRaw : [];
          return [tier, contestants.map(c => ({ 
            name: c.name, 
            season: c.season, 
            status: c.status 
          }))];
        })
      ) 
    };

    // Try to use dynamic import for export utils
  let text: string;
    try {
      const utils = await import('../exportUtils').catch(() => null);
  if (utils && typeof (utils as { generateExportText?: (args: unknown) => unknown }).generateExportText === 'function') {
        text = (utils as { generateExportText: (args: { group: string; date: string; themeName: string; tiers: Record<string, { name?: string }[]>; tierConfig: TierConfig }) => string }).generateExportText({
          group: exportData.group,
          date: exportData.date,
          themeName: THEMES[currentTheme].name,
          tiers: exportData.tiers,
          tierConfig
        });
      } else {
        throw new Error('Export utils not available');
      }
    } catch {
      // Fallback text generation
      text = `🏝️ My Survivor Tier Ranking - ${selectedGroupName}\n`;
      text += `Created: ${exportData.date}\n`;
      text += `Theme: ${THEMES[currentTheme].name}\n\n`;
      text += Object.entries(exportData.tiers)
        .filter(([tier, contestants]) => tier !== 'unranked' && contestants.length > 0 && tierConfig[tier])
        .map(([tier, contestants]) => 
          `${tierConfig[tier].name} Tier (${tierConfig[tier].description}): ${contestants.map((c: { name?: string }) => c.name).join(', ')}`
        )
        .join('\n\n');
    }

    // Try clipboard first, then download
    try {
      if (navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
  await navigator.clipboard.writeText(text);
  // Dispatch a custom event so app-level toast system can react without tight coupling
  window.dispatchEvent(new CustomEvent('tierlist:notify', { detail: { message: MESSAGES.RANKING_COPIED } }));
  return;
      }
  } catch {
      // Continue to download fallback
    }

    // Download fallback
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `survivor-ranking-${selectedGroupName.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [saveToLocal]);

  const exportJSON = useCallback((payload: { group: string; theme: string; tierConfig: TierConfig; tiers: Tiers }) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `survivor-ranking-${payload.group.replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, []);

  const importJSON = useCallback(async () => {
    return new Promise<null | { group: string; theme: string; tierConfig: TierConfig; tiers: Tiers }>((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return resolve(null);
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const parsed = JSON.parse(String(reader.result));
            if (!parsed || typeof parsed !== 'object') return resolve(null);
            if (!parsed.tiers || typeof parsed.tiers !== 'object') return resolve(null);
            resolve({ group: parsed.group, theme: parsed.theme, tierConfig: parsed.tierConfig, tiers: parsed.tiers });
          } catch {
            resolve(null);
          }
        };
        reader.readAsText(file);
      };
      input.click();
    });
  }, []);

  const analyzeTier = useCallback(async (
    tierName: string, 
    contestants: Contestant[], 
    tierConfig: TierConfig,
  setModalState: (state: { isOpen: boolean; title: string; content: string; size: 'default' | 'large' | 'full' }) => void
  ) => {
    if (!tierConfig[tierName]) return;

    // Try to use dynamic import for analysis
    let analysis: string;
    try {
      const mod = await import('../analysis').catch(() => null);
  if (mod && typeof (mod as { generateTierAnalysis?: (tier: string, config: TierConfig[string], contestants: Contestant[]) => string }).generateTierAnalysis === 'function') {
        analysis = (mod as { generateTierAnalysis: (tier: string, config: TierConfig[string], contestants: Contestant[]) => string }).generateTierAnalysis(tierName, tierConfig[tierName], contestants);
      } else {
        throw new Error('Analysis module not available');
      }
    } catch {
      // Fallback analysis generation
      analysis = `${tierConfig[tierName].name} Tier Analysis - ${tierConfig[tierName].description}\n\n`;
      analysis += `You've placed ${contestants.length} contestant${contestants.length !== 1 ? 's' : ''} in this tier:\n\n`;
      contestants.forEach(c => {
        analysis += `• ${c.name} (Season ${c.season}, ${c.status})\n`;
        if (c.description) analysis += `  ${c.description}\n\n`;
      });
    }

    setModalState({
      isOpen: true,
      title: `${tierConfig[tierName].name} Tier Analysis`,
      content: analysis,
      size: 'default'
    });
  }, []);

  return {
    exportRanking,
  analyzeTier,
  saveToLocal,
  loadFromLocal,
  exportJSON,
  importJSON
  };
};
