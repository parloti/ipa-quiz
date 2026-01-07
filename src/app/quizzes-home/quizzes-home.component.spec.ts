import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IQuiz } from '../models/iquiz';
import { QuizService } from '../services/quiz.service';
import { actions } from '../state/actions';
import { quizFeature } from '../state/quiz-feature';

import { QuizzesHomeComponent } from './quizzes-home.component';

describe('QuizzesHomeComponent', () => {
  let component: QuizzesHomeComponent;
  let fixture: ComponentFixture<QuizzesHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        QuizzesHomeComponent,
        StoreModule.forRoot({ quiz: quizFeature.reducer }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizzesHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('selectQuiz', () => {
    it('should call quizService.openQuiz when a quiz is selected', () => {
      const quizService = TestBed.inject(QuizService);
      vi.spyOn(quizService, 'openQuiz');

      const quiz: IQuiz = {
        id: 'quiz-1',
        name: 'Test Quiz',
        description: 'Test',
        sessions: [],
      };
      component.selectQuiz(quiz);

      expect(quizService.openQuiz).toHaveBeenCalledWith('quiz-1');
    });

    it('should call selectQuiz when list item is clicked', async () => {
      const store = TestBed.inject(Store);
      const quizService = TestBed.inject(QuizService);
      vi.spyOn(quizService, 'openQuiz');

      // Add a quiz to the store
      const quiz: IQuiz = {
        id: 'quiz-1',
        name: 'Quiz 1',
        description: 'Test Description',
        sessions: [],
      };
      store.dispatch(actions.addQuiz({ quiz }));

      fixture.detectChanges();
      await fixture.whenStable();

      const listItem = fixture.nativeElement.querySelector('li');
      listItem?.click();

      expect(quizService.openQuiz).toHaveBeenCalledWith('quiz-1');
    });
  });

  describe('quizzes$ getter', () => {
    it('should return quizzes signal', () => {
      const signal = component.quizzes$;
      expect(signal).toBeDefined();
    });
  });

  describe('template rendering', () => {
    it('should display quizzes when available', async () => {
      const store = TestBed.inject(Store);

      const quiz: IQuiz = {
        id: 'quiz-1',
        name: 'Quiz 1',
        description: 'Test Description',
        sessions: [],
      };
      store.dispatch(actions.addQuiz({ quiz }));

      fixture.detectChanges();
      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Quiz 1');
      expect(compiled.textContent).toContain('Test Description');
    });
  });
});
