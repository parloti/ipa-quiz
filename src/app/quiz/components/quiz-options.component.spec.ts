import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatRadioChange } from '@angular/material/radio';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IQuestion } from '../../models/iquestion';
import { IVowel, IVowelID } from '../../models/ivowel';
import { QuestionElement } from '../../models/question-element';
import { QuizOptionsComponent } from './quiz-options.component';

describe('QuizOptionsComponent', () => {
  let fixture: ComponentFixture<QuizOptionsComponent>;

  const baseVowel: IVowel = {
    id: 'vowel-1',
    letter: 'i',
    name: 'Close front unrounded vowel',
    symbol: { unicodes: ['0069'], names: ['LATIN SMALL LETTER I'] },
    placement: 'Front',
    shape: 'Close',
    constriction: 'Unrounded',
  } as unknown as IVowel;

  const otherVowel: IVowel = {
    ...baseVowel,
    id: 'vowel-2',
    letter: 'y',
    name: 'Close front rounded vowel',
  } as unknown as IVowel;

  const makeQuestion = (
    optionsArr: Array<IVowel & { type: QuestionElement }>,
  ): IQuestion => {
    const options: Record<IVowelID, IVowel & { type: QuestionElement }> =
      {} as any;
    for (const opt of optionsArr) {
      options[opt.id] = opt;
    }
    return {
      vowel: baseVowel,
      type: QuestionElement.Letter,
      index: 0,
      options,
      selectedAnswer: undefined,
      answered: false,
    } as IQuestion;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizOptionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizOptionsComponent);
  });

  it('renders Letter and Name option branches', () => {
    const question = makeQuestion([
      { ...baseVowel, type: QuestionElement.Letter },
      { ...otherVowel, type: QuestionElement.Name },
    ]);

    fixture.componentRef.setInput('question', question);
    fixture.componentRef.setInput('selectedAnswer', undefined);
    fixture.componentRef.setInput('answered', false);
    fixture.detectChanges();

    expect(fixture.componentInstance.question$()).toEqual(question);
    expect(fixture.componentInstance.questionElement).toBe(QuestionElement);
    expect(fixture.componentInstance.selectedAnswer$()).toBeUndefined();
    expect(fixture.componentInstance.answered$()).toBe(false);

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain(baseVowel.letter);
    expect(text).toContain(otherVowel.name);
  });

  it('renders Sound option branch, shows logo when available, and emits play', () => {
    const playSpy = vi.fn();

    const soundOption = {
      ...baseVowel,
      type: QuestionElement.Sound,
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
    } as IVowel & { type: QuestionElement; soundIndex: number };

    const question = makeQuestion([soundOption]);
    fixture.componentRef.setInput('question', question);
    fixture.componentRef.setInput('selectedAnswer', undefined);
    fixture.componentRef.setInput('answered', false);
    fixture.detectChanges();

    expect(fixture.componentInstance.question$()).toEqual(question);
    expect(fixture.componentInstance.questionElement).toBe(QuestionElement);
    expect(fixture.componentInstance.selectedAnswer$()).toBeUndefined();
    expect(fixture.componentInstance.answered$()).toBe(false);

    fixture.componentInstance.playSound$.subscribe(playSpy);

    const playButton = fixture.debugElement.query(By.css('button'));
    expect(playButton).toBeTruthy();

    // The component emits `playSound$` when the audio element finishes
    // playing (audio 'ended' event). Simulate that instead of relying on
    // click handling which may be asynchronous in the test environment.
    const audioEl = fixture.debugElement.query(By.css('audio'));
    if (audioEl) {
      audioEl.nativeElement.dispatchEvent(new Event('ended'));
    } else {
      // Fallback: click the button if no audio element is present
      playButton.nativeElement.click();
    }

    expect(playSpy).toHaveBeenCalledTimes(1);

    const img = fixture.debugElement.query(By.css('img'));
    expect(img).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('jill_house');
  });

  it('renders Sound option without sounds array shows ERROR', () => {
    const soundOption = {
      ...baseVowel,
      type: QuestionElement.Sound,
    } as IVowel & { type: QuestionElement };

    const question = makeQuestion([soundOption]);
    fixture.componentRef.setInput('question', question);
    fixture.componentRef.setInput('selectedAnswer', undefined);
    fixture.componentRef.setInput('answered', false);
    fixture.detectChanges();

    expect(fixture.componentInstance.question$()).toEqual(question);
    expect(fixture.componentInstance.questionElement).toBe(QuestionElement);
    expect(fixture.componentInstance.selectedAnswer$()).toBeUndefined();
    expect(fixture.componentInstance.answered$()).toBe(false);

    expect(fixture.nativeElement.textContent).toContain('ERROR');
  });

  it('emits selectAnswer when mat-radio-group changes', () => {
    const selectSpy = vi.fn();

    const question = makeQuestion([
      { ...baseVowel, type: QuestionElement.Letter },
      { ...otherVowel, type: QuestionElement.Letter },
    ]);
    fixture.componentRef.setInput('question', question);
    fixture.componentRef.setInput('selectedAnswer', undefined);
    fixture.componentRef.setInput('answered', false);
    fixture.detectChanges();

    expect(fixture.componentInstance.question$()).toEqual(question);

    fixture.componentInstance.selectAnswer$.subscribe(selectSpy);

    fixture.debugElement
      .query(By.css('mat-radio-group'))
      .triggerEventHandler(
        'change',
        new MatRadioChange(undefined as any, baseVowel.id),
      );

    expect(selectSpy).toHaveBeenCalledTimes(1);
  });

  it('renders ERROR branch for unknown option type', () => {
    const question = makeQuestion([
      { ...baseVowel, type: 999 as unknown as QuestionElement },
    ]);

    fixture.componentRef.setInput('question', question);
    fixture.componentRef.setInput('selectedAnswer', undefined);
    fixture.componentRef.setInput('answered', false);
    fixture.detectChanges();

    expect(fixture.componentInstance.question$()).toEqual(question);
    expect(fixture.componentInstance.questionElement).toBe(QuestionElement);
    expect(fixture.componentInstance.selectedAnswer$()).toBeUndefined();
    expect(fixture.componentInstance.answered$()).toBe(false);

    expect(fixture.nativeElement.textContent).toContain('ERROR');
  });
});
