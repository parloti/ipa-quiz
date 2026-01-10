import { IVowel } from './ivowel';
import { QuestionElement } from './question-element';

interface IAnsweredQuestion {
  selectedAnswer: IVowel['id'];
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
  options: (IVowel & { type: QuestionElement, soundIndex?: number })[];
} & (IAnsweredQuestion | IUnansweredQuestion);


type c = IQuestion['answered']