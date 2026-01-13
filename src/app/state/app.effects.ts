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
  exhaustMap,
  filter,
  map,
  mergeMap,
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

  loadState$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ROOT_EFFECTS_INIT),
        tap(() => {
          try {
            // Initialize Firebase auth. Do NOT auto-sign-in anonymously here;
            // allow the user to choose anonymous sign-in from the login UI.
            this.firebaseAuth.init();
          } catch (e) {
            // ignore initialization errors
          }
        }),
      ),
    { dispatch: false },
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

  // Local state persistence removed; Firestore persistence is enabled in
  // `FirebaseService`. UI updates should be applied locally and Firestore
  // will synchronize when available.

  // Debounced cloud sync: batches rapid changes and sends only diffs.
  cloudSync$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          actions.restoreState,
          actions.addQuiz,
          actions.addSession,
          actions.answerCurrent,
          actions.selectAnswer,
          actions.updateQuestionSoundIndex,
          actions.updateOptionSoundIndex,
        ),
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
