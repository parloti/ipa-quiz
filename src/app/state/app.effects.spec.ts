import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { provideMockActions } from '@ngrx/effects/testing';
import { ROUTER_NAVIGATED } from '@ngrx/router-store';
import { Action } from '@ngrx/store';
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
      ],
    });
    effects = TestBed.inject(AppEffects);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loadState$', () => {
    it('should restore state from localStorage if available', async () => {
      const mockState = {
        quizzes: [
          {
            id: 'quiz-1',
            name: 'Test Quiz',
            description: 'Test',
            sessions: [],
          },
        ],
      };
      localStorage.setItem('state', JSON.stringify(mockState));

      actions$ = of({ type: '@ngrx/effects/init' });

      const result = await new Promise<Action>(resolve => {
        effects.loadState$.subscribe(action => resolve(action));
      });

      expect(result.type).toBe(actions.restoreState.type);
      localStorage.removeItem('state');
    });

    it('should return restoreStateFailed if no state in localStorage', async () => {
      localStorage.removeItem('state');

      actions$ = of({ type: '@ngrx/effects/init' });

      const result = await new Promise<Action>(resolve => {
        effects.loadState$.subscribe(action => resolve(action));
      });

      expect(result.type).toBe(actions.restoreStateFailed.type);
    });

    it('should return restoreStateFailed if localStorage contains invalid JSON', async () => {
      localStorage.setItem('state', 'invalid json');

      actions$ = of({ type: '@ngrx/effects/init' });

      const result = await new Promise<Action>(resolve => {
        effects.loadState$.subscribe(action => resolve(action));
      });

      expect(result.type).toBe(actions.restoreStateFailed.type);
      localStorage.removeItem('state');
    });
  });

  describe('createQuizSession$', () => {
    it('should create a new session with questions', async () => {
      const quiz: IQuiz = {
        id: 'quiz-1',
        name: 'Test Quiz',
        description: 'Test',
        sessions: [],
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
        sessions: [],
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

  describe('saveState$', () => {
    it('should persist state to localStorage after initial skips', async () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

      actions$ = of(actions.restoreStateFailed());
      const subscription = effects.saveState$.subscribe();

      const state1: IState = {
        quizzes: [],
        currentQuizId: undefined,
        version: 1,
      };
      const state2: IState = {
        quizzes: [],
        currentQuizId: 'quiz-1' as any,
        version: 1,
      };
      const state3: IState = {
        quizzes: [],
        currentQuizId: 'quiz-2' as any,
        version: 1,
      };

      quizService.state$.next(state1);
      quizService.state$.next(state2);
      quizService.state$.next(state3);

      await new Promise<void>(resolve => setTimeout(resolve, 0));

      expect(setItemSpy).toHaveBeenCalledWith('state', JSON.stringify(state3));

      subscription.unsubscribe();
    });

    it('should handle localStorage.setItem throwing', async () => {
      const errorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('nope');
      });

      actions$ = of(actions.restoreStateFailed());
      const subscription = effects.saveState$.subscribe();

      const state1: IState = {
        quizzes: [],
        currentQuizId: undefined,
        version: 1,
      };
      const state2: IState = {
        quizzes: [],
        currentQuizId: 'quiz-1' as any,
        version: 1,
      };
      const state3: IState = {
        quizzes: [],
        currentQuizId: 'quiz-2' as any,
        version: 1,
      };

      quizService.state$.next(state1);
      quizService.state$.next(state2);
      quizService.state$.next(state3);

      await new Promise<void>(resolve => setTimeout(resolve, 0));

      expect(errorSpy).toHaveBeenCalled();

      subscription.unsubscribe();
    });
  });

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
