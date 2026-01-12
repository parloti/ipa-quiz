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
  tap,
  withLatestFrom,
} from 'rxjs';
import { debounceTime, filter as rxFilter } from 'rxjs/operators';
import { IQuiz } from '../models/iquiz';
import { ISessionID } from '../models/isession';
import { CloudSyncService } from '../services/cloud-sync.service';
import { FirebaseAuthService } from '../services/firebase-auth.service';
import { PhonemeSoundsService } from '../services/phoneme-sounds.service';
import { QuizService } from '../services/quiz.service';
import { actions } from './actions';
import { APP_ROUTER_NAVIGATED } from './app-router-actions';
import { createQuestionsWithSounds } from './create-questions';
import { pluckPath } from './pluck-path';

@Injectable({
  providedIn: 'root',
})
export class AppEffects {
  private readonly actions$ = inject<Actions<Action>>(Actions);
  private readonly router = inject(Router);

  private readonly quizService = inject(QuizService);
  private readonly phonemeSoundsService = inject(PhonemeSoundsService);
  private readonly cloudSyncService = inject(CloudSyncService);
  private readonly firebaseAuth = inject(FirebaseAuthService);

  loadState$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROOT_EFFECTS_INIT),
      tap(() => {
        try {
          // Initialize Firebase auth and attempt anonymous sign-in if configured
          this.firebaseAuth.init();
          this.firebaseAuth.signInAnonymously().catch(() => {});
        } catch (e) {
          // ignore initialization errors
        }
      }),
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
      mergeMap(({ quiz }) =>
        createQuestionsWithSounds(this.phonemeSoundsService).then(
          questions => ({
            questions,
            quizId: quiz.id,
          }),
        ),
      ),
      mergeMap(({ questions, quizId }) => {
        const date = new Date();
        return [
          actions.addSession({
            session: {
              creationDate: date.toISOString(),
              currentQuestionIndex: 0,
              id: `session-${date.getTime()}`,
              questions: Object.fromEntries(questions.map(q => [q.index, q])),
              quizId,
            },
          }),
          actions.openSession({
            quizId,
            sessionId: ('session-' + date.getTime()) as ISessionID,
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
      mergeMap(([, quiz]) =>
        createQuestionsWithSounds(this.phonemeSoundsService).then(
          questions => ({
            questions,
            quizId: quiz.id,
          }),
        ),
      ),
      mergeMap(({ questions, quizId }) => {
        const date = new Date();
        return [
          actions.addSession({
            session: {
              creationDate: date.toISOString(),
              currentQuestionIndex: 0,
              id: `session-${date.getTime()}`,
              questions: Object.fromEntries(questions.map(q => [q.index, q])),
              quizId,
            },
          }),
          actions.openSession({
            quizId,
            sessionId: ('session-' + date.getTime()) as ISessionID,
          }),
        ];
      }),
    ),
  );

  saveState$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(actions.restoreState, actions.restoreStateFailed),
        exhaustMap(() =>
          this.quizService.state$.pipe(
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
          ),
        ),
      ),
    { dispatch: false },
  );

  // Debounced cloud sync: batches rapid changes and sends only diffs.
  cloudSync$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(actions.restoreState, actions.restoreStateFailed),
        // Wait for the local state stream to emit the current state
        exhaustMap(() =>
          this.quizService.state$.pipe(
            rxFilter(state => state !== void 0),
            // Debounce to avoid sending too frequently (3s)
            debounceTime(3000),
            // call cloud sync but don't dispatch actions
            mergeMap(state => this.cloudSyncService.sync(state)),
          ),
        ),
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
      filter(([, session]) => session === void 0),
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
        concatMap(() => this.router.navigate([''])),
      ),
    { dispatch: false },
  );
}
