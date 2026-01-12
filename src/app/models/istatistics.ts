import { IVowelID } from './ivowel';

export interface IStatistics {
  answered: number;
  correct: number;
  wrong: number;
  itens: number;
  seen: Set<IVowelID>;
  seenLength: number;
  unSeen: number;
  currentStreak: number;
  longestStreak: number;
}
