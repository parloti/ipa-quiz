import { describe, expect, it } from 'vitest';
import type { IQuestion } from '../models/iquestion';
import type { IQuiz, IQuizID } from '../models/iquiz';
import type { ISession, ISessionID } from '../models/isession';
import type { IState } from '../models/istate';
import type { IVowel, IVowelID } from '../models/ivowel';
import { QuestionElement } from '../models/question-element';
import { actions } from './actions';
import { APP_ROUTER_NAVIGATION } from './app-router-actions';
import { quizFeature } from './quiz-feature';

function createVowel(id: IVowelID): IVowel {
  return {
    id,
    name: 'Test',
    letter: { upper: 'A', lower: 'a' } as any,
    symbol: { entities: [], href: '', unicodes: [], names: [] },
  };
}

function answeredQuestion({
  index,
  vowel,
  selectedAnswer,
}: {
  index: number;
  vowel: IVowel;
  selectedAnswer: IVowelID;
}): IQuestion {
  return {
    vowel,
    type: QuestionElement.Letter,
    index,
    options: [],
    answered: true,
    answeredDate: '2026-01-03',
    selectedAnswer,
  };
}

function unansweredQuestion({
  index,
  vowel,
}: {
  index: number;
  vowel: IVowel;
}): IQuestion {
  return {
    vowel,
    type: QuestionElement.Letter,
    index,
    options: [],
    answered: false,
    selectedAnswer: undefined,
  };
}

function createSession(params: {
  quizId: IQuizID;
  id: ISessionID;
  currentQuestionIndex: number;
  questions: IQuestion[];
}): ISession {
  return {
    quizId: params.quizId,
    id: params.id,
    creationDate: '2026-01-03',
    questions: Object.fromEntries(
      params.questions.map(q => [String(q.index), q]),
    ) as any,
    currentQuestionIndex: params.currentQuestionIndex,
  };
}

function createQuiz(id: IQuizID): IQuiz {
  return {
    id,
    name: 'Quiz',
    description: 'Desc',
    sessions: {},
    currentSessionId: undefined,
  };
}

