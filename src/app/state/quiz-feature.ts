import {
  createFeature,
  createReducer,
  createSelector,
  MemoizedSelector,
  on,
} from '@ngrx/store';
import { immerOn } from 'ngrx-immer/store';
import { defaultQuizzes } from '../default-quizzes';
import { IMovingAverage } from '../models/imoving-average';
import { IQuestion } from '../models/iquestion';
import { IQuiz, IQuizID } from '../models/iquiz';
import { ISession } from '../models/isession';
import { IState } from '../models/istate';
import { IStatistics } from '../models/istatistics';
import { IVowel, IVowelID } from '../models/ivowel';
import { QuestionElement } from '../models/question-element';
import { VOWELS } from '../vowels';
import { actions } from './actions';
import { APP_ROUTER_NAVIGATION } from './app-router-actions';
import { updateState } from './update.state';

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.substring(1);
}

type Primitive = string | number | bigint | boolean | symbol | null | undefined;

type NestedSelectors<TName extends string, TState> = TState extends
  | Primitive
  | unknown[]
  | Date
  ? object
  : {
      [K in keyof TState &
        string as `select${Capitalize<TName>}${Capitalize<K>}`]: MemoizedSelector<
        Record<string, any>,
        TState[K] | undefined,
        (featureState: TState) => TState[K] | undefined
      >;
    };

function createNestedSelectors<
  TName extends string,
  TState,
  TParentSelector extends MemoizedSelector<
    Record<string, any>,
    TState | undefined
  >,
>(
  name: TName,
  parentSelector: TParentSelector,
  initialState: NonNullable<TState>,
): NestedSelectors<TName, TState> {
  const keys = Object.keys(initialState) as (string & keyof TState)[];
  return keys.reduce(
    (nestedSelectors, key) => ({
      ...nestedSelectors,
      [`select${capitalize(name)}${capitalize(key)}`]: createSelector(
        parentSelector,
        parentState => parentState?.[key],
      ),
    }),
    {} as NestedSelectors<TName, TState>,
  );
}

const initialState: IState = Object.freeze<IState>({
  quizzes: { ...defaultQuizzes },
  currentQuizId: void 0,
  version: 1,
});

