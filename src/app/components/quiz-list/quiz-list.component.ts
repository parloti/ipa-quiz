import { Component, OnInit } from '@angular/core';
import { QuizService } from '../../services/quiz.service';

@Component({
  selector: 'app-quiz-list',
  templateUrl: './quiz-list.component.html',
  styleUrls: ['./quiz-list.component.css']
})
export class QuizListComponent implements OnInit {
  quizzes: any[] = [];

  constructor(private quizService: QuizService) {}

  ngOnInit(): void {
    this.quizzes = this.quizService.getQuizzes();
  }

  selectQuiz(quiz: any): void {
    this.quizService.setSelectedQuiz(quiz);
  }
}