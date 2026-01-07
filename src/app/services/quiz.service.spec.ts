import { TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { quizFeature } from '../state/quiz-feature';

import { QuizService } from './quiz.service';

describe('QuizService', () => {
  let service: QuizService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({ quiz: quizFeature.reducer })],
    });
    service = TestBed.inject(QuizService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    // Access getters to cover them
    expect(service.quizzes$).toBeDefined();
    expect(service.finished$).toBeDefined();
    expect(service.openedQuiz$).toBeDefined();
    expect(service.session$).toBeDefined();
    expect(service.questions$).toBeDefined();
    expect(service.question$).toBeDefined();
    expect(service.currentQuestionIndex$).toBeDefined();
    expect(service.answered$).toBeDefined();
    expect(service.selectedAnswer$).toBeDefined();
    expect(service.questionsLength$).toBeDefined();
    expect(service.movingAverages$).toBeDefined();
    expect(service.statsBySession$).toBeDefined();
    expect(service.totalStats$).toBeDefined();
    expect(service.state$).toBeDefined();
  });

  describe('methods', () => {
    let store: Store;

    beforeEach(() => {
      store = TestBed.inject(Store);
      vi.spyOn(store, 'dispatch');
    });

    it('should dispatch practiceOpened', () => {
      service.practiceOpened('quiz-1');
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: '[Quiz] Practice Opened' }),
      );
    });

    it('should dispatch goBack', () => {
      service.goBack();
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: '[Quiz] Go back' }),
      );
    });

    it('should dispatch goToNewSession', () => {
      service.goToNewSession();
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: '[Quiz] Go To New Session' }),
      );
    });

    it('should dispatch previousQuestion', () => {
      service.previousQuestion();
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: '[Quiz] Previous Question' }),
      );
    });

    it('should dispatch next', () => {
      service.next();
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: '[Quiz] Next Question' }),
      );
    });

    it('should dispatch answerCurrent', () => {
      service.answerCurrent();
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: '[Quiz] Answer Current' }),
      );
    });

    it('should dispatch openQuiz', () => {
      service.openQuiz('quiz-1');
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: '[Quiz] Open Quiz' }),
      );
    });

    it('should dispatch selectAnswer', () => {
      service.selectAnswer('vowel-1');
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: '[Quiz] Select Answer' }),
      );
    });
  });
});
