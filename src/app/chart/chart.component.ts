import { KeyValuePipe, NgClass } from '@angular/common';
import { Component, input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IQuestion } from '../models/iquestion';
import { IVowel, IVowelID } from '../models/ivowel';
import { VOWELS } from '../vowels';

const vowelsByPosition = Object.groupBy(VOWELS, vowel =>
  vowel.name.replace(/ (un)*rounded$/, ''),
);

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
  public readonly answered$ = input.required<boolean | undefined>({
    alias: 'answered',
  });

  /* v8 ignore next -- @preserve */
  public readonly selectedAnswer$ = input.required<IVowelID | undefined>({
    alias: 'selectedAnswer',
  });
  public readonly question$ = input.required<IQuestion | undefined>({
    alias: 'question',
  });
  protected readonly vowelsByPosition = vowelsByPosition;

  protected readonly vowelIdsByPosition = Object.fromEntries(
    Object.entries(vowelsByPosition)
      .filter((entry): entry is [string, IVowel[]] => entry[1] !== void 0)
      .reduce(
        (prev, [position, vowels]): [string, IVowelID[]][] => {
          const ids = vowels?.map(vowel => vowel.id) ?? ([] as IVowelID[]);
          const newEntry = [position, ids] as [string, IVowelID[]];

          const accumulated = [...prev, newEntry];

          return accumulated;
        },
        [] as [string, IVowelID[]][],
      ),
  );
}

// [
//       ...prev,
//       [
//         position,
//         vowels?.map(vowel => vowel.id) as any),
//       ],
