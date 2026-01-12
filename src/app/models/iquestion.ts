import { IVowel, IVowelID } from './ivowel';
import { QuestionElement } from './question-element';

type IOption = IVowel & { type: QuestionElement; soundIndex?: number };

interface IAnsweredQuestion {
  selectedAnswer: IVowelID;
  answered: true;
  answeredDate: string;
}

interface IUnansweredQuestion {
  selectedAnswer: undefined;
  answered: false;
  answeredDate?: undefined;
}

export type IQuestion = {
  vowel: IVowel & { soundIndex?: number };
  type: QuestionElement;
  index: number;
  options: Record<number | string, IOption>;
} & (IAnsweredQuestion | IUnansweredQuestion);