export const quizFeature = createFeature({
  name: 'quiz',
  reducer: createReducer(
    initialState,
    on(actions.addQuiz, (state, { quiz }) =>
      updateState(state, { quizzes: { ...state.quizzes, [quiz.id]: quiz } }),
    ),
    immerOn(actions.addSession, (state, { session }) => {
      const quiz = state.quizzes[session.quizId];
      quiz.sessions[session.id] = session;
      return state;
    }),
    on(actions.openQuiz, (state, { quizId }) =>
      updateState(state, { currentQuizId: quizId }),
    ),
    immerOn(actions.openSession, (state, { quizId, sessionId }) => {
      const quiz = state.quizzes[quizId];
      if (quiz) {
        quiz.currentSessionId = sessionId;
      }
      return state;
    }),
    immerOn(actions.selectAnswer, (state, { selectedAnswer }) => {
      const id = state.currentQuizId;
      if (!id) {
        return state;
      }
      const quiz = state.quizzes[id];
      const sessionId = quiz?.currentSessionId;
      if (!sessionId) {
        return state;
      }
      const session = quiz.sessions[sessionId];
      const index = session?.currentQuestionIndex;
      const questions = session?.questions;
      if (index !== void 0 && questions[index] !== void 0) {
        questions[index].selectedAnswer = selectedAnswer;
      }
      return state;
    }),
    immerOn(actions.updateQuestionSoundIndex, (state, { soundIndex }) => {
      const id = state.currentQuizId;
      if (!id) {
        return state;
      }
      const quiz = state.quizzes[id];
      const sessionId = quiz?.currentSessionId;
      if (!sessionId) {
        return state;
      }
      const session = quiz.sessions[sessionId];
      const index = session?.currentQuestionIndex;
      const questions = session?.questions;
      if (index !== void 0 && questions[index] !== void 0) {
        questions[index].vowel.soundIndex = soundIndex;
      }
      return state;
    }),
    immerOn(
      actions.updateOptionSoundIndex,
      (state, { optionIndex, soundIndex }) => {
        const id = state.currentQuizId;
        if (!id) {
          return state;
        }
        const quiz = state.quizzes[id];
        const sessionId = quiz?.currentSessionId;
        if (!sessionId) {
          return state;
        }
        const session = quiz.sessions?.[sessionId];
        const index = session?.currentQuestionIndex;
        const questions = session?.questions;
        if (index !== void 0 && questions[index] !== void 0) {
          questions[index].options[optionIndex].soundIndex = soundIndex;
        }
        return state;
      },
    ),
    on(actions.restoreState, (state, { restoring }) =>
      updateState(state, restoring),
    ),
    immerOn(actions.answerCurrent, (state, { date }) => {
      const id = state.currentQuizId;
      if (!id) {
        return state;
      }
      const quiz = state.quizzes[id];
      const sessionId = quiz?.currentSessionId;
      if (!sessionId) {
        return state;
      }
      const session = quiz.sessions?.[sessionId];
      const index = session?.currentQuestionIndex;
      const questions = session?.questions;
      if (index !== void 0 && questions[index] !== void 0) {
        questions[index].answered = true;
        questions[index].answeredDate = date;
      }
      return state;
    }),
    immerOn(actions.nextQuestion, state => {
      const id = state.currentQuizId;
      if (!id) {
        return state;
      }
      const quiz = state.quizzes[id];
      const sessionId = quiz?.currentSessionId;
      if (!sessionId) {
        return state;
      }
      const session = quiz.sessions[sessionId];
      const questionsLen = session ? Object.keys(session.questions).length : 0;
      if (session && session.currentQuestionIndex < questionsLen - 1) {
        session.currentQuestionIndex++;
      }
      return state;
    }),
    immerOn(actions.previousQuestion, state => {
      const id = state.currentQuizId;
      if (!id) {
        return state;
      }
      const quiz = state.quizzes[id];
      const sessionId = quiz?.currentSessionId;
      if (!sessionId) {
        return state;
      }
      const session = quiz.sessions?.[sessionId];
      if (session && session.currentQuestionIndex > 0) {
        session.currentQuestionIndex--;
      }
      return state;
    }),
    on(APP_ROUTER_NAVIGATION, (state, { payload }) => {
      const {
        routerState: { url },
      } = payload;
      const id = url?.match(/quiz-\d+/)?.at(0) as IQuizID | undefined;
      return updateState(state, {
        currentQuizId: id ?? state.currentQuizId,
      });
    }),
  ),
  extraSelectors: base => {
    const selectCurrentQuiz = createSelector(
      base.selectQuizzes,
      base.selectCurrentQuizId,
      (quizzes, quizId) => (quizId !== void 0 ? quizzes[quizId] : undefined),
    );

    const quizSelectors = createNestedSelectors('quiz', selectCurrentQuiz, {
      description: '',
      id: 'quiz-0',
      name: '',
      sessions: {} as Record<string, ISession>,
      currentSessionId: 'session-0',
    } as IQuiz);

    const selectCurrentSession = createSelector(
      quizSelectors.selectQuizSessions,
      quizSelectors.selectQuizCurrentSessionId,
      (sessions, id) => {
        if (!sessions) {
          return undefined;
        }
        if (id !== void 0) {
          return sessions[id];
        }
        return Object.values(sessions).at(-1);
      },
    );
    const sessionSelectors = createNestedSelectors(
      'session',
      selectCurrentSession,
      {
        creationDate: '',
        currentQuestionIndex: 0,
        id: 'session-0',
        questions: {} as Record<string, IQuestion>,
        quizId: 'quiz-0',
      } as ISession,
    );

    const selectQuestionsLength = createSelector(
      sessionSelectors.selectSessionQuestions,
      questions => (questions ? Object.keys(questions).length : undefined),
    );
    const selectCurrentQuestion = createSelector(
      sessionSelectors.selectSessionQuestions,
      sessionSelectors.selectSessionCurrentQuestionIndex,
      (questions, index) => (index !== void 0 ? questions?.[index] : void 0),
    );

    const currentQuestionSelectors = createNestedSelectors(
      'currentQuestion',
      selectCurrentQuestion,
      {
        index: 0,
        answered: false,
        answeredDate: void 0,
        options: {} as Record<string, any>,
        selectedAnswer: void 0,
        type: QuestionElement.Letter,
        vowel: {} as IVowel,
      } as IQuestion,
    );

    const selectStatsBySession = createSelector(
      quizSelectors.selectQuizSessions,
      sessions =>
        Object.values(sessions ?? {}).map(session => {
          const questions = Object.values(session.questions);
          const stat = questions.reduce(
            (acc, curr) => {
              if (curr.answered) {
                acc.answered++;
              }
              if (curr.selectedAnswer !== void 0) {
                if (curr.selectedAnswer === curr.vowel.id) {
                  acc.correct++;
                } else {
                  acc.wrong++;
                }
              }

              acc.seen.add(curr.vowel.id);

              if (curr.answered) {
                if (curr.selectedAnswer === curr.vowel.id) {
                  acc.currentStreak++;
                  acc.longestStreak = Math.max(
                    acc.longestStreak,
                    acc.currentStreak,
                  );
                } else {
                  acc.currentStreak = 0;
                }
              }

              return acc;
            },
            {
              answered: 0,
              correct: 0,
              seen: new Set<IVowelID>(),
              wrong: 0,
              currentStreak: 0,
              longestStreak: 0,
            },
          );

          const itens = questions.length;
          const seenLength = stat.seen.size;
          return {
            ...stat,
            seenLength,
            itens,
            unSeen: itens - seenLength,
          } satisfies IStatistics;
        }),
    );

    const selectTotalStats = createSelector(
      quizSelectors.selectQuizSessions,
      sessions => {
        if (sessions === void 0) {
          return void 0;
        }
        const stats = Object.values(sessions)
          .map(session => Object.values(session.questions))
          .flat(1)
          .reduce(
            (acc, curr) => {
              if (curr.answered) {
                acc.answered++;
              }
              if (curr.selectedAnswer !== void 0) {
                if (curr.selectedAnswer === curr.vowel.id) {
                  acc.correct++;
                } else {
                  acc.wrong++;
                }
              }

              acc.seen.add(curr.vowel.id);

              if (curr.answered) {
                if (curr.selectedAnswer === curr.vowel.id) {
                  acc.currentStreak++;
                  acc.longestStreak = Math.max(
                    acc.longestStreak,
                    acc.currentStreak,
                  );
                } else {
                  acc.currentStreak = 0;
                }
              }

              return acc;
            },
            {
              answered: 0,
              correct: 0,
              seen: new Set<IVowelID>(),
              wrong: 0,
              currentStreak: 0,
              longestStreak: 0,
            },
          );

        const itens = VOWELS.length;
        const seenLength = stats.seen.size;
        return {
          ...stats,
          seenLength,
          itens,
          unSeen: itens - seenLength,
        } satisfies IStatistics;
      },
    );

    const defaultPeriods = [10, 25, 50, 100];
    const selectMovingAverages = createSelector(
      quizSelectors.selectQuizSessions,
      sessions => {
        if (sessions === void 0) {
          return undefined;
        }
        const completed = Object.values(sessions).filter(
          session =>
            !Object.values(session.questions).some(
              question => !question.answered,
            ),
        );

        const length = completed.length;
        if (length === 0) {
          return [];
        }

        const rates = completed.map(session => {
          const qs = Object.values(session.questions ?? {});
          const corrects = qs.filter(
            q => q.selectedAnswer === q.vowel.id,
          ).length;
          const questionsLength = qs.length;
          return corrects / questionsLength;
        });

        const periods = Array.from(
          new Set([
            ...defaultPeriods.filter(period => period <= length),
            length,
          ]),
        )
          .filter(period => period > 0 && period <= length)
          .sort((a, b) => a - b);

        const averages = periods.map(
          period =>
            ({
              length: period,
              type: 'SMA',
              value: rates.slice(-period).reduce((a, b) => a + b, 0) / period,
            }) as IMovingAverage,
        );

        return averages;
      },
    );

    return {
      selectCurrentQuiz,
      ...sessionSelectors,
      selectCurrentSession,
      selectQuestionsLength,
      selectCurrentQuestion,
      ...currentQuestionSelectors,
      selectMovingAverages,
      selectStatsBySession,
      selectTotalStats,
      selectFinished: createSelector(
        sessionSelectors.selectSessionQuestions,
        questions =>
          questions !== void 0 &&
          !Object.values(questions ?? {}).some(question => !question.answered),
      ),
    };
  },
});
