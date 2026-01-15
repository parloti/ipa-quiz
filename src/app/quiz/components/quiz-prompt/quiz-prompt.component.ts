import { LowerCasePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { LogSignals } from 'src/app/utils/log-signals';
import { IQuestion } from '../../../models/iquestion';
import { IVowel } from '../../../models/ivowel';
import { QuestionElement } from '../../../models/question-element';
import { SoundPlayerComponent } from '../sound-player/sound-player.component';

@LogSignals()
@Component({
  selector: 'app-quiz-prompt',
  imports: [LowerCasePipe, SoundPlayerComponent],
  templateUrl: './quiz-prompt.component.html',
})
export class QuizPromptComponent {
  /* v8 ignore next -- @preserve */
  public readonly question$ = input.required<IQuestion>({ alias: 'question' });

  public readonly nextSound$ = output<IVowel>({ alias: 'nextSound' });

  protected readonly isLetterQuestion$ = computed(
    () => this.question$().type === QuestionElement.Letter,
  );

  protected readonly isNameQuestion$ = computed(
    () => this.question$().type === QuestionElement.Name,
  );

  protected readonly isSoundQuestion$ = computed(
    () => this.question$().type === QuestionElement.Sound,
  );

  protected onNextSound(vowel: IVowel): void {
    this.nextSound$.emit(vowel);
  }
}
