import { useState, useEffect, useMemo } from 'react';
import type { Contestant, Tiers, UserStats } from '../types';

const ACHIEVEMENTS = [
  { id: 'first_rank', name: 'First Step', description: 'Rank your first contestant.', icon: '🥇' },
  { id: 'full_house', name: 'Full House', description: 'Rank all contestants in a group.', icon: '🏠' },
  { id: 'quick_draw', name: 'Quick Draw', description: 'Rank 5 contestants in under 30 seconds.', icon: '⚡' },
  { id: 'perfectionist', name: 'Perfectionist', description: 'Create a ranking without using undo/redo.', icon: '🎯' },
  { id: 'nostalgia', name: 'Nostalgia Trip', description: 'Rank contestants from 3+ different eras.', icon: '📺' },
  { id: 'controversial', name: 'Controversial Choices', description: 'Place a legendary contestant in D or F tier.', icon: '🔥' },
  { id: 'explorer', name: 'Explorer', description: 'Try all available themes.', icon: '🎨' },
  { id: 'completionist', name: 'Completionist', description: 'Rank all contestant groups.', icon: '💯' },
  { id: 'social_butterfly', name: 'Social Butterfly', description: 'Share your ranking 3 times.', icon: '🦋' },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Complete a ranking in under 60 seconds.', icon: '🏎️' },
  { id: 'methodical', name: 'Methodical Mind', description: 'Take over 10 minutes on a single ranking.', icon: '🧠' },
  { id: 'undecided', name: 'The Indecisive', description: 'Use undo more than 15 times in one session.', icon: '🔄' },
  { id: 'top_heavy', name: 'Top Heavy', description: 'Put more contestants in S+A than C+D+F combined.', icon: '⬆️' },
  { id: 'harsh_critic', name: 'Harsh Critic', description: 'Put more contestants in D+F than S+A+B combined.', icon: '👎' },
  { id: 'underdog_uprising', name: 'Underdog Uprising', description: 'Place at least 3 "Misfits & Fan Favorites" in S or A tier.', icon: '🚀' }
].reduce((acc, achievement) => { 
  acc[achievement.id] = achievement; 
  return acc; 
}, {} as Record<string, { id: string; name: string; description: string; icon: string }>);

export const useAchievements = (
  tiers: Tiers, 
  currentContestants: Contestant[], 
  stats: UserStats, 
  startTime: number
) => {
  const [achievements, setAchievements] = useState<string[]>([]);

  // Memoize achievement calculation for better performance
  useEffect(() => {
    const calculateAchievements = () => {
      const rankedCount = Object.entries(tiers).reduce((sum, [key, arr]) => { 
        if (key === 'unranked' || !Array.isArray(arr)) return sum; 
        return sum + arr.length; 
      }, 0);

      const nextAchievements = new Set<string>();
      
      // Check achievements efficiently
      if (rankedCount > 0) nextAchievements.add('first_rank');
      if (rankedCount === currentContestants.length) nextAchievements.add('full_house');
      if (stats.undoCount === 0 && rankedCount === currentContestants.length) nextAchievements.add('perfectionist');
      if (stats.undoCount > 15) nextAchievements.add('undecided');
      if (stats.shareCount >= 3) nextAchievements.add('social_butterfly');

      // Time-based achievements
      const sessionTime = Date.now() - startTime;
      if (rankedCount === currentContestants.length) {
        if (sessionTime < 60000) nextAchievements.add('speed_demon');
        if (sessionTime > 600000) nextAchievements.add('methodical');
      }

      // Quick draw (5 in 30 seconds)
  const recentRankings = (stats.rankings || []).filter((r: { timestamp?: number }) => typeof r?.timestamp === 'number' && (Date.now() - r.timestamp) < 30000);
      if (recentRankings.length >= 5) nextAchievements.add('quick_draw');

      // Distribution-based achievements
      const sTier = tiers.S || [];
      const aTier = tiers.A || [];
      const bTier = tiers.B || [];
      const cTier = tiers.C || [];
      const dTier = tiers.D || [];
      const fTier = tiers.F || [];

      if ((sTier.length + aTier.length) > (cTier.length + dTier.length + fTier.length)) {
        nextAchievements.add('top_heavy');
      }
      if ((dTier.length + fTier.length) > (sTier.length + aTier.length + bTier.length)) {
        nextAchievements.add('harsh_critic');
      }

      // Controversial achievement
      if (dTier.length > 0 || fTier.length > 0) {
  const lowTierLegends = [...dTier, ...fTier].filter((c: Contestant) => 
          c.status && c.status.toLowerCase().includes('legend')
        );
        if (lowTierLegends.length > 0) nextAchievements.add('controversial');
      }

      return Array.from(nextAchievements);
    };

    setAchievements(calculateAchievements());
  }, [tiers, currentContestants.length, startTime, stats]);

  const statsContent = useMemo(() => {
    let content = `📊 Your Ranking Statistics\n\n`;
    content += `Total Rankings Completed: ${stats.totalRankings}\n`;
    content += `Total Time Spent: ${Math.round(stats.totalTime / 60000)} minutes\n`;
    content += `Undo Operations: ${stats.undoCount}\n`;
    content += `Rankings Shared: ${stats.shareCount}\n\n`;
    content += `🏆 Achievements Unlocked: ${achievements.length}/${Object.keys(ACHIEVEMENTS).length}\n\n`;
    
    if (achievements.length > 0) {
      content += `Recent Achievements:\n`;
      achievements.slice(-3).forEach(id => {
        const achievement = ACHIEVEMENTS[id];
        if (achievement) content += `${achievement.icon} ${achievement.name} - ${achievement.description}\n`;
      });
    }
    
    return content;
  }, [stats, achievements]);

  return {
    achievements,
    statsContent,
    ACHIEVEMENTS
  };
};
