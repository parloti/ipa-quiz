import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatRadioChange } from '@angular/material/radio';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IQuestion } from '../models/iquestion';
import { IQuiz } from '../models/iquiz';
import { ISession } from '../models/isession';
import { IVowel } from '../models/ivowel';
import { QuestionElement } from '../models/question-element';
import { QuizService } from '../services/quiz.service';
import { VOWELS } from '../vowels';
import { QuizComponent } from './quiz.component';

describe('QuizComponent', () => {
  let component: QuizComponent;
  let fixture: ComponentFixture<QuizComponent>;
  let mockQuizService: {
    finished$: BehaviorSubject<boolean | undefined>;
    openedQuiz$: BehaviorSubject<IQuiz | undefined>;
    currentQuestionIndex$: BehaviorSubject<number | undefined>;
    question$: BehaviorSubject<IQuestion | undefined>;
    session$: BehaviorSubject<ISession | undefined>;
    selectedAnswer$: BehaviorSubject<IVowel['id'] | undefined>;
    answered$: BehaviorSubject<boolean | undefined>;
    questionsLength$: BehaviorSubject<number | undefined>;
    next: ReturnType<typeof vi.fn>;
    answerCurrent: ReturnType<typeof vi.fn>;
    goToNewSession: ReturnType<typeof vi.fn>;
    selectAnswer: ReturnType<typeof vi.fn>;
    previousQuestion: ReturnType<typeof vi.fn>;
  };

  const testVowel = VOWELS[0];
  const testVowel2 = VOWELS[1];

  const createTestQuiz = (): IQuiz => ({
    id: 'quiz-1',
    name: 'Test Quiz',
    description: 'A test quiz',
    sessions: [],
  });

  const createTestQuestion = (
    type: QuestionElement = QuestionElement.Letter,
  ): IQuestion => ({
    vowel: testVowel,
    type,
    index: 0,
    options: [
      { ...testVowel, type: QuestionElement.Name },
      { ...testVowel2, type: QuestionElement.Name },
    ],
    selectedAnswer: undefined,
    answered: false,
  });

  const createTestSession = (): ISession => ({
    id: 'session-1',
    quizId: 'quiz-1',
    questions: [createTestQuestion()],
    creationDate: new Date().toISOString(),
    currentQuestionIndex: 0,
  });

  beforeEach(async () => {
    mockQuizService = {
      finished$: new BehaviorSubject<boolean | undefined>(false),
      openedQuiz$: new BehaviorSubject<IQuiz | undefined>(createTestQuiz()),
      currentQuestionIndex$: new BehaviorSubject<number | undefined>(0),
      question$: new BehaviorSubject<IQuestion | undefined>(
        createTestQuestion(),
      ),
      session$: new BehaviorSubject<ISession | undefined>(createTestSession()),
      selectedAnswer$: new BehaviorSubject<IVowel['id'] | undefined>(undefined),
      answered$: new BehaviorSubject<boolean | undefined>(false),
      questionsLength$: new BehaviorSubject<number | undefined>(5),
      next: vi.fn(),
      answerCurrent: vi.fn(),
      goToNewSession: vi.fn(),
      selectAnswer: vi.fn(),
      previousQuestion: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [QuizComponent, NoopAnimationsModule],
      providers: [{ provide: QuizService, useValue: mockQuizService }],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('signal getters', () => {
    it('should expose selectedAnswer$ signal', () => {
      expect(component.selectedAnswer$).toBeDefined();
      expect(component.selectedAnswer$()).toBeUndefined();

      mockQuizService.selectedAnswer$.next(testVowel.id);
      expect(component.selectedAnswer$()).toBe(testVowel.id);
    });

    it('should expose session$ signal', () => {
      expect(component.session$).toBeDefined();
      expect(component.session$()).toBeDefined();
      expect(component.session$()?.id).toBe('session-1');
    });

    it('should expose finished$ signal', () => {
      expect(component.finished$).toBeDefined();
      expect(component.finished$()).toBe(false);

      mockQuizService.finished$.next(true);
      expect(component.finished$()).toBe(true);
    });

    it('should expose quiz$ signal', () => {
      expect(component.quiz$).toBeDefined();
      expect(component.quiz$()?.name).toBe('Test Quiz');
    });

    it('should expose index$ signal', () => {
      expect(component.index$).toBeDefined();
      expect(component.index$()).toBe(0);

      mockQuizService.currentQuestionIndex$.next(2);
      expect(component.index$()).toBe(2);
    });

    it('should expose question$ signal', () => {
      expect(component.question$).toBeDefined();
      expect(component.question$()?.vowel).toBe(testVowel);
    });

    it('should expose answered$ signal', () => {
      expect(component.answered$).toBeDefined();
      expect(component.answered$()).toBe(false);

      mockQuizService.answered$.next(true);
      expect(component.answered$()).toBe(true);
    });

    it('should expose questionsLength$ signal', () => {
      expect(component.questionsLength$).toBeDefined();
      expect(component.questionsLength$()).toBe(5);
    });

    it('should expose questionElement getter', () => {
      expect(component.questionElement).toBe(QuestionElement);
    });

    it('should expose vowels getter', () => {
      expect(component.vowels).toBe(VOWELS);
    });
  });

  describe('service method calls', () => {
    it('should call quizService.next() when next() is called', () => {
      component.next();
      expect(mockQuizService.next).toHaveBeenCalledOnce();
    });

    it('should call quizService.answerCurrent() when verify() is called', () => {
      component.verify();
      expect(mockQuizService.answerCurrent).toHaveBeenCalledOnce();
    });

    it('should call quizService.goToNewSession() when newSession() is called', () => {
      component.newSession();
      expect(mockQuizService.goToNewSession).toHaveBeenCalledOnce();
    });

    it('should call quizService.previousQuestion() when previous() is called', () => {
      component.previous();
      expect(mockQuizService.previousQuestion).toHaveBeenCalledOnce();
    });

    it('should call quizService.selectAnswer() with correct value when selectAnswer() is called', () => {
      const mockEvent = { value: testVowel.id } as MatRadioChange;
      component.selectAnswer(mockEvent);
      expect(mockQuizService.selectAnswer).toHaveBeenCalledWith(testVowel.id);
    });
  });

  describe('template rendering', () => {
    it('should display quiz name', () => {
      const h1 = fixture.nativeElement.querySelector('h1');
      expect(h1.textContent).toContain('Test Quiz');
    });

    it('should display question number', () => {
      const questionText = fixture.nativeElement.querySelector('p');
      expect(questionText.textContent).toContain('Question 1');
    });

    it('should display vowel letter for Letter type questions', () => {
      mockQuizService.question$.next(
        createTestQuestion(QuestionElement.Letter),
      );
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain(testVowel.letter);
    });

    it('should display vowel name for Name type questions', () => {
      mockQuizService.question$.next(createTestQuestion(QuestionElement.Name));
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain(testVowel.name);
    });

    it('should display audio button for Sound type questions', () => {
      const playSpy = vi
        .spyOn(HTMLMediaElement.prototype, 'play')
        .mockImplementation(async () => undefined);

      mockQuizService.question$.next(createTestQuestion(QuestionElement.Sound));
      fixture.detectChanges();

      const audioButton = fixture.nativeElement.querySelector(
        'button[mat-icon-button]',
      );
      expect(audioButton).toBeTruthy();

      audioButton.click();
      expect(playSpy).toHaveBeenCalled();
    });

    it('should render error block for unknown question type', () => {
      mockQuizService.question$.next({
        ...createTestQuestion(QuestionElement.Letter),
        type: 999 as unknown as QuestionElement,
      });
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('ERROR:');
    });

    it('should render safely when question is undefined (optional chaining)', () => {
      mockQuizService.question$.next(undefined);
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('ERROR:');
    });

    it('should render and play audio for Sound-type option', () => {
      const playSpy = vi
        .spyOn(HTMLMediaElement.prototype, 'play')
        .mockImplementation(async () => undefined);

      const question = {
        ...createTestQuestion(QuestionElement.Name),
        options: [
          { ...testVowel, type: QuestionElement.Sound },
          { ...testVowel2, type: QuestionElement.Name },
        ],
      } satisfies IQuestion;

      mockQuizService.question$.next(question);
      fixture.detectChanges();

      const optionAudioButton = fixture.nativeElement.querySelector(
        'mat-radio-button button[mat-icon-button]',
      ) as HTMLButtonElement | null;
      expect(optionAudioButton).toBeTruthy();

      optionAudioButton?.click();
      expect(playSpy).toHaveBeenCalled();
    });

    it('should render error text for unknown option type', () => {
      const question = {
        ...createTestQuestion(QuestionElement.Name),
        options: [
          {
            ...testVowel,
            type: 999 as unknown as QuestionElement,
          },
        ],
      } satisfies IQuestion;

      mockQuizService.question$.next(question);
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('ERROR');
    });

    it('should render radio buttons for options', () => {
      fixture.detectChanges();

      const radioButtons =
        fixture.nativeElement.querySelectorAll('mat-radio-button');
      expect(radioButtons.length).toBe(2);
    });

    it('should call selectAnswer when mat-radio-group emits change', () => {
      const radioGroup = fixture.debugElement.query(By.css('mat-radio-group'));

      radioGroup.triggerEventHandler('change', {
        value: testVowel.id,
      } as MatRadioChange);

      expect(mockQuizService.selectAnswer).toHaveBeenCalledWith(testVowel.id);
    });

    it('should disable radio buttons when answered', () => {
      mockQuizService.answered$.next(true);
      fixture.detectChanges();

      const radioButtons =
        fixture.nativeElement.querySelectorAll('mat-radio-button');
      radioButtons.forEach((btn: HTMLElement) => {
        expect(btn.classList.contains('mat-mdc-radio-disabled')).toBe(true);
      });
    });
  });

  describe('button states', () => {
    it('should disable Previous button when index is 0', () => {
      mockQuizService.currentQuestionIndex$.next(0);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button');
      const previousButton = Array.from(buttons).find((btn: unknown) =>
        (btn as HTMLElement).textContent?.includes('Previous'),
      ) as HTMLButtonElement;
      expect(previousButton.disabled).toBe(true);
    });

    it('should enable Previous button when index > 0', () => {
      mockQuizService.currentQuestionIndex$.next(1);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button');
      const previousButton = Array.from(buttons).find((btn: unknown) =>
        (btn as HTMLElement).textContent?.includes('Previous'),
      ) as HTMLButtonElement;
      expect(previousButton.disabled).toBe(false);
    });

    it('should show Verify button when not answered', () => {
      mockQuizService.answered$.next(false);
      mockQuizService.selectedAnswer$.next(testVowel.id);
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Verify');
    });

    it('should show Next button when answered', () => {
      mockQuizService.answered$.next(true);
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Next');
    });

    it('should disable Verify button when no answer selected', () => {
      mockQuizService.selectedAnswer$.next(undefined);
      mockQuizService.answered$.next(false);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button');
      const verifyButton = Array.from(buttons).find((btn: unknown) =>
        (btn as HTMLElement).textContent?.includes('Verify'),
      ) as HTMLButtonElement;
      expect(verifyButton.disabled).toBe(true);
    });

    it('should enable Verify button when answer is selected', () => {
      mockQuizService.selectedAnswer$.next(testVowel.id);
      mockQuizService.answered$.next(false);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button');
      const verifyButton = Array.from(buttons).find((btn: unknown) =>
        (btn as HTMLElement).textContent?.includes('Verify'),
      ) as HTMLButtonElement;
      expect(verifyButton.disabled).toBe(false);
    });

    it('should disable Next button on last question when answered', () => {
      mockQuizService.answered$.next(true);
      mockQuizService.currentQuestionIndex$.next(4);
      mockQuizService.questionsLength$.next(5);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button');
      const nextButton = Array.from(buttons).find((btn: unknown) =>
        (btn as HTMLElement).textContent?.includes('Next'),
      ) as HTMLButtonElement;
      expect(nextButton.disabled).toBe(true);
    });

    it('should show New Session button when finished', () => {
      mockQuizService.finished$.next(true);
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('New Session');
    });

    it('should not show Verify/Next button when finished', () => {
      mockQuizService.finished$.next(true);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button');
      const verifyNextButton = Array.from(buttons).find(
        (btn: unknown) =>
          (btn as HTMLElement).textContent?.includes('Verify') ||
          (btn as HTMLElement).textContent?.includes('Next'),
      );
      expect(verifyNextButton).toBeFalsy();
    });
  });

  describe('answer styling', () => {
    it('should apply border-success to correct answer when answered', () => {
      mockQuizService.answered$.next(true);
      mockQuizService.selectedAnswer$.next(testVowel.id);
      fixture.detectChanges();

      const radioButtons =
        fixture.nativeElement.querySelectorAll('mat-radio-button');
      const correctButton = radioButtons[0];
      expect(correctButton.classList.contains('border-success')).toBe(true);
    });

    it('should apply border-danger to wrong selected answer', () => {
      mockQuizService.answered$.next(true);
      mockQuizService.selectedAnswer$.next(testVowel2.id);
      fixture.detectChanges();

      const radioButtons =
        fixture.nativeElement.querySelectorAll('mat-radio-button');
      const wrongButton = radioButtons[1];
      expect(wrongButton.classList.contains('border-danger')).toBe(true);
    });
  });

  describe('button click handlers', () => {
    it('should call next() when Next button is clicked', () => {
      mockQuizService.answered$.next(true);
      mockQuizService.selectedAnswer$.next(testVowel.id);
      mockQuizService.currentQuestionIndex$.next(0);
      mockQuizService.questionsLength$.next(5);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button');
      const nextButton = Array.from(buttons).find((btn: unknown) =>
        (btn as HTMLElement).textContent?.includes('Next'),
      ) as HTMLButtonElement;
      nextButton.click();

      expect(mockQuizService.next).toHaveBeenCalledOnce();
    });

    it('should call verify() when Verify button is clicked', () => {
      mockQuizService.answered$.next(false);
      mockQuizService.selectedAnswer$.next(testVowel.id);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button');
      const verifyButton = Array.from(buttons).find((btn: unknown) =>
        (btn as HTMLElement).textContent?.includes('Verify'),
      ) as HTMLButtonElement;
      verifyButton.click();

      expect(mockQuizService.answerCurrent).toHaveBeenCalledOnce();
    });

    it('should call previous() when Previous button is clicked', () => {
      mockQuizService.currentQuestionIndex$.next(1);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button');
      const previousButton = Array.from(buttons).find((btn: unknown) =>
        (btn as HTMLElement).textContent?.includes('Previous'),
      ) as HTMLButtonElement;
      previousButton.click();

      expect(mockQuizService.previousQuestion).toHaveBeenCalledOnce();
    });

    it('should call newSession() when New Session button is clicked', () => {
      mockQuizService.finished$.next(true);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button');
      const newSessionButton = Array.from(buttons).find((btn: unknown) =>
        (btn as HTMLElement).textContent?.includes('New Session'),
      ) as HTMLButtonElement;
      newSessionButton.click();

      expect(mockQuizService.goToNewSession).toHaveBeenCalledOnce();
    });
  });

  describe('ChartComponent integration', () => {
    it('should render ChartComponent', () => {
      const chart = fixture.nativeElement.querySelector('app-chart');
      expect(chart).toBeTruthy();
    });
  });

  describe('option types rendering', () => {
    it('should render Letter type options correctly', () => {
      const question = createTestQuestion();
      question.options = [
        { ...testVowel, type: QuestionElement.Letter },
        { ...testVowel2, type: QuestionElement.Letter },
      ];
      mockQuizService.question$.next(question);
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain(testVowel.letter);
      expect(content).toContain(testVowel2.letter);
    });

    it('should render Name type options correctly', () => {
      const question = createTestQuestion();
      question.options = [
        { ...testVowel, type: QuestionElement.Name },
        { ...testVowel2, type: QuestionElement.Name },
      ];
      mockQuizService.question$.next(question);
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain(testVowel.name);
      expect(content).toContain(testVowel2.name);
    });

    it('should render Sound type options with audio buttons', () => {
      const question = createTestQuestion();
      question.options = [
        { ...testVowel, type: QuestionElement.Sound },
        { ...testVowel2, type: QuestionElement.Sound },
      ];
      mockQuizService.question$.next(question);
      fixture.detectChanges();

      const audioElements = fixture.nativeElement.querySelectorAll('audio');
      expect(audioElements.length).toBeGreaterThanOrEqual(2);
    });

    it('should render ERROR for unknown option type', () => {
      const question = createTestQuestion();
      question.options = [
        { ...testVowel, type: 'unknown' as unknown as QuestionElement },
      ];
      mockQuizService.question$.next(question);
      fixture.detectChanges();

      const radioButtons =
        fixture.nativeElement.querySelectorAll('mat-radio-button');
      expect(radioButtons[0].textContent).toContain('ERROR');
    });

    it('should render ERROR for unknown question type', () => {
      const question = createTestQuestion();
      question.type = 'unknown' as unknown as QuestionElement;
      mockQuizService.question$.next(question);
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('ERROR');
    });
  });

  describe('edge cases', () => {
    it('should handle undefined quiz gracefully', () => {
      mockQuizService.openedQuiz$.next(undefined);
      fixture.detectChanges();

      expect(component.quiz$()).toBeUndefined();
    });

    it('should handle undefined question gracefully', () => {
      mockQuizService.question$.next(undefined);
      fixture.detectChanges();

      expect(component.question$()).toBeUndefined();
    });

    it('should handle undefined index gracefully', () => {
      mockQuizService.currentQuestionIndex$.next(undefined);
      fixture.detectChanges();

      const questionText = fixture.nativeElement.querySelector('p');
      expect(questionText.textContent).toContain('Question 1');
    });

    it('should handle undefined questionsLength gracefully', () => {
      mockQuizService.questionsLength$.next(undefined);
      mockQuizService.answered$.next(true);
      mockQuizService.currentQuestionIndex$.next(0);
      fixture.detectChanges();

      // Should not throw and Next button should work
      const buttons = fixture.nativeElement.querySelectorAll('button');
      const nextButton = Array.from(buttons).find((btn: unknown) =>
        (btn as HTMLElement).textContent?.includes('Next'),
      );
      expect(nextButton).toBeTruthy();
    });
  });
});
