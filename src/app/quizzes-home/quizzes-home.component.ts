import { Component, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { IQuiz } from '../models/iquiz';
import { QuizService } from '../services/quiz.service';
import { LogSignals } from '../utils/log-signals';

@LogSignals()
@Component({
  selector: 'app-quizzes-home',
  templateUrl: './quizzes-home.component.html',
  styleUrl: './quizzes-home.component.scss',
})
export class QuizzesHomeComponent {
  private _quizzes$: Signal<IQuiz[] | undefined>;
  public get quizzes$(): Signal<IQuiz[] | undefined> {
    return this._quizzes$;
  }

  constructor(private quizService: QuizService) {
    this._quizzes$ = toSignal(this.quizService.quizzes$);
  }

  selectQuiz(quiz: IQuiz): void {
    this.quizService.openQuiz(quiz.id);
  }
}
