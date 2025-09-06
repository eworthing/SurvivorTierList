import { useMemo } from 'react';
import type { Contestant } from '../types';

export const useDataProcessing = () => {
  const processContestantGroups = useMemo(() => {
    const process = (): Record<string, Contestant[]> => {
      try {
        const globalData = globalThis as unknown as { 
          contestantGroups?: Record<string, string[]>; 
          allContestants?: Record<string, Partial<Contestant>> 
        };
        const contestantGroups = globalData.contestantGroups;
        const allContestants = globalData.allContestants;

        if (!contestantGroups || !allContestants) {
          console.error('Missing contestant data. Make sure survivor-data.js is loaded.');
          return { 'Default': [] };
        }

        return Object.fromEntries(
          Object.entries(contestantGroups).map(([groupName, contestantIds]: [string, string[]]) => [
            groupName,
            (contestantIds || []).map((id: string) => {
              const contestant = allContestants[id];
              if (!contestant) {
                console.error(`Contestant with id "${id}" not found`);
                return null;
              }
              return {
                id,
                name: contestant.name || `Contestant ${id}`,
                season: contestant.season || 1,
                status: contestant.status || 'Contestant',
                description: contestant.description || '',
                imageUrl: contestant.imageUrl || '/default-contestant.jpg',
                videoUrl: contestant.videoUrl || '',
                ...contestant
              };
            }).filter(Boolean) as Contestant[]
          ])
        );
      } catch (error) {
        console.error('Error processing contestant groups:', error);
        return { 'Default': [] };
      }
    };
    
    return process();
  }, []); // Only process once on mount

  return {
    contestantGroups: processContestantGroups
  };
};
