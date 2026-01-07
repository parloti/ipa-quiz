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
  public readonly answered = /* v8 ignore start -- @preserve */ input.required<
    boolean | undefined
  >(); /* v8 ignore stop -- @preserve */

  public readonly selectedAnswer =
    /* v8 ignore start -- @preserve */ input.required<
      IVowel['id'] | undefined
    >(); /* v8 ignore stop -- @preserve */
  public readonly question = /* v8 ignore start -- @preserve */ input.required<
    IQuestion | undefined
  >(); /* v8 ignore stop -- @preserve */

  private readonly _vowelsByPosition = Object.groupBy(VOWELS, vowel =>
    vowel.name.replace(/ (un)*rounded$/, ''),
  );

  public get vowelsByPosition() {
    return this._vowelsByPosition;
  }
}
