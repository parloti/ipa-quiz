import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  Actions,
  createEffect,
  ofType,
  ROOT_EFFECTS_INIT,
} from '@ngrx/effects';
import { Action } from '@ngrx/store';
import {
  concatMap,
  distinctUntilChanged,
  exhaustMap,
  filter,
  map,
  mergeMap,
  skip,
  withLatestFrom,
} from 'rxjs';
import { IQuestion } from '../models/iquestion';
import { IQuiz } from '../models/iquiz';
import { ISession } from '../models/isession';
import { IVowel } from '../models/ivowel';
import { QuestionElement } from '../models/question-element';
import { QuizService } from '../services/quiz.service';
import { randomInteger } from '../utils/random-integer';
import { shuffle } from '../utils/shuffle';
import { VOWELS } from '../vowels';
import { actions } from './actions';
import { APP_ROUTER_NAVIGATED } from './app-router-actions';
import { pluckPath } from './pluck-path';

function createQuestions(): IQuestion[] {
  const nQuestions = 10;
  const nAnswers = 5;

  const questionStemVowelIds = new Set<IVowel['id']>();
  const questionOptionVowelsById = new Map<IVowel['id'], IVowel[]>();

  while (questionStemVowelIds.size < nQuestions) {
    const optionVowelIds = new Set<IVowel['id']>();
    const minVowelId = 1;
    const maxVowelId = VOWELS.length;
    const stemId =
      `vowel-${randomInteger(minVowelId, maxVowelId + 1)}` as IVowel['id'];

    questionStemVowelIds.add(stemId);
    optionVowelIds.add(stemId);

    while (optionVowelIds.size < nAnswers) {
      const answerId =
        `vowel-${randomInteger(minVowelId, maxVowelId + 1)}` as IVowel['id'];
      optionVowelIds.add(answerId);
    }

    const optionIds = [...optionVowelIds]
      .map(optionVowelId => VOWELS.find(v => v.id === optionVowelId))
      .filter(v => v !== undefined);
    if (optionIds.length !== nAnswers) {
      debugger;
    }

    questionOptionVowelsById.set(stemId, optionIds);
  }

  const questionStemIds = [...questionStemVowelIds]
    .map(questionStemVowelId => VOWELS.find(v => v.id === questionStemVowelId))
    .filter(v => v !== undefined);
  if (questionStemIds.length !== nQuestions) {
    debugger;
  }

  const elements = [
    QuestionElement.Letter,
    QuestionElement.Sound,
    QuestionElement.Name,
  ] as const;

  const minElementIndex = 0;
  const maxElementIndex = 2;
  const questions = questionStemIds.map((vowel, index) => {
    const questionElements = new Set<QuestionElement>();

    while (questionElements.size < 3) {
      const index = randomInteger(minElementIndex, maxElementIndex + 1);
      questionElements.add(elements[index]);
    }

    const [askType, ...answerType] = [...questionElements.values()];

    const question: IQuestion = {
      vowel,
      answered: false,
      type: askType,
      index: index,
      selectedAnswer: void 0,
      options:
        questionOptionVowelsById.get(vowel.id)?.map(
          vowel =>
            ({
              ...vowel,
              type: Math.random() < 0.5 ? answerType[0] : answerType[1],
            }) as IVowel & { type: QuestionElement },
        ) || [],
    };
    shuffle(question.options);

    return question;
  });

  return questions;
}

@Injectable({
  providedIn: 'root',
})
export class AppEffects {
  private readonly actions$ = inject<Actions<Action>>(Actions);
  private readonly router = inject(Router);

  private readonly quizService = inject(QuizService);
  loadState$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROOT_EFFECTS_INIT),
      map(() => {
        try {
          const stringifiedState = localStorage.getItem('state');
          if (stringifiedState !== null) {
            const restoring = JSON.parse(stringifiedState);
            if (restoring !== void 0) {
              return actions.restoreState({ restoring });
            }
          }
        } catch (error) {
          debugger;
          console.error('Unable to retore state from local storage:', error);
        }
        return actions.restoreStateFailed();
      }),
      filter(action => action !== void 0),
    ),
  );

  createQuizSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.createQuizSession),
      map(({ quiz }) => ({ questions: createQuestions(), quizId: quiz.id })),
      mergeMap(({ questions, quizId }) => {
        const date = new Date();
        return [
          actions.addSession({
            session: {
              creationDate: date.toISOString(),
              currentQuestionIndex: 0,
              id: `session-${date.getTime()}`,
              questions,
              quizId,
            },
          }),
          actions.openSession({
            quizId,
            sessionId: ('session-' + date.getTime()) as ISession['id'],
          }),
        ];
      }),
    ),
  );

  goToNewSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.goToNewSession),
      withLatestFrom(
        this.quizService.openedQuiz$.pipe(
          filter((quiz): quiz is IQuiz => quiz !== void 0),
        ),
      ),
      map(([, quiz]) => ({
        questions: createQuestions(),
        quizId: quiz.id as IQuiz['id'],
      })),
      mergeMap(({ questions, quizId }) => {
        const date = new Date();
        return [
          actions.addSession({
            session: {
              creationDate: date.toISOString(),
              currentQuestionIndex: 0,
              id: `session-${date.getTime()}`,
              questions,
              quizId,
            },
          }),
          actions.openSession({
            quizId,
            sessionId: ('session-' + date.getTime()) as ISession['id'],
          }),
        ];
      }),
    ),
  );

  saveState$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(actions.restoreState, actions.restoreStateFailed),
        exhaustMap(() => {
          return this.quizService.state$.pipe(
            filter(state => state !== void 0),
            skip(2),
            distinctUntilChanged(),
            map(state => {
              try {
                localStorage.setItem('state', JSON.stringify(state));
                console.log('Saved state to local storage:', state);
              } catch (error) {
                console.error('Unable to save state to local storage:', error);
              }
            }),
          );
        }),
      ),
    { dispatch: false },
  );

  openQuiz$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(actions.openQuiz),
        concatMap(({ quizId }) =>
          this.router.navigate(['/quiz-home/' + quizId]),
        ),
      ),
    { dispatch: false },
  );

  practiceOpened$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.practiceOpened),
      withLatestFrom(this.quizService.session$),
      filter(([_, session]) => session === void 0),
      map(() => actions.goToNewSession()),
    ),
  );

  goBack$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(actions.goBack),
        withLatestFrom(
          this.actions$.pipe(ofType(APP_ROUTER_NAVIGATED), pluckPath()),
        ),
        concatMap(() => {
          return this.router.navigate(['']);
        }),
      ),
    { dispatch: false },
  );
}
