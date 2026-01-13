import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { provideMockActions } from '@ngrx/effects/testing';
import { ROUTER_NAVIGATED } from '@ngrx/router-store';
import { Action, Store } from '@ngrx/store';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IQuiz } from '../models/iquiz';
import type { ISession } from '../models/isession';
import type { IState } from '../models/istate';
import { QuizService } from '../services/quiz.service';
import { actions } from './actions';

import { AppEffects } from './app.effects';

describe('AppEffectsService', () => {
  let effects: AppEffects;
  let actions$: Observable<Action>;
  let router: Router;

  let quizService: {
    openedQuiz$: BehaviorSubject<IQuiz | undefined>;
    session$: BehaviorSubject<ISession | undefined>;
    state$: BehaviorSubject<IState | undefined>;
  };

  beforeEach(() => {
    quizService = {
      openedQuiz$: new BehaviorSubject<IQuiz | undefined>(undefined),
      session$: new BehaviorSubject<ISession | undefined>(undefined),
      state$: new BehaviorSubject<IState | undefined>(undefined),
    };

    TestBed.configureTestingModule({
      providers: [
        provideMockActions(() => actions$),
        AppEffects,
        {
          provide: Router,
          useValue: {
            navigate: vi.fn().mockResolvedValue(true),
          },
        },
        { provide: QuizService, useValue: quizService },
        { provide: Store, useValue: { dispatch: vi.fn() } },
      ],
    });
    effects = TestBed.inject(AppEffects);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loadState$', () => {
    it('initializes firebase auth without dispatching actions', async () => {
      actions$ = of({ type: '@ngrx/effects/init' });

      let emittedAction: Action | undefined;
      effects.loadState$.subscribe(action => (emittedAction = action));

      // allow the effect to run
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(emittedAction?.type).toBe('@ngrx/effects/init');
    });
  });

  describe('createQuizSession$', () => {
    it('should create a new session with questions', async () => {
      const quiz: IQuiz = {
        id: 'quiz-1',
        name: 'Test Quiz',
        description: 'Test',
        sessions: {},
      };
      actions$ = of(actions.createQuizSession({ quiz }));

      const results: Action[] = [];
      await new Promise<void>(resolve => {
        effects.createQuizSession$.subscribe(action => {
          results.push(action);
          if (results.length === 2) {
            resolve();
          }
        });
      });

      expect(results[0].type).toBe(actions.addSession.type);
      expect(results[1].type).toBe(actions.openSession.type);
    });
  });

  describe('goToNewSession$', () => {
    it('should create a new session when quiz is opened', async () => {
      const quiz: IQuiz = {
        id: 'quiz-1',
        name: 'Test Quiz',
        description: 'Test',
        sessions: {},
      };
      quizService.openedQuiz$.next(quiz);

      actions$ = of(actions.goToNewSession());

      const results: Action[] = [];
      await new Promise<void>(resolve => {
        effects.goToNewSession$.subscribe(action => {
          results.push(action);
          if (results.length === 2) {
            resolve();
          }
        });
      });

      expect(results[0].type).toBe(actions.addSession.type);
      expect(results[1].type).toBe(actions.openSession.type);
    });
  });

  // LocalStorage persistence removed — no saveState$ effect to test.

  describe('openQuiz$', () => {
    it('should navigate to quiz-home when openQuiz action is dispatched', async () => {
      const quizId = 'quiz-1';
      actions$ = of(actions.openQuiz({ quizId }));

      await new Promise<void>(resolve => {
        effects.openQuiz$.subscribe(() => resolve());
      });

      expect(router.navigate).toHaveBeenCalledWith(['/quiz-home/' + quizId]);
    });
  });

  describe('practiceOpened$', () => {
    it('should dispatch goToNewSession when session is undefined', async () => {
      // Set up state with no session
      actions$ = of(actions.practiceOpened({ quizId: 'quiz-1' }));

      const result = await new Promise<Action>(resolve => {
        effects.practiceOpened$.subscribe(action => resolve(action));
      });

      expect(result.type).toBe(actions.goToNewSession.type);
    });
  });

  describe('goBack$', () => {
    it('should navigate to home', async () => {
      const routerNavigatedAction = {
        type: ROUTER_NAVIGATED,
        payload: {
          routerState: { url: '/test' } as any,
          event: new NavigationEnd(1, '/test', '/test'),
        },
      };

      actions$ = of(actions.goBack(), routerNavigatedAction as any);

      await new Promise<void>(resolve => {
        effects.goBack$.subscribe(() => resolve());
      });

      expect(router.navigate).toHaveBeenCalledWith(['']);
    });
  });
});
