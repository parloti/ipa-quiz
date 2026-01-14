import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatRadioChange } from '@angular/material/radio';
import { provideIcons } from '@ng-icons/core';
import { lucideCirclePlay } from '@ng-icons/lucide';
import { ChartComponent } from '../chart/chart.component';
import { IVowel, IVowelID } from '../models/ivowel';
import { QuizService } from '../services/quiz.service';
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
  ],
  styleUrl: './quiz.component.scss',
  viewProviders: [provideIcons({ lucideCirclePlay })],
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

  protected selectAnswer(evt: MatRadioChange) {
    const selectedAnswer = evt.value as IVowelID;
    this.quizService.selectAnswer(selectedAnswer);
  }

  protected onPrevious(): void {
    this.quizService.previousQuestion();
  }

  protected updateOptionSound(vowel: IVowel, optionIndex: number): void {
    this.quizService.updateOptionSound(vowel, optionIndex);
  }

  protected updateQuestionSound(vowel: IVowel): void {
    this.quizService.updateQuestionSound(vowel);
  }
}
