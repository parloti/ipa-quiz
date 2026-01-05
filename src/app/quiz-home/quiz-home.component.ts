import { PercentPipe } from '@angular/common';
import { Component, inject, Input, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChartSpline } from '@ng-icons/lucide';
import { map } from 'rxjs';
import { IMovingAverage } from '../models/imoving-average';
import { IQuiz } from '../models/iquiz';
import { IStatistics } from '../models/istatistics';
import { QuizService } from '../services/quiz.service';

@Component({
  selector: 'app-quiz-home',
  templateUrl: './quiz-home.component.html',
  styleUrls: ['./quiz-home.component.scss'],
  imports: [
    MatBadgeModule,
    MatTooltipModule,
    MatButtonModule,
    PercentPipe,
    MatCardModule,
    NgIcon,
  ],
  viewProviders: [provideIcons({ lucideChartSpline })],
})
export class QuizHomeComponent {
  private readonly quizService = inject(QuizService);

  private readonly _statsBySession$: Signal<IStatistics[] | undefined> =
    toSignal(
      this.quizService.statsBySession$.pipe(map(v => [...(v ?? [])].reverse())),
    );
  public get statsBySession$(): Signal<IStatistics[] | undefined> {
    return this._statsBySession$;
  }

  private readonly _movingAverages$: Signal<IMovingAverage[] | undefined> =
    toSignal(this.quizService.movingAverages$);
  public get movingAverages$(): Signal<IMovingAverage[] | undefined> {
    return this._movingAverages$;
  }

  private readonly _totalStats$: Signal<IStatistics | undefined> = toSignal(
    this.quizService.totalStats$,
  );

  public get totalStats$(): Signal<IStatistics | undefined> {
    return this._totalStats$;
  }

  private _quizId: IQuiz['id'] | undefined;

  @Input()
  public set id(quizId: IQuiz['id']) {
    this._quizId = quizId;
  }
  private readonly router = inject(Router);

  public practice(): void {
    if (this._quizId) {
      void this.router.navigate(['quiz/' + this._quizId]);
    }
  }
}
