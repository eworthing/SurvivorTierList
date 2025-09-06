export interface Contestant {
  id: string;
  name?: string;
  season?: number | string;
  status?: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  [key: string]: unknown;
}

export type Tiers = Record<string, Contestant[]>;

export type TierConfigEntry = { name: string; color?: string; hexColor?: string; description?: string };
export type TierConfig = Record<string, TierConfigEntry>;

export type History<T = unknown> = { stack: T[]; index: number; limit: number };

// Modal content types for better type safety
export type ModalContent = string | 'customization' | 'comparison';

export interface ModalState {
  isOpen: boolean;
  title: string;
  content: ModalContent;
  size: 'default' | 'large' | 'full';
}

export interface VideoModalState {
  isOpen: boolean;
  videoUrl: string;
  contestantName: string;
}

// Comparison mode types
export interface ComparisonState {
  isActive: boolean;
  contestants: [Contestant | null, Contestant | null];
}

export interface ContestantComparison {
  contestant1: Contestant;
  contestant2: Contestant;
  analysis: {
    seasonDifference: number;
    statusComparison: string;
    strengthsComparison: string[];
    recommendation: 'left' | 'right' | 'tie';
  };
}

// Global data interface
export interface GlobalData {
  contestantGroups: Record<string, string[]>;
  allContestants: Record<string, Partial<Contestant>>;
}

// Stats interface
export interface UserStats {
  totalRankings: number;
  totalTime: number;
  undoCount: number;
  shareCount: number;
  rankings: Tiers[];
}

export default {};
