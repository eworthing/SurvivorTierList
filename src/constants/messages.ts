export const MESSAGES = {
  RANKING_SAVED: 'Ranking saved locally',
  RANKING_LOADED: 'Ranking loaded',
  RANKING_COPIED: 'Ranking copied to clipboard',
  NO_SAVED_FOUND: 'No saved ranking found',
  NEED_TWO_TIERS: 'Need at least two tiers'
} as const;

export type MessageKey = keyof typeof MESSAGES;