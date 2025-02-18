import { KeyValuePipe, LowerCasePipe, NgClass } from '@angular/common';
import { Component, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IQuestion } from '../models/iquestion';
import { IQuiz } from '../models/iquiz';
import { ISession } from '../models/isession';
import { QuestionElement } from '../models/question-element';
import { QuizService } from '../services/quiz.service';
import { VOWELS } from '../vowels';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  imports: [
    FormsModule,
    LowerCasePipe,
    MatButtonModule,
    MatRadioModule,
    MatTooltipModule,
    NgClass,
    ReactiveFormsModule,
    KeyValuePipe,
  ],
  styleUrl: './quiz.component.scss',
})
export class QuizComponent {
  private _selectedAnswer$: Signal<number | undefined>;
  public get selectedAnswer$(): Signal<number | undefined> {
    return this._selectedAnswer$;
  }

  private _session$: Signal<ISession | undefined>;
  public get session$(): Signal<ISession | undefined> {
    return this._session$;
  }

  public readonly _finished$: Signal<boolean | undefined>;
  public get finished$(): Signal<boolean | undefined> {
    return this._finished$;
  }

  public get questionElement(): typeof QuestionElement {
    return QuestionElement;
  }
  private _quiz$: Signal<IQuiz | undefined>;
  public get quiz$(): Signal<IQuiz | undefined> {
    return this._quiz$;
  }

  public readonly _index$: Signal<number | undefined>;

  public get index$(): Signal<number | undefined> {
    return this._index$;
  }

  public readonly _question$: Signal<IQuestion | undefined>;

  public get question$(): Signal<IQuestion | undefined> {
    return this._question$;
  }

  private readonly _answered$: Signal<boolean | undefined>;
  public get answered$(): Signal<boolean | undefined> {
    return this._answered$;
  }

  constructor(private readonly quizService: QuizService) {
    this._finished$ = toSignal(this.quizService.finished$);
    this._quiz$ = toSignal(this.quizService.openedQuiz$);
    this._index$ = toSignal(this.quizService.currentQuestionIndex$);
    this._question$ = toSignal(this.quizService.question$);
    this._session$ = toSignal(this.quizService.session$);
    this._selectedAnswer$ = toSignal(this.quizService.selectedAnswer$);
    this._answered$ = toSignal(this.quizService.answered$);
  }

  public next(): void {
    this.quizService.next();
  }

  public verify(): void {
    this.quizService.answerCurrent();
  }

  public newQuiz(): void {}

  private readonly _vowelsByPosition = Object.groupBy(VOWELS, vowel =>
    vowel.name.replace(/ (un)*rounded$/, ''),
  );
  public get vowels() {
    return VOWELS;
  }

  public get vowelsByPosition() {
    return this._vowelsByPosition;
  }

  public selectAnswer($event: MatRadioChange) {
    const selectedAnswer = $event.value;
    if (typeof selectedAnswer === 'number') {
      this.quizService.selectAnswer(selectedAnswer);
    } else {
      debugger;
    }
  }
}
