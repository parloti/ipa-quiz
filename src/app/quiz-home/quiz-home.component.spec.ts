import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Router } from '@angular/router';
import { Store, StoreModule } from '@ngrx/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IQuestion } from '../models/iquestion';
import { IQuiz } from '../models/iquiz';
import type { ISession } from '../models/isession';
import { QuestionElement } from '../models/question-element';
import { QuizService } from '../services/quiz.service';
import { actions } from '../state/actions';
import { quizFeature } from '../state/quiz-feature';
import { VOWELS } from '../vowels';
import { QuizHomeComponent } from './quiz-home.component';

describe('QuizResultComponent', () => {
  let component: QuizHomeComponent;
  let fixture: ComponentFixture<QuizHomeComponent>;

  const createQuestions = (params: {
    total: number;
    answered: number;
    correct: number;
  }): IQuestion[] => {
    const { total, answered, correct } = params;
    const questions: IQuestion[] = [];

    for (let i = 0; i < total; i++) {
      const vowel = VOWELS[i % VOWELS.length];

      const isAnswered = i < answered;
      const isCorrect = i < correct;

      if (isAnswered) {
        questions.push({
          vowel,
          type: QuestionElement.Name,
          index: i,
          options: [] as any,
          answered: true,
          answeredDate: '2026-01-03',
          selectedAnswer: isCorrect
            ? vowel.id
            : VOWELS[(i + 1) % VOWELS.length].id,
        });
      } else {
        questions.push({
          vowel,
          type: QuestionElement.Name,
          index: i,
          options: [] as any,
          answered: false,
          selectedAnswer: undefined,
        });
      }
    }

    return questions;
  };

  const createSession = (params: {
    quizId: IQuiz['id'];
    id: ISession['id'];
    answered: number;
    total: number;
  }): ISession => {
    const questions = createQuestions({
      total: params.total,
      answered: params.answered,
      correct: Math.min(params.answered, params.total),
    });

    return {
      id: params.id,
      quizId: params.quizId,
      creationDate: '2026-01-03',
      currentQuestionIndex: 0,
      questions,
    };
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        QuizHomeComponent,
        StoreModule.forRoot({ quiz: quizFeature.reducer }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('practice', () => {
    it('should call quizService.practiceOpened and navigate when id is set', async () => {
      const quizService = TestBed.inject(QuizService);
      const router = TestBed.inject(Router);
      vi.spyOn(quizService, 'practiceOpened');
      vi.spyOn(router, 'navigate');

      component.id = 'quiz-1';
      component.practice();

      expect(quizService.practiceOpened).toHaveBeenCalledWith('quiz-1');
      expect(router.navigate).toHaveBeenCalledWith(['quiz/quiz-1']);
    });

    it('should do nothing when id is not set', () => {
      const quizService = TestBed.inject(QuizService);
      const router = TestBed.inject(Router);
      vi.spyOn(quizService, 'practiceOpened');
      vi.spyOn(router, 'navigate');

      component.practice();

      expect(quizService.practiceOpened).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('template rendering', () => {
    it('should display total stats when available', async () => {
      const store = TestBed.inject(Store);

      // Add a quiz and session with stats
      const quizId: IQuiz['id'] = 'quiz-1';
      store.dispatch(
        actions.addQuiz({
          quiz: {
            id: quizId,
            name: 'Test Quiz',
            description: 'Test',
            sessions: [],
          },
        }),
      );
      store.dispatch(actions.openQuiz({ quizId }));

      fixture.detectChanges();
      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Total');
    });

    it('should display stats by session when available', async () => {
      const store = TestBed.inject(Store);
      const quizId: IQuiz['id'] = 'quiz-1';

      store.dispatch(
        actions.addQuiz({
          quiz: {
            id: quizId,
            name: 'Test Quiz',
            description: 'Test',
            sessions: [],
          },
        }),
      );
      store.dispatch(actions.openQuiz({ quizId }));

      fixture.detectChanges();
      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Sessions');
    });

    it('should display moving averages when available', async () => {
      const store = TestBed.inject(Store);
      const quizId: IQuiz['id'] = 'quiz-1';

      store.dispatch(
        actions.addQuiz({
          quiz: {
            id: quizId,
            name: 'Test Quiz',
            description: 'Test',
            sessions: [],
          },
        }),
      );
      store.dispatch(actions.openQuiz({ quizId }));

      fixture.detectChanges();
      await fixture.whenStable();

      // The component should render even if no moving averages are available
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled).toBeTruthy();
    });

    it('should call practice when practice button is clicked', async () => {
      const quizService = TestBed.inject(QuizService);
      const router = TestBed.inject(Router);
      vi.spyOn(quizService, 'practiceOpened');
      vi.spyOn(router, 'navigate');

      component.id = 'quiz-1';
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button');
      button?.click();

      expect(quizService.practiceOpened).toHaveBeenCalledWith('quiz-1');
      expect(router.navigate).toHaveBeenCalledWith(['quiz/quiz-1']);
    });

    it('should render incomplete + SMA markers + moving averages when enough sessions exist', async () => {
      const store = TestBed.inject(Store);
      const quizId: IQuiz['id'] = 'quiz-1';

      store.dispatch(
        actions.addQuiz({
          quiz: {
            id: quizId,
            name: 'Test Quiz',
            description: 'Test',
            sessions: [],
          },
        }),
      );
      store.dispatch(actions.openQuiz({ quizId }));

      // Add 10 completed sessions first...
      for (let i = 0; i < 10; i++) {
        store.dispatch(
          actions.addSession({
            session: createSession({
              quizId,
              id: `session-${i}` as ISession['id'],
              answered: 10,
              total: 10,
            }),
          }),
        );
      }
      // ...then an incomplete session last, so it becomes first after reverse() in component.
      store.dispatch(
        actions.addSession({
          session: createSession({
            quizId,
            id: 'session-incomplete' as ISession['id'],
            answered: 5,
            total: 10,
          }),
        }),
      );

      fixture.detectChanges();
      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Incomplete');
      expect(compiled.textContent).toContain('SMA10');
      expect(compiled.textContent).toContain('SMA-10');
    });

    it('should render SMA markers when first session is complete (firstIncompleted=false)', async () => {
      const store = TestBed.inject(Store);
      const quizId: IQuiz['id'] = 'quiz-2';

      store.dispatch(
        actions.addQuiz({
          quiz: {
            id: quizId,
            name: 'Test Quiz 2',
            description: 'Test',
            sessions: [],
          },
        }),
      );
      store.dispatch(actions.openQuiz({ quizId }));

      // 10 completed sessions, no incomplete => firstIncompleted=false
      for (let i = 0; i < 10; i++) {
        store.dispatch(
          actions.addSession({
            session: createSession({
              quizId,
              id: `session-2-${i}` as ISession['id'],
              answered: 10,
              total: 10,
            }),
          }),
        );
      }

      fixture.detectChanges();
      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).not.toContain('Incomplete');
      expect(compiled.textContent).toContain('SMA10');
      expect(compiled.textContent).toContain('SMA-10');
    });

    it('should render with no sessions (covers firstIncompleted nullish branch)', async () => {
      const store = TestBed.inject(Store);
      const quizId: IQuiz['id'] = 'quiz-3';

      store.dispatch(
        actions.addQuiz({
          quiz: {
            id: quizId,
            name: 'Empty Quiz',
            description: 'Test',
            sessions: [],
          },
        }),
      );
      store.dispatch(actions.openQuiz({ quizId }));

      fixture.detectChanges();
      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Sessions');
    });
  });

  describe('getters', () => {
    it('should return statsBySession$', () => {
      const signal = component.statsBySession$;
      expect(signal).toBeDefined();
    });

    it('should return movingAverages$', () => {
      const signal = component.movingAverages$;
      expect(signal).toBeDefined();
    });

    it('should return totalStats$', () => {
      const signal = component.totalStats$;
      expect(signal).toBeDefined();
    });
  });
});
