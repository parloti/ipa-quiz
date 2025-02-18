import {
  createFeature,
  createReducer,
  createSelector,
  MemoizedSelector,
  on,
} from '@ngrx/store';
import { immerOn } from 'ngrx-immer/store';
import { defaultQuizzes } from '../default-quizzes';
import { IQuestion } from '../models/iquestion';
import { ISession } from '../models/isession';
import { IState } from '../models/istate';
import { IVowel } from '../models/ivowel';
import { QuestionElement } from '../models/question-element';
import { actions } from './actions';
import { updateState } from './update.state';

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.substring(1);
}

type Primitive = string | number | bigint | boolean | symbol | null | undefined;

type NestedSelectors<TName extends string, TState> = TState extends
  | Primitive
  | unknown[]
  | Date
  ? {}
  : {
      [K in keyof TState &
        string as `select${Capitalize<TName>}${Capitalize<K>}`]: MemoizedSelector<
        Record<string, any>,
        TState[K],
        (featureState: TState) => TState[K]
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
  const keys = Object.keys(initialState ?? {}) as (string & keyof TState)[];
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
  quizzes: [...defaultQuizzes],
  openedQuiz: void 0,
  version: 1,
  session: void 0,
});

export const quizFeature = createFeature({
  name: 'quiz',
  reducer: createReducer(
    initialState,
    on(actions.addQuiz, (state, { quiz }) =>
      updateState(state, { quizzes: [...state.quizzes, quiz] }),
    ),
    on(actions.addSession, (state, { session }) =>
      updateState(state, { session }),
    ),
    on(actions.openQuiz, (state, { quiz }) =>
      updateState(state, { openedQuiz: quiz }),
    ),
    immerOn(actions.selectAnswer, (state, { selectedAnswer }) => {
      const session = state.session;
      const index = session?.currentQuestionIndex;
      const question = session?.questions;
      if (index !== void 0 && question?.[index]) {
        question[index].selectedAnswer = selectedAnswer;
      }
      return state;
    }),
    on(actions.restoreState, (state, { restoring }) =>
      updateState(state, restoring),
    ),
    immerOn(actions.answerCurrent, (state, { date }) => {
      const session = state.session;
      const index = session?.currentQuestionIndex;
      const question = session?.questions;
      if (index !== void 0 && question?.[index]) {
        question[index].answered = true;
        question[index].answeredDate = date;
      }
      return state;
    }),
    immerOn(actions.nextQuestion, state => {
      const session = state.session;
      if (
        session &&
        session.currentQuestionIndex < session.questions.length - 1
      ) {
        session.currentQuestionIndex++;
      }
      return state;
    }),
  ),
  extraSelectors: base => {
    const sessionSelectors = createNestedSelectors(
      'session',
      base.selectSession,
      {
        creationDate: '',
        currentQuestionIndex: 0,
        id: 0,
        questions: [],
      } as ISession,
    );

    const selectQuestionsLength = createSelector(
      sessionSelectors.selectSessionQuestions,
      questions => questions?.length,
    );
    const selectCurrentQuestion = createSelector(
      sessionSelectors.selectSessionQuestions,
      sessionSelectors.selectSessionCurrentQuestionIndex,
      (questions, index) => (index === void 0 ? void 0 : questions?.[index]),
    );

    const currentQuestionSelectors = createNestedSelectors(
      'currentQuestion',
      selectCurrentQuestion,
      {
        index: 0,
        answered: false,
        options: [],
        selectedAnswer: 0,
        type: QuestionElement.Letter,
        vowel: {} as IVowel,
      } as IQuestion,
    );

    return {
      ...sessionSelectors,
      selectQuestionsLength,
      selectCurrentQuestion,
      ...currentQuestionSelectors,
      selectFinished: createSelector(
        selectQuestionsLength,
        sessionSelectors.selectSessionCurrentQuestionIndex,
        (length, index) =>
          length === void 0 || index === void 0 ? void 0 : index === length - 1,
      ),
    };
  },
});
