import { KeyValuePipe, NgClass } from '@angular/common';
import { Component, input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IQuestion } from '../models/iquestion';
import { IVowelID } from '../models/ivowel';
import { VOWELS } from '../vowels';

@Component({
  selector: 'app-chart',
  imports: [
    KeyValuePipe,

    FormsModule,
    MatButtonModule,
    MatRadioModule,
    MatTooltipModule,
    NgClass,
    ReactiveFormsModule,
  ],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss',
})
export class ChartComponent {
  /* v8 ignore next -- @preserve */
  public readonly answered = input.required<boolean | undefined>();

  /* v8 ignore next -- @preserve */
  public readonly selectedAnswer = input.required<IVowelID | undefined>();
  public readonly question = input.required<IQuestion | undefined>();

  /* v8 ignore next -- @preserve */
  private readonly _vowelsByPosition = Object.groupBy(VOWELS, vowel =>
    vowel.name.replace(/ (un)*rounded$/, ''),
  );

  public get vowelsByPosition() {
    return this._vowelsByPosition;
  }
}