describe('quizFeature (quiz-feature.ts)', () => {
  it('covers selectors when no quiz is selected (sessions undefined)', () => {
    const state = quizFeature.reducer(undefined, { type: '@@init' } as any);
    const root = { quiz: state };

    expect(quizFeature.selectStatsBySession(root)).toBeUndefined();
    expect(quizFeature.selectTotalStats(root)).toBeUndefined();
    expect(quizFeature.selectMovingAverages(root)).toBeUndefined();
  });

  it('covers moving averages empty when no completed sessions exist', () => {
    const quiz = createQuiz('quiz-95');
    const v1 = createVowel('vowel-1');

    const incompleteSession = createSession({
      quizId: quiz.id,
      id: 'session-incomplete' as any,
      currentQuestionIndex: 0,
      questions: [unansweredQuestion({ index: 0, vowel: v1 })],
    });

    let state = quizFeature.reducer(undefined, { type: '@@init' } as any);
    state = quizFeature.reducer(state, actions.addQuiz({ quiz }));
    state = quizFeature.reducer(state, actions.openQuiz({ quizId: quiz.id }));
    state = quizFeature.reducer(
      state,
      actions.addSession({ session: incompleteSession }),
    );

    const root = { quiz: state };
    expect(quizFeature.selectMovingAverages(root)).toEqual([]);
  });

  it('covers guard returns when quiz is opened but no session is opened', () => {
    const quiz = createQuiz('quiz-94');

    let state = quizFeature.reducer(undefined, { type: '@@init' } as any);
    state = quizFeature.reducer(state, actions.addQuiz({ quiz }));
    state = quizFeature.reducer(state, actions.openQuiz({ quizId: quiz.id }));

    // With no currentSessionId, these should all early-return.
    state = quizFeature.reducer(
      state,
      actions.selectAnswer({ selectedAnswer: 'vowel-1' }),
    );
    state = quizFeature.reducer(
      state,
      actions.answerCurrent({ date: '2026-01-03' }),
    );
    state = quizFeature.reducer(state, actions.nextQuestion());
    state = quizFeature.reducer(state, actions.previousQuestion());

    expect(state.currentQuizId).toBe(quiz.id);
  });

  it('covers previousQuestion no-op when currentQuestionIndex is 0', () => {
    const quiz = createQuiz('quiz-93');
    const v1 = createVowel('vowel-1');

    const session = createSession({
      quizId: quiz.id,
      id: 'session-93' as any,
      currentQuestionIndex: 0,
      questions: [unansweredQuestion({ index: 0, vowel: v1 })],
    });

    let state = quizFeature.reducer(undefined, { type: '@@init' } as any);
    state = quizFeature.reducer(state, actions.addQuiz({ quiz }));
    state = quizFeature.reducer(state, actions.openQuiz({ quizId: quiz.id }));
    state = quizFeature.reducer(state, actions.addSession({ session }));
    state = quizFeature.reducer(
      state,
      actions.openSession({ quizId: quiz.id, sessionId: session.id }),
    );

    const before =
      state.quizzes[quiz.id]?.sessions[session.id]?.currentQuestionIndex;
    state = quizFeature.reducer(state, actions.previousQuestion());
    const after =
      state.quizzes[quiz.id]?.sessions[session.id]?.currentQuestionIndex;

    expect(before).toBe(0);
    expect(after).toBe(0);
  });

  it('covers selectCurrentQuestion branch when currentQuestionIndex is undefined', () => {
    const quiz = createQuiz('quiz-92');
    const v1 = createVowel('vowel-1');

    const session = createSession({
      quizId: quiz.id,
      id: 'session-92' as any,
      currentQuestionIndex: 0,
      questions: [unansweredQuestion({ index: 0, vowel: v1 })],
    }) as any;
    session.currentQuestionIndex = undefined;

    let state = quizFeature.reducer(undefined, { type: '@@init' } as any);
    state = quizFeature.reducer(state, actions.addQuiz({ quiz }));
    state = quizFeature.reducer(state, actions.openQuiz({ quizId: quiz.id }));
    state = quizFeature.reducer(state, actions.addSession({ session }));
    state = quizFeature.reducer(
      state,
      actions.openSession({ quizId: quiz.id, sessionId: session.id }),
    );

    const root = { quiz: state };
    expect(quizFeature.selectCurrentQuestion(root)).toBeUndefined();
  });

  it('covers reducer guard clauses (no current quiz/session)', () => {
    let state = quizFeature.reducer(undefined, { type: '@@init' } as any);

    state = quizFeature.reducer(
      state,
      actions.selectAnswer({ selectedAnswer: 'vowel-1' }),
    );
    state = quizFeature.reducer(
      state,
      actions.answerCurrent({ date: '2026-01-03' }),
    );
    state = quizFeature.reducer(state, actions.nextQuestion());
    state = quizFeature.reducer(state, actions.previousQuestion());

    expect(state).toBeTruthy();
  });

  it('covers addQuiz/openQuiz/addSession/openSession/selectAnswer/answerCurrent/next/previous branches', () => {
    const quiz = createQuiz('quiz-99');
    const v1 = createVowel('vowel-1');
    const v2 = createVowel('vowel-2');

    const session = createSession({
      quizId: quiz.id,
      id: 'session-1',
      currentQuestionIndex: 0,
      questions: [
        unansweredQuestion({ index: 0, vowel: v1 }),
        unansweredQuestion({ index: 1, vowel: v2 }),
      ],
    });

    let state = quizFeature.reducer(undefined, { type: '@@init' } as any);

    state = quizFeature.reducer(state, actions.addQuiz({ quiz }));
    state = quizFeature.reducer(state, actions.openQuiz({ quizId: quiz.id }));
    state = quizFeature.reducer(state, actions.addSession({ session }));

    // openSession happy-path
    state = quizFeature.reducer(
      state,
      actions.openSession({ quizId: quiz.id, sessionId: session.id }),
    );

    // openSession no-op when quiz not found
    state = quizFeature.reducer(
      state,
      actions.openSession({ quizId: 'quiz-98', sessionId: session.id }),
    );

    // selectAnswer true-path
    state = quizFeature.reducer(
      state,
      actions.selectAnswer({ selectedAnswer: v1.id }),
    );

    // answerCurrent true-path
    state = quizFeature.reducer(
      state,
      actions.answerCurrent({ date: '2026-01-03' }),
    );

    // nextQuestion increments
    state = quizFeature.reducer(state, actions.nextQuestion());
    // previousQuestion decrements
    state = quizFeature.reducer(state, actions.previousQuestion());

    // nextQuestion no-op at end
    state = quizFeature.reducer(state, actions.nextQuestion());
    state = quizFeature.reducer(state, actions.nextQuestion());

    const root = { quiz: state };

    expect(quizFeature.selectCurrentQuiz(root)?.id).toBe(quiz.id);
    expect(quizFeature.selectCurrentSession(root)?.id).toBe(session.id);
    expect(quizFeature.selectQuestionsLength(root)).toBe(2);

    // currentQuestion selectors
    expect(quizFeature.selectCurrentQuestion(root)?.index).toBeDefined();
    expect(quizFeature.selectCurrentQuestionAnswered(root)).toBeDefined();
  });

  it('covers selectAnswer/answerCurrent false-path when index is out of range', () => {
    const quiz = createQuiz('quiz-97');
    const v1 = createVowel('vowel-1');

    const session = createSession({
      quizId: quiz.id,
      id: 'session-2',
      currentQuestionIndex: 999,
      questions: [unansweredQuestion({ index: 0, vowel: v1 })],
    });

    let state = quizFeature.reducer(undefined, { type: '@@init' } as any);
    state = quizFeature.reducer(state, actions.addQuiz({ quiz }));
    state = quizFeature.reducer(state, actions.openQuiz({ quizId: quiz.id }));
    state = quizFeature.reducer(state, actions.addSession({ session }));
    state = quizFeature.reducer(
      state,
      actions.openSession({ quizId: quiz.id, sessionId: session.id }),
    );

    state = quizFeature.reducer(
      state,
      actions.selectAnswer({ selectedAnswer: v1.id }),
    );
    state = quizFeature.reducer(
      state,
      actions.answerCurrent({ date: '2026-01-03' }),
    );

    expect(state).toBeTruthy();
  });

  it('covers restoreState + APP_ROUTER_NAVIGATION url parsing (match + no match)', () => {
    const restoring: IState = {
      quizzes: { 'quiz-1': createQuiz('quiz-1') } as any,
      currentQuizId: 'quiz-1',
      version: 1,
    };

    let state = quizFeature.reducer(undefined, { type: '@@init' } as any);
    state = quizFeature.reducer(state, actions.restoreState({ restoring }));

    state = quizFeature.reducer(state, {
      type: APP_ROUTER_NAVIGATION.type,
      payload: { routerState: { url: '/quiz-2' } },
    } as any);

    expect(state.currentQuizId).toBe('quiz-2');

    state = quizFeature.reducer(state, {
      type: APP_ROUTER_NAVIGATION.type,
      payload: { routerState: { url: '/nope' } },
    } as any);

    expect(state.currentQuizId).toBe('quiz-2');
  });

  it('covers stats selectors (by session + total) and selectFinished', () => {
    const quiz = createQuiz('quiz-96');
    const v1 = createVowel('vowel-1');
    const v2 = createVowel('vowel-2');

    const session1 = createSession({
      quizId: quiz.id,
      id: 'session-10',
      currentQuestionIndex: 0,
      questions: [
        answeredQuestion({ index: 0, vowel: v1, selectedAnswer: v1.id }), // correct
        answeredQuestion({ index: 1, vowel: v2, selectedAnswer: v2.id }), // correct
        answeredQuestion({ index: 2, vowel: v1, selectedAnswer: 'vowel-999' }), // wrong
        unansweredQuestion({ index: 3, vowel: v2 }), // unanswered
      ],
    });

    const session2 = createSession({
      quizId: quiz.id,
      id: 'session-11',
      currentQuestionIndex: 0,
      questions: [
        answeredQuestion({ index: 0, vowel: v1, selectedAnswer: v1.id }),
      ],
    });

    let state = quizFeature.reducer(undefined, { type: '@@init' } as any);
    state = quizFeature.reducer(state, actions.addQuiz({ quiz }));
    state = quizFeature.reducer(state, actions.openQuiz({ quizId: quiz.id }));
    state = quizFeature.reducer(
      state,
      actions.addSession({ session: session1 }),
    );
    state = quizFeature.reducer(
      state,
      actions.addSession({ session: session2 }),
    );

    const root = { quiz: state };

    // selectCurrentSession should fallback to last session when currentSessionId is undefined
    expect(quizFeature.selectCurrentSession(root)?.id).toBe('session-11');

    const statsBySession = quizFeature.selectStatsBySession(root);
    expect(statsBySession?.length).toBe(2);

    const total = quizFeature.selectTotalStats(root);
    expect(total?.correct).toBeGreaterThanOrEqual(1);

    // selectFinished true/false paths
    // current session is session2 which is finished
    expect(quizFeature.selectFinished(root)).toBe(true);

    state = quizFeature.reducer(
      state,
      actions.openSession({ quizId: quiz.id, sessionId: session1.id }),
    );
    expect(quizFeature.selectFinished({ quiz: state })).toBe(false);
  });

  it('covers selectMovingAverages: undefined sessions, no completed sessions, and last-N behavior', () => {
    // When there is no current quiz, sessions selector yields undefined
    const init = quizFeature.reducer(undefined, { type: '@@init' } as any);
    expect(
      quizFeature.selectMovingAverages({ quiz: init } as any),
    ).toBeUndefined();

    const quiz = createQuiz('quiz-95');
    const v1 = createVowel('vowel-1');

    // One incomplete session -> no completed sessions => []
    const incomplete = createSession({
      quizId: quiz.id,
      id: 'session-20',
      currentQuestionIndex: 0,
      questions: [unansweredQuestion({ index: 0, vowel: v1 })],
    });

    let state = quizFeature.reducer(init, actions.addQuiz({ quiz }));
    state = quizFeature.reducer(state, actions.openQuiz({ quizId: quiz.id }));
    state = quizFeature.reducer(
      state,
      actions.addSession({ session: incomplete }),
    );

    expect(quizFeature.selectMovingAverages({ quiz: state })).toEqual([]);

    // 12 completed sessions: first 2 are 0%, last 10 are 100%.
    // SMA(10) should be 1.0 if we consider LAST sessions.
    const completedSessions: ISession[] = Array.from({ length: 12 }).map(
      (_, i) => {
        const correct = i >= 2;
        return createSession({
          quizId: quiz.id,
          id: `session-${100 + i}` as const,
          currentQuestionIndex: 0,
          questions: [
            answeredQuestion({
              index: 0,
              vowel: v1,
              selectedAnswer: correct ? v1.id : 'vowel-999',
            }),
          ],
        });
      },
    );

    // Replace state with restoring to avoid fiddly mutations
    const restoring: IState = {
      quizzes: {
        [quiz.id]: {
          ...quiz,
          sessions: Object.fromEntries(
            completedSessions.map(s => [s.id, s]),
          ) as any,
          currentSessionId: completedSessions.at(-1)?.id,
        },
      } as any,
      currentQuizId: quiz.id,
      version: 1,
    };

    state = quizFeature.reducer(state, actions.restoreState({ restoring }));

    const ma = quizFeature.selectMovingAverages({ quiz: state })!;
    const ma10 = ma.find(x => x.length === 10);
    const ma12 = ma.find(x => x.length === 12);

    expect(ma10?.value).toBeCloseTo(1, 10);
    expect(ma12?.value).toBeCloseTo(10 / 12, 10);
  });
});
