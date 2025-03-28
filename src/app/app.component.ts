import { Component, inject } from '@angular/core';
import { MatFabButton } from '@angular/material/button';
import { RouterOutlet } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft } from '@ng-icons/lucide';
import { QuizService } from './services/quiz.service';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatFabButton, NgIconComponent],

  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  viewProviders: [provideIcons({ lucideChevronLeft })],
})
export class AppComponent {
  private readonly quizService = inject(QuizService);

  goBack() {
    this.quizService.goBack();
  }
}
