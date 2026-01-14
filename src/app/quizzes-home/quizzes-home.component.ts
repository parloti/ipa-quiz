import { Component, inject, Signal } from '@angular/core';
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
  private readonly _quizzes$: Signal<IQuiz[] | undefined> = toSignal(
    inject(QuizService).quizzes$,
  );
  public get quizzes$(): Signal<IQuiz[] | undefined> {
    return this._quizzes$;
  }

  private readonly quizService = inject(QuizService);

  selectQuiz(quiz: IQuiz): void {
    this.quizService.openQuiz(quiz.id);
  }
}
