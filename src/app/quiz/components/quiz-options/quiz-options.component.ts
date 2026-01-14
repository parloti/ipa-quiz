import { KeyValuePipe, NgClass } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatRipple } from '@angular/material/core';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { NgIconComponent } from '@ng-icons/core';
import { LogSignals } from 'src/app/utils/log-signals';
import { IQuestion } from '../../../models/iquestion';
import { IVowel, IVowelID } from '../../../models/ivowel';
import { QuestionElement } from '../../../models/question-element';

@LogSignals()
@Component({
  selector: 'app-quiz-options',
  imports: [
    MatRadioModule,
    NgClass,
    MatRipple,
    MatIconButton,
    NgIconComponent,
    KeyValuePipe,
  ],
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

  public readonly playSound$ = output<{ vowel: IVowel; optionIndex: number }>({
    alias: 'playSound',
  });

  protected onSelectAnswer(evt: MatRadioChange): void {
    this.selectAnswer$.emit(evt);
  }

  protected onPlaySound(vowel: IVowel, optionIndex: number): void {
    this.playSound$.emit({ vowel, optionIndex });
  }
}
