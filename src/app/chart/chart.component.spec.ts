import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { beforeEach, describe, expect, it } from 'vitest';

import { IQuestion } from '../models/iquestion';
import { IVowel } from '../models/ivowel';
import { QuestionElement } from '../models/question-element';
import { VOWELS } from '../vowels';
import { ChartComponent } from './chart.component';

describe('ChartComponent', () => {
  let fixture: ComponentFixture<ChartComponent>;
  let component: ChartComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ChartComponent);
    component = fixture.componentInstance;

    // Set required inputs with default values
    fixture.componentRef.setInput('answered', undefined);
    fixture.componentRef.setInput('selectedAnswer', undefined);
    fixture.componentRef.setInput('question', undefined);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('vowelsByPosition', () => {
    it('should group vowels by position (name without rounded/unrounded suffix)', () => {
      const vowelsByPosition = component.vowelsByPosition;

      expect(vowelsByPosition).toBeDefined();
      expect(typeof vowelsByPosition).toBe('object');

      // Check that all vowels are grouped
      const allGroupedVowels = Object.values(vowelsByPosition).flat();
      expect(allGroupedVowels.length).toBe(VOWELS.length);

      // Verify grouping logic - vowels with same position should be in same group
      const closeFrontVowels = vowelsByPosition['Close front'];
      expect(closeFrontVowels).toBeDefined();
      expect(closeFrontVowels!.length).toBeGreaterThanOrEqual(2); // rounded and unrounded
      expect(
        closeFrontVowels!.every(v => v.name.startsWith('Close front')),
      ).toBe(true);
    });

    it('should return the same reference on multiple calls', () => {
      const first = component.vowelsByPosition;
      const second = component.vowelsByPosition;
      expect(first).toBe(second);
    });
  });

  describe('template rendering', () => {
    it('should render placement headers', () => {
      const placements = fixture.debugElement.queryAll(By.css('.placement'));
      expect(placements.length).toBe(5);
      expect(placements[0].nativeElement.textContent.trim()).toBe('Front');
      expect(placements[1].nativeElement.textContent.trim()).toBe('Near-front');
      expect(placements[2].nativeElement.textContent.trim()).toBe('Central');
      expect(placements[3].nativeElement.textContent.trim()).toBe('Near-back');
      expect(placements[4].nativeElement.textContent.trim()).toBe('Back');
    });

    it('should render constriction headers', () => {
      const constrictions = fixture.debugElement.queryAll(
        By.css('.constriction'),
      );
      expect(constrictions.length).toBe(7);
      expect(constrictions[0].nativeElement.textContent.trim()).toBe('Close');
      expect(constrictions[1].nativeElement.textContent.trim()).toBe(
        'Near-close',
      );
      expect(constrictions[2].nativeElement.textContent.trim()).toBe(
        'Close-mid',
      );
      expect(constrictions[3].nativeElement.textContent.trim()).toBe('Mid');
      expect(constrictions[4].nativeElement.textContent.trim()).toBe(
        'Open-mid',
      );
      expect(constrictions[5].nativeElement.textContent.trim()).toBe(
        'Near-open',
      );
      expect(constrictions[6].nativeElement.textContent.trim()).toBe('Open');
    });

    it('should not render vowels when answered is undefined', () => {
      fixture.componentRef.setInput('answered', undefined);
      fixture.detectChanges();

      const vowels = fixture.debugElement.queryAll(By.css('.vowels'));
      expect(vowels.length).toBe(0);
    });

    it('should not render vowels when answered is false', () => {
      fixture.componentRef.setInput('answered', false);
      fixture.detectChanges();

      const vowels = fixture.debugElement.queryAll(By.css('.vowels'));
      expect(vowels.length).toBe(0);
    });

    it('should render vowels when answered is true', () => {
      fixture.componentRef.setInput('answered', true);
      fixture.detectChanges();

      const vowels = fixture.debugElement.queryAll(By.css('.vowels'));
      expect(vowels.length).toBeGreaterThan(0);
    });

    it('should render all vowel groups when answered is true', () => {
      fixture.componentRef.setInput('answered', true);
      fixture.detectChanges();

      const vowelGroups = fixture.debugElement.queryAll(By.css('.vowels'));
      const expectedGroupCount = Object.keys(component.vowelsByPosition).length;
      expect(vowelGroups.length).toBe(expectedGroupCount);
    });
  });

  describe('vowel styling based on answer', () => {
    const testVowel = VOWELS[0]; // Close front unrounded 'i'
    const differentVowel = VOWELS[1]; // Close front rounded 'y'

    const createQuestion = (vowel: IVowel): IQuestion => ({
      vowel,
      type: QuestionElement.Letter,
      index: 0,
      options: {
        [vowel.id]: { ...vowel, type: QuestionElement.Letter },
        [differentVowel.id]: {
          ...differentVowel,
          type: QuestionElement.Letter,
        },
      } as any,
      selectedAnswer: vowel.id,
      answered: true,
      answeredDate: new Date().toISOString(),
    });

    it('should apply border-success class when answer is correct', () => {
      fixture.componentRef.setInput('answered', true);
      fixture.componentRef.setInput('question', createQuestion(testVowel));
      fixture.componentRef.setInput('selectedAnswer', testVowel.id);
      fixture.detectChanges();

      const vowelElement = fixture.debugElement.query(
        By.css(`[vowel="${testVowel.name}"]`),
      );
      expect(vowelElement).toBeTruthy();
      expect(vowelElement.nativeElement.classList.contains('border')).toBe(
        true,
      );
      expect(
        vowelElement.nativeElement.classList.contains('border-success'),
      ).toBe(true);
      expect(
        vowelElement.nativeElement.classList.contains('border-danger'),
      ).toBe(false);
    });

    it('should apply border-danger class when answer is incorrect', () => {
      fixture.componentRef.setInput('answered', true);
      fixture.componentRef.setInput('question', createQuestion(testVowel));
      fixture.componentRef.setInput('selectedAnswer', differentVowel.id); // Wrong answer
      fixture.detectChanges();

      // The selected wrong answer should have border-danger
      const wrongAnswerElement = fixture.debugElement.query(
        By.css(`[vowel="${differentVowel.name}"]`),
      );
      expect(wrongAnswerElement).toBeTruthy();
      expect(
        wrongAnswerElement.nativeElement.classList.contains('border'),
      ).toBe(true);
      expect(
        wrongAnswerElement.nativeElement.classList.contains('border-danger'),
      ).toBe(true);

      // The correct answer should have border-success
      const correctAnswerElement = fixture.debugElement.query(
        By.css(`[vowel="${testVowel.name}"]`),
      );
      expect(correctAnswerElement).toBeTruthy();
      expect(
        correctAnswerElement.nativeElement.classList.contains('border'),
      ).toBe(true);
      expect(
        correctAnswerElement.nativeElement.classList.contains('border-success'),
      ).toBe(true);
    });

    it('should not apply border classes to unrelated vowels', () => {
      const unrelatedVowel = VOWELS[5]; // A vowel not involved in the question

      fixture.componentRef.setInput('answered', true);
      fixture.componentRef.setInput('question', createQuestion(testVowel));
      fixture.componentRef.setInput('selectedAnswer', testVowel.id);
      fixture.detectChanges();

      const unrelatedElement = fixture.debugElement.query(
        By.css(`[vowel="${unrelatedVowel.name}"]`),
      );
      expect(unrelatedElement).toBeTruthy();
      expect(unrelatedElement.nativeElement.classList.contains('border')).toBe(
        false,
      );
    });

    it('should display vowel letter in span', () => {
      fixture.componentRef.setInput('answered', true);
      fixture.detectChanges();

      const vowelSpan = fixture.debugElement.query(
        By.css(`[vowel="${testVowel.name}"] span`),
      );
      expect(vowelSpan).toBeTruthy();
      expect(vowelSpan.nativeElement.textContent.trim()).toBe(testVowel.letter);
    });
  });

  describe('tooltips', () => {
    it('should have matTooltip directive on vowel container', () => {
      fixture.componentRef.setInput('answered', true);
      fixture.detectChanges();

      const testVowel = VOWELS[0];
      const vowelElement = fixture.debugElement.query(
        By.css(`[vowel="${testVowel.name}"]`),
      );
      expect(vowelElement).toBeTruthy();
      // The matTooltip attribute should be present on the element
      expect(
        vowelElement.nativeElement.hasAttribute('ng-reflect-message') ||
          vowelElement.nativeElement.classList.contains(
            'mat-mdc-tooltip-trigger',
          ) ||
          vowelElement.attributes['matTooltip'] !== undefined,
      ).toBe(true);
    });

    it('should have matTooltip directive on vowel span', () => {
      fixture.componentRef.setInput('answered', true);
      fixture.detectChanges();

      const testVowel = VOWELS[0];
      const vowelSpan = fixture.debugElement.query(
        By.css(`[vowel="${testVowel.name}"] span`),
      );
      expect(vowelSpan).toBeTruthy();
      // The span should have matTooltipPosition attribute which indicates matTooltip is applied
      expect(
        vowelSpan.nativeElement.hasAttribute('ng-reflect-message') ||
          vowelSpan.nativeElement.hasAttribute('mattooltiposition') ||
          vowelSpan.attributes['matTooltipPosition'] !== undefined,
      ).toBe(true);
    });
  });

  describe('chart structure', () => {
    it('should render diagonals element', () => {
      const diagonals = fixture.debugElement.query(By.css('.diagonals'));
      expect(diagonals).toBeTruthy();
    });

    it('should render horizontal lines', () => {
      const horizontal1 = fixture.debugElement.query(By.css('.horizontal_1'));
      const horizontal2 = fixture.debugElement.query(By.css('.horizontal_2'));
      const horizontal3 = fixture.debugElement.query(By.css('.horizontal_3'));
      const horizontal4 = fixture.debugElement.query(By.css('.horizontal_4'));

      expect(horizontal1).toBeTruthy();
      expect(horizontal2).toBeTruthy();
      expect(horizontal3).toBeTruthy();
      expect(horizontal4).toBeTruthy();
    });

    it('should render vertical line', () => {
      const vertical = fixture.debugElement.query(By.css('.vertical'));
      expect(vertical).toBeTruthy();
    });
  });

  describe('vowels attribute', () => {
    it('should set vowels attribute with position key on each vowel group', () => {
      fixture.componentRef.setInput('answered', true);
      fixture.detectChanges();

      const vowelGroups = fixture.debugElement.queryAll(By.css('.vowels'));
      const positionKeys = Object.keys(component.vowelsByPosition);

      vowelGroups.forEach(group => {
        const vowelsAttr = group.attributes['vowels'];
        expect(vowelsAttr).toBeDefined();
        expect(positionKeys).toContain(vowelsAttr);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle undefined question gracefully', () => {
      fixture.componentRef.setInput('answered', true);
      fixture.componentRef.setInput('question', undefined);
      fixture.componentRef.setInput('selectedAnswer', VOWELS[0].id);
      fixture.detectChanges();

      // Should render without errors
      const vowels = fixture.debugElement.queryAll(By.css('.vowels'));
      expect(vowels.length).toBeGreaterThan(0);
    });

    it('should handle undefined selectedAnswer gracefully', () => {
      fixture.componentRef.setInput('answered', true);
      fixture.componentRef.setInput('selectedAnswer', undefined);
      fixture.componentRef.setInput('question', {
        vowel: VOWELS[0],
        type: QuestionElement.Letter,
        index: 0,
        options: {
          [VOWELS[0].id]: { ...VOWELS[0], type: QuestionElement.Letter },
        } as any,
        selectedAnswer: undefined,
        answered: false,
      });
      fixture.detectChanges();

      // The correct answer should still show border-success
      const correctElement = fixture.debugElement.query(
        By.css(`[vowel="${VOWELS[0].name}"]`),
      );
      expect(correctElement).toBeTruthy();
      expect(
        correctElement.nativeElement.classList.contains('border-success'),
      ).toBe(true);
    });

    it('should handle question with undefined vowel', () => {
      fixture.componentRef.setInput('answered', true);
      fixture.componentRef.setInput('selectedAnswer', VOWELS[0].id);
      fixture.componentRef.setInput('question', {
        vowel: undefined as unknown as IVowel,
        type: QuestionElement.Letter,
        index: 0,
        options: {
          [VOWELS[0].id]: { ...VOWELS[0], type: QuestionElement.Letter },
        } as any,
        selectedAnswer: VOWELS[0].id,
        answered: true,
        answeredDate: new Date().toISOString(),
      });
      fixture.detectChanges();

      // Should render without errors, selectedAnswer vowel should have border but not success
      const selectedElement = fixture.debugElement.query(
        By.css(`[vowel="${VOWELS[0].name}"]`),
      );
      expect(selectedElement).toBeTruthy();
      expect(selectedElement.nativeElement.classList.contains('border')).toBe(
        true,
      );
      // No border-success since there's no correct answer to match
      expect(
        selectedElement.nativeElement.classList.contains('border-success'),
      ).toBe(false);
    });

    it('should not apply any border when selectedAnswer and question vowel are both undefined', () => {
      fixture.componentRef.setInput('answered', true);
      fixture.componentRef.setInput('selectedAnswer', undefined);
      fixture.componentRef.setInput('question', undefined);
      fixture.detectChanges();

      // No vowel should have border classes
      const anyVowelWithBorder = fixture.debugElement.queryAll(
        By.css('[vowel].border'),
      );
      expect(anyVowelWithBorder.length).toBe(0);
    });

    it('should handle when both selectedAnswer matches and question has undefined vowel', () => {
      fixture.componentRef.setInput('answered', true);
      fixture.componentRef.setInput('selectedAnswer', VOWELS[1].id);
      fixture.componentRef.setInput('question', {
        vowel: undefined as unknown as IVowel,
        type: QuestionElement.Letter,
        index: 0,
        options: {} as any,
        selectedAnswer: VOWELS[1].id,
        answered: true,
        answeredDate: new Date().toISOString(),
      });
      fixture.detectChanges();

      // The selected vowel should have border-danger since correct answer is undefined
      const selectedElement = fixture.debugElement.query(
        By.css(`[vowel="${VOWELS[1].name}"]`),
      );
      expect(selectedElement).toBeTruthy();
      expect(
        selectedElement.nativeElement.classList.contains('border-danger'),
      ).toBe(true);
    });
  });
});
