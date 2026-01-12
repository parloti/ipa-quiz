import { ISession, ISessionID } from './isession';

export type IQuizID = `quiz-${number}`;

export interface IQuiz {
  name: string;
  description: string;
  id: IQuizID;
  currentSessionId?: ISessionID; 
  sessions: Record<ISessionID, ISession>;
}
