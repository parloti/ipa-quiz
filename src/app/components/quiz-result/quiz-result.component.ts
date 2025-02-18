import { Component, OnInit } from '@angular/core';
import { QuizService } from '../../services/quiz.service';

@Component({
  selector: 'app-quiz-result',
  templateUrl: './quiz-result.component.html',
  styleUrls: ['./quiz-result.component.css']
})
export class QuizResultComponent implements OnInit {
  score: number = 0;
  totalQuestions: number = 0;

  constructor(private quizService: QuizService) {}

  ngOnInit(): void {
    this.score = this.quizService.getScore();
    this.totalQuestions = this.quizService.getTotalQuestions();
  }
}