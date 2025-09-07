import { useCallback, useMemo, useState } from 'react';
import type { Contestant } from '../types';

export interface HeadToHeadStat {
  id: string;
  wins: number;
  losses: number;
}

interface UseHeadToHeadOptions {
  contestants: Contestant[]; // source list (typically current unranked pool)
  rng?: () => number;
}

export const useHeadToHead = ({ contestants, rng }: UseHeadToHeadOptions) => {
  const [isActive, setIsActive] = useState(false);
  const [pair, setPair] = useState<[Contestant, Contestant] | null>(null);
  const [stats, setStats] = useState<Record<string, HeadToHeadStat>>({});
  const [comparisons, setComparisons] = useState(0);

  const ensureStat = useCallback((id: string) => {
    setStats(prev => prev[id] ? prev : ({ ...prev, [id]: { id, wins: 0, losses: 0 } }));
  }, []);

  const pickRandomPair = useCallback(() => {
    const pool = contestants.filter(c => !!c); // guard
    if (pool.length < 2) { setPair(null); return; }
    const r = typeof rng === 'function' ? rng : Math.random;
    const i = Math.floor(r() * pool.length);
    let j = Math.floor(r() * pool.length);
    if (j === i) j = (j + 1) % pool.length;
    const a = pool[i];
    const b = pool[j];
    setPair([a, b]);
    ensureStat(a.id); ensureStat(b.id);
  }, [contestants, ensureStat, rng]);

  const start = useCallback(() => {
    setIsActive(true);
    setStats({});
    setComparisons(0);
    pickRandomPair();
  }, [pickRandomPair]);

  const stop = useCallback(() => {
    setIsActive(false);
    setPair(null);
  }, []);

  const chooseWinner = useCallback((winnerId: string) => {
    if (!pair) return;
    const [a, b] = pair;
    const loserId = winnerId === a.id ? b.id : a.id;
    setStats(prev => ({
      ...prev,
      [winnerId]: { id: winnerId, wins: (prev[winnerId]?.wins || 0) + 1, losses: prev[winnerId]?.losses || 0 },
      [loserId]: { id: loserId, wins: prev[loserId]?.wins || 0, losses: (prev[loserId]?.losses || 0) + 1 }
    }));
    setComparisons(c => c + 1);
    pickRandomPair();
  }, [pair, pickRandomPair]);

  const skip = useCallback(() => {
    setComparisons(c => c + 1);
    pickRandomPair();
  }, [pickRandomPair]);

  const ranking = useMemo(() => {
    const rows: { contestant: Contestant; score: number; wins: number; losses: number }[] = contestants.map(c => {
      const s = stats[c.id];
      const wins = s?.wins || 0;
      const losses = s?.losses || 0;
      const total = wins + losses;
      const score = total === 0 ? 0 : wins / total;
      return { contestant: c, score, wins, losses };
    });
    return rows.sort((r1, r2) => r2.score - r1.score || (r2.wins - r1.wins));
  }, [contestants, stats]);

  return {
    isActive,
    pair,
    stats,
    comparisons,
    ranking,
    start,
    stop,
    chooseWinner,
    skip
  };
};

export type UseHeadToHeadReturn = ReturnType<typeof useHeadToHead>;
