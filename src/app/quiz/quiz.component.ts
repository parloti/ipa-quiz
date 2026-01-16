import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { provideIcons } from '@ng-icons/core';
import {
  lucideAlertTriangle,
  lucideCirclePlay,
  lucideSkipForward,
} from '@ng-icons/lucide';
import { map } from 'rxjs';
import { ChartComponent } from '../chart/chart.component';
import { IVowel, IVowelID } from '../models/ivowel';
import { QuizService } from '../services/quiz.service';
import { transcriptions } from '../transcriptions';
import { LogSignals } from '../utils/log-signals';
import { QuizControlsComponent } from './components/quiz-controls/quiz-controls.component';
import { QuizOptionsComponent } from './components/quiz-options/quiz-options.component';
import { QuizPromptComponent } from './components/quiz-prompt/quiz-prompt.component';

@LogSignals()
@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  imports: [
    QuizPromptComponent,
    QuizOptionsComponent,
    QuizControlsComponent,
    ChartComponent,
    MatTooltipModule,
    MatDividerModule,
  ],
  styleUrl: './quiz.component.scss',
  viewProviders: [
    provideIcons({ lucideCirclePlay, lucideAlertTriangle, lucideSkipForward }),
  ],
})
export class QuizComponent {
  protected readonly selectedAnswer$ = toSignal(
    inject(QuizService).selectedAnswer$,
  );

  protected readonly finished$ = ((
    finished$ = toSignal(inject(QuizService).finished$),
  ) => computed(() => finished$() ?? false))();

  protected readonly openedQuiz$ = toSignal(inject(QuizService).openedQuiz$);

  protected readonly index$ = toSignal(
    inject(QuizService).currentQuestionIndex$,
  );

  protected readonly question$ = toSignal(inject(QuizService).question$);

  protected readonly examplesByLangs$ = ((
    symbol$ = toSignal(
      inject(QuizService).question$.pipe(
        map(question => question?.vowel?.letter),
      ),
    ),
  ) =>
    computed(() => {
      const symbol = symbol$();

      return Object.entries(transcriptions)
        .map(([code, repo]) => {
          const entry = repo.find(e => e.symbol === symbol);
          const examples = entry?.examples
            ?.slice()
            .sort(() => Math.random() - 0.5);
          const cc = code.split('-').pop() || code;
          return {
            code,
            cc: cc.toLowerCase(),
            examples,
            title: examples
              ?.map(({ word, transcription }) => `${word} ${transcription}`)
              .join('\n'),
          };
        })
        .filter(({ examples }) => (examples?.length ?? 0) > 0);
    }))();

  protected readonly answered$ = ((
    answered$ = toSignal(inject(QuizService).answered$),
  ) => computed(() => answered$() ?? false))();

  protected readonly questionsLength$ = toSignal(
    inject(QuizService).questionsLength$,
  );

  private readonly quizService = inject(QuizService);

  protected onNext(): void {
    this.quizService.next();
  }

  protected onVerify(): void {
    this.quizService.answerCurrent();
  }

  protected onNewSession(): void {
    this.quizService.goToNewSession();
  }

  protected selectAnswer(selectedAnswer: IVowelID) {
    this.quizService.selectAnswer(selectedAnswer);
  }

  protected onPrevious(): void {
    this.quizService.previousQuestion();
  }

  protected nextOptionSound(vowel: IVowel): void {
    this.quizService.nextOptionSound(vowel);
  }

  protected nextQuestionSound(vowel: IVowel): void {
    this.quizService.nextQuestionSound(vowel);
  }
}
