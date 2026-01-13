import { LowerCasePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatRipple } from '@angular/material/core';
import { NgIconComponent } from '@ng-icons/core';
import { LogSignals } from 'src/app/utils/log-signals';
import { IQuestion } from '../../models/iquestion';
import { IVowel } from '../../models/ivowel';
import { QuestionElement } from '../../models/question-element';

@LogSignals()
@Component({
  selector: 'app-quiz-prompt',
  imports: [LowerCasePipe, MatRipple, MatIconButton, NgIconComponent],
  templateUrl: './quiz-prompt.component.html',
})
export class QuizPromptComponent {
  /* v8 ignore next -- @preserve */
  public readonly question$ = input.required<IQuestion>({ alias: 'question' });

  public readonly playSound$ = output<IVowel>({ alias: 'playSound' });

  protected readonly isLetterQuestion$ = computed(
    () => this.question$().type === QuestionElement.Letter,
  );

  protected readonly isNameQuestion$ = computed(
    () => this.question$().type === QuestionElement.Name,
  );

  protected readonly isSoundQuestion$ = computed(
    () => this.question$().type === QuestionElement.Sound,
  );

  protected onPlaySound(vowel: IVowel): void {
    this.playSound$.emit(vowel);
  }
}
