import { Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { LogSignals } from 'src/app/utils/log-signals';
import { IVowelID } from '../../../models/ivowel';

@LogSignals()
@Component({
  selector: 'app-quiz-controls',
  imports: [MatButtonModule],
  templateUrl: './quiz-controls.component.html',
})
export class QuizControlsComponent {
  /* v8 ignore next -- @preserve */
  public readonly index$ = input.required<number>({ alias: 'index' });

  /* v8 ignore next -- @preserve */
  public readonly selectedAnswer$ = input.required<IVowelID | undefined>({
    alias: 'selectedAnswer',
  });

  /* v8 ignore next -- @preserve */
  public readonly answered$ = input.required<boolean>({ alias: 'answered' });

  /* v8 ignore next -- @preserve */
  public readonly finished$ = input.required<boolean>({ alias: 'finished' });

  /* v8 ignore next -- @preserve */
  public readonly questionsLength$ = input.required<number>({
    alias: 'questionsLength',
  });

  public readonly previous$ = output<void>({ alias: 'previous' });
  public readonly verify$ = output<void>({ alias: 'verify' });
  public readonly next$ = output<void>({ alias: 'next' });
  public readonly newSession$ = output<void>({ alias: 'newSession' });

  protected readonly isFirstQuestion$ = computed(() => this.index$() === 0);

  protected readonly isFinished$ = computed(() => this.finished$());

  protected readonly isAnswered$ = computed(() => this.answered$());
  protected readonly hasSelectedAnswer$ = computed(
    () => this.selectedAnswer$() !== undefined,
  );

  protected readonly isLastQuestion$ = computed(
    () => this.index$() === this.questionsLength$() - 1,
  );

  protected readonly isVerifyDisabled$ = computed(
    () => !this.hasSelectedAnswer$() || this.isAnswered$(),
  );

  protected readonly isNextDisabled$ = computed(
    () => !this.isAnswered$() || this.isLastQuestion$(),
  );

  protected onPrevious(): void {
    this.previous$.emit();
  }

  protected onVerify(): void {
    this.verify$.emit();
  }

  protected onNext(): void {
    this.next$.emit();
  }

  protected onNewSession(): void {
    this.newSession$.emit();
  }
}
