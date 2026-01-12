import { IQuestion } from './iquestion';
import { IQuizID } from './iquiz';

export type ISessionID = `session-${number}`;

export interface ISession {
  quizId: IQuizID;
  id: ISessionID;
  creationDate: string;
  questions: Record<number | string, IQuestion>;
  currentQuestionIndex: number;
}
