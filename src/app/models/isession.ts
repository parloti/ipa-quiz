import { IQuestion } from './iquestion';

export interface ISession {
  id: number;
  creationDate: string;
  questions: IQuestion[];
  currentQuestionIndex: number;
}
