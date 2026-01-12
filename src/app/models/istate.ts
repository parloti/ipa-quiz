import { IQuiz, IQuizID } from './iquiz';

export interface IState {
  quizzes: Record<IQuizID, IQuiz>;
  currentQuizId: IQuizID | undefined;
  version: number;
}

// const deep: IDeepState = {
//   openedQuiz: {
//     description: '',
//     id: 0,
//     name: '',
//     started: false,
//     statistics: {
//       totalCorrectAnswers: 0,
//       totalElements: 0,
//       totalElementsSeen: 0,
//       totalQuestionsAnswered: 0,
//     },
//   },
//   quizzes: [],
//   sessions: [],
//   version: 0,
// };
// type IDeepState = IDeepPrettify<IState>;
// type S = IDeepRecord<IDeepState>;

// type IDeepRecord<T extends object> = {
//   [P in keyof T]: T[P] extends object ? Prettify<IDeepRecord<T[P]>> : boolean;
// };

// type IDeepPrettify<T, Q = T & {}> = {
//   [K in keyof Q]-?: IDeepPrettify<Q[K] & {}> & {};
// } & {};

// type Prettify<T> = {
//   [K in keyof T]: T[K];
// } & {};

// type RequiredDeep<T> = {
//   [P in keyof T]-?: T[P] extends object | undefined ? RequiredDeep<T[P]> : T[P];
// };
