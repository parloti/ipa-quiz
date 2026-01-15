import { KeyValuePipe, NgClass } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { NgIconComponent } from '@ng-icons/core';
import { LogSignals } from 'src/app/utils/log-signals';
import { IQuestion } from '../../../models/iquestion';
import { IVowel, IVowelID } from '../../../models/ivowel';
import { QuestionElement } from '../../../models/question-element';
import { SoundPlayerComponent } from '../sound-player/sound-player.component';

@LogSignals()
@Component({
  selector: 'app-quiz-options',
  imports: [
    MatRadioModule,
    NgClass,
    NgIconComponent,
    KeyValuePipe,
    SoundPlayerComponent,
  ],
  styleUrls: ['./quiz-options.component.scss'],
  templateUrl: './quiz-options.component.html',
})
export class QuizOptionsComponent {
  /* v8 ignore next -- @preserve */
  public readonly question$ = input.required<IQuestion>({ alias: 'question' });

  public readonly questionElement = QuestionElement;

  /* v8 ignore next -- @preserve */
  public readonly selectedAnswer$ = input.required<IVowelID | undefined>({
    alias: 'selectedAnswer',
  });

  /* v8 ignore next -- @preserve */
  public readonly answered$ = input.required<boolean>({ alias: 'answered' });

  public readonly selectAnswer$ = output<MatRadioChange>({
    alias: 'selectAnswer',
  });

  public readonly nextSound$ = output<{ vowel: IVowel }>({
    alias: 'nextSound',
  });

  protected onSelectAnswer(evt: MatRadioChange): void {
    this.selectAnswer$.emit(evt);
  }

  protected onNextSound(vowel: IVowel): void {
    this.nextSound$.emit({ vowel });
  }
}
