import { IVowel } from './ivowel';

export interface IStatistics {
  answered: number;
  correct: number;
  wrong: number;
  itens: number;
  seen: Set<IVowel['id']>;
  seenLength: number;
  unSeen: number;
  currentStreak: number;
  longestStreak: number;
}
