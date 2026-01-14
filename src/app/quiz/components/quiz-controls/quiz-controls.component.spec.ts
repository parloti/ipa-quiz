import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { QuizControlsComponent } from '../quiz-controls.component';

describe('QuizControlsComponent', () => {
  let fixture: ComponentFixture<QuizControlsComponent>;
  let component: QuizControlsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizControlsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizControlsComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('index', 0);
    fixture.componentRef.setInput('selectedAnswer', undefined);
    fixture.componentRef.setInput('answered', false);
    fixture.componentRef.setInput('finished', false);
    fixture.componentRef.setInput('questionsLength', 5);

    fixture.detectChanges();

    // Explicit reads help V8 attribute execution to InputSignal initializers.
    expect(component.index$()).toBe(0);
    expect(component.selectedAnswer$()).toBeUndefined();
    expect(component.answered$()).toBe(false);
    expect(component.finished$()).toBe(false);
    expect(component.questionsLength$()).toBe(5);
  });

  it('renders Previous and disables it when index is 0', () => {
    const previousButton = fixture.debugElement.queryAll(By.css('button'))[0];
    expect(previousButton.nativeElement.textContent).toContain('Previous');
    expect(previousButton.nativeElement.disabled).toBe(true);
  });

  it('emits previous when Previous is clicked', () => {
    const spy = vi.fn();
    component.previous$.subscribe(spy);

    fixture.componentRef.setInput('index', 1);
    fixture.detectChanges();

    expect(component.index$()).toBe(1);

    const previousButton = fixture.debugElement.queryAll(By.css('button'))[0];
    previousButton.nativeElement.click();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('shows Verify when not answered and emits verify on click', () => {
    const verifySpy = vi.fn();
    component.verify$.subscribe(verifySpy);

    fixture.componentRef.setInput('selectedAnswer', 'vowel-1');
    fixture.componentRef.setInput('answered', false);
    fixture.componentRef.setInput('finished', false);
    fixture.detectChanges();

    expect(component.selectedAnswer$()).toBe('vowel-1');
    expect(component.answered$()).toBe(false);
    expect(component.finished$()).toBe(false);

    const buttons = fixture.debugElement.queryAll(By.css('button'));
    const verifyButton = buttons.find(btn =>
      String(btn.nativeElement.textContent).includes('Verify'),
    );

    expect(verifyButton).toBeTruthy();
    expect(verifyButton!.nativeElement.disabled).toBe(false);
    verifyButton!.nativeElement.click();
    expect(verifySpy).toHaveBeenCalledTimes(1);
  });

  it('disables Verify when answered', () => {
    fixture.componentRef.setInput('selectedAnswer', 'vowel-1');
    fixture.componentRef.setInput('answered', true);
    fixture.componentRef.setInput('finished', false);
    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.css('button'));
    const nextButton = buttons.find(btn =>
      String(btn.nativeElement.textContent).includes('Next'),
    );

    expect(nextButton).toBeTruthy();
    expect(nextButton!.nativeElement.disabled).toBe(false);
  });

  it('enables Next when answered and emits next on click', () => {
    const nextSpy = vi.fn();
    component.next$.subscribe(nextSpy);

    fixture.componentRef.setInput('selectedAnswer', 'vowel-1');
    fixture.componentRef.setInput('answered', true);
    fixture.componentRef.setInput('finished', false);
    fixture.detectChanges();

    expect(component.selectedAnswer$()).toBe('vowel-1');
    expect(component.answered$()).toBe(true);
    expect(component.finished$()).toBe(false);

    const buttons = fixture.debugElement.queryAll(By.css('button'));
    const nextButton = buttons.find(btn =>
      String(btn.nativeElement.textContent).includes('Next'),
    );

    expect(nextButton).toBeTruthy();
    expect(nextButton!.nativeElement.disabled).toBe(false);
    nextButton!.nativeElement.click();
    expect(nextSpy).toHaveBeenCalledTimes(1);
  });

  it('disables Next when not answered', () => {
    fixture.componentRef.setInput('selectedAnswer', 'vowel-1');
    fixture.componentRef.setInput('answered', false);
    fixture.componentRef.setInput('finished', false);
    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.css('button'));
    const verifyButton = buttons.find(btn =>
      String(btn.nativeElement.textContent).includes('Verify'),
    );

    expect(verifyButton).toBeTruthy();
    expect(verifyButton!.nativeElement.disabled).toBe(false);
  });

  it('disables Next on last question when answered', () => {
    fixture.componentRef.setInput('selectedAnswer', 'vowel-1');
    fixture.componentRef.setInput('answered', true);
    fixture.componentRef.setInput('finished', false);
    fixture.componentRef.setInput('index', 4);
    fixture.componentRef.setInput('questionsLength', 5);
    fixture.detectChanges();

    expect(component.index$()).toBe(4);
    expect(component.questionsLength$()).toBe(5);

    const buttons = fixture.debugElement.queryAll(By.css('button'));
    const nextButton = buttons.find(btn =>
      String(btn.nativeElement.textContent).includes('Next'),
    );

    expect(nextButton).toBeTruthy();
    expect(nextButton!.nativeElement.disabled).toBe(true);
  });

  it('shows New Session when finished and emits newSession on click', () => {
    const newSessionSpy = vi.fn();
    component.newSession$.subscribe(newSessionSpy);

    fixture.componentRef.setInput('finished', true);
    fixture.detectChanges();

    expect(component.finished$()).toBe(true);

    const buttons = fixture.debugElement.queryAll(By.css('button'));
    const newSessionButton = buttons.find(btn =>
      String(btn.nativeElement.textContent).includes('New Session'),
    );

    expect(newSessionButton).toBeTruthy();
    newSessionButton!.nativeElement.click();
    expect(newSessionSpy).toHaveBeenCalledTimes(1);

    const verifyButton = buttons.find(btn =>
      String(btn.nativeElement.textContent).includes('Verify'),
    );
    const nextButton = buttons.find(btn =>
      String(btn.nativeElement.textContent).includes('Next'),
    );

    expect(verifyButton).toBeFalsy();
    expect(nextButton).toBeFalsy();
  });
});
