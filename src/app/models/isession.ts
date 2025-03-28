import { IQuestion } from './iquestion';
import { IQuiz } from './iquiz';

export interface ISession {
  quizId: IQuiz['id'];
  id: `session-${number}`;
  creationDate: string;
  questions: IQuestion[];
  currentQuestionIndex: number;
}
