import { Component } from '@angular/core';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent {
  questions: any[] = [];
  currentQuestionIndex: number = 0;
  score: number = 0;

  constructor() {
    this.loadQuestions();
  }

  loadQuestions() {
    // Load or fetch quiz questions here
    this.questions = [
      { question: 'What is the capital of France?', options: ['Paris', 'London', 'Berlin'], answer: 'Paris' },
      { question: 'What is 2 + 2?', options: ['3', '4', '5'], answer: '4' },
      // Add more questions as needed
    ];
  }

  answerQuestion(selectedOption: string) {
    if (selectedOption === this.questions[this.currentQuestionIndex].answer) {
      this.score++;
    }
    this.currentQuestionIndex++;
  }

  isQuizCompleted(): boolean {
    return this.currentQuestionIndex >= this.questions.length;
  }

  restartQuiz() {
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.loadQuestions();
  }
}