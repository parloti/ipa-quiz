import { ISession } from './isession';

export interface IQuiz {
  name: string;
  description: string;
  id: `quiz-${number}`;
  currentSessionId?: ISession['id'];
  sessions: ISession[];
}
