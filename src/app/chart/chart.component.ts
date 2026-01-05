import { KeyValuePipe, NgClass } from '@angular/common';
import { Component, input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IQuestion } from '../models/iquestion';
import { IVowel } from '../models/ivowel';
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
  public readonly answered = input.required</* istanbul ignore -- @preserve */boolean | undefined>();
  public readonly selectedAnswer = /* istanbul ignore -- @preserve */input.required<IVowel['id'] | undefined>();
  /* istanbul ignore -- @preserve */
  public readonly question = input.required<IQuestion | undefined>();

  private readonly _vowelsByPosition = Object.groupBy(VOWELS, vowel =>
    vowel.name.replace(/ (un)*rounded$/, ''),
  );

  public get vowelsByPosition() {
    return this._vowelsByPosition;
  }
}
