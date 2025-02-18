import { Component, OnInit } from '@angular/core';
import { QuizService } from '../../services/quiz.service';

@Component({
  selector: 'app-quiz-detail',
  templateUrl: './quiz-detail.component.html',
  styleUrls: ['./quiz-detail.component.css']
})
export class QuizDetailComponent implements OnInit {
  selectedQuiz: any;
  selectedAnswers: any[] = [];
  submitted: boolean = false;
  score: number = 0;

  constructor(private quizService: QuizService) {}

  ngOnInit(): void {
    this.selectedQuiz = this.quizService.getSelectedQuiz();
  }

  selectAnswer(questionIndex: number, answer: any): void {
    this.selectedAnswers[questionIndex] = answer;
  }

  submitQuiz(): void {
    this.submitted = true;
    this.score = this.quizService.calculateScore(this.selectedAnswers);
  }
}