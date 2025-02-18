import { Component, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { IQuiz } from '../models/iquiz';
import { QuizService } from '../services/quiz.service';

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

  userStatistics: any;

  constructor(
    private quizService: QuizService,
    private router: Router,
  ) {
    this._quizzes$ = toSignal(this.quizService.quizzes$);
  }

  ngOnInit(): void {
    this.userStatistics = this.quizService.getUserStatistics();
  }

  selectQuiz(quiz: IQuiz): void {
    this.quizService.openQuiz(quiz);
  }
}
