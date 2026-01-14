import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IQuestion } from '../../../models/iquestion';
import { IVowel } from '../../../models/ivowel';
import { QuestionElement } from '../../../models/question-element';
import { QuizPromptComponent } from '../quiz-prompt.component';

describe('QuizPromptComponent', () => {
  let fixture: ComponentFixture<QuizPromptComponent>;

  const baseVowel: IVowel = {
    id: 'vowel-1',
    letter: 'i',
    name: 'Close front unrounded vowel',
    symbol: { unicodes: ['0069'], names: ['LATIN SMALL LETTER I'] },
    placement: 'Front',
    shape: 'Close',
    constriction: 'Unrounded',
  } as unknown as IVowel;

  const makeQuestion = (
    type: QuestionElement,
    vowelOverrides?: Partial<IVowel>,
  ): IQuestion =>
    ({
      vowel: { ...baseVowel, ...(vowelOverrides ?? {}) },
      type,
      index: 0,
      options: {},
      selectedAnswer: undefined,
      answered: false,
    }) as IQuestion;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizPromptComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizPromptComponent);
  });

  it('renders letter prompt', () => {
    const question = makeQuestion(QuestionElement.Letter);
    fixture.componentRef.setInput('question', question);
    fixture.detectChanges();

    expect(fixture.componentInstance.question$()).toEqual(question);

    expect(fixture.nativeElement.textContent).toContain(baseVowel.letter);
  });

  it('renders name prompt', () => {
    const question = makeQuestion(QuestionElement.Name);
    fixture.componentRef.setInput('question', question);
    fixture.detectChanges();

    expect(fixture.componentInstance.question$()).toEqual(question);

    expect(fixture.nativeElement.textContent).toContain(baseVowel.name);
  });

  it('renders sound prompt, shows logo when available, and emits play', () => {
    const playSpy = vi.fn();

    const question = makeQuestion(QuestionElement.Sound, {
      soundIndex: 0,
      sounds: [
        {
          url: '/sounds/ipa/jill_house/0069.mp3',
          sourceId: 'ipa',
          voiceId: 'jill_house',
          logoUrl: '/sounds/ipa/logo.png',
          author: 'jill_house',
        },
      ],
    } as Partial<IVowel & { soundIndex: number }>);
    fixture.componentRef.setInput('question', question);
    fixture.detectChanges();

    expect(fixture.componentInstance.question$()).toEqual(question);

    fixture.componentInstance.playSound$.subscribe(playSpy);

    const playButton = fixture.debugElement.query(By.css('button'));
    expect(playButton).toBeTruthy();

    playButton.nativeElement.click();

    expect(playSpy).toHaveBeenCalledTimes(1);

    const img = fixture.debugElement.query(By.css('img'));
    expect(img).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('jill_house');
  });

  it('renders ERROR block when no sounds array for Sound question', () => {
    const question = makeQuestion(QuestionElement.Sound);
    fixture.componentRef.setInput('question', question);
    fixture.detectChanges();

    expect(fixture.componentInstance.question$()).toEqual(question);

    expect(fixture.nativeElement.textContent).toContain('ERROR');
  });

  it('renders ERROR block for unknown question type', () => {
    const question = makeQuestion(999 as unknown as QuestionElement);
    fixture.componentRef.setInput('question', question);
    fixture.detectChanges();

    expect(fixture.componentInstance.question$()).toEqual(question);

    expect(fixture.nativeElement.textContent).toContain('ERROR');
  });
});
