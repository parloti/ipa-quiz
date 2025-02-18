import { IVowel } from './ivowel';
import { QuestionElement } from './question-element';

export interface IQuestion {
  selectedAnswer: number | undefined;
  vowel: IVowel;
  type: QuestionElement;
  index: number;
  answered: boolean;
  answeredDate?: string;
  options: (IVowel & { type: QuestionElement })[];
}
