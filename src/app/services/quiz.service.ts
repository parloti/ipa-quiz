import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private quizzes = [
    {
      name: 'General Knowledge',
      questions: [
        {
          text: 'What is the capital of France?',
          options: ['Paris', 'London', 'Berlin', 'Madrid'],
          answer: 'Paris'
        },
        {
          text: 'What is 2 + 2?',
          options: ['3', '4', '5', '6'],
          answer: '4'
        }
      ]
    },
    {
      name: 'Math Quiz',
      questions: [
        {
          text: 'What is 5 + 3?',
          options: ['7', '8', '9', '10'],
          answer: '8'
        },
        {
          text: 'What is 10 - 4?',
          options: ['5', '6', '7', '8'],
          answer: '6'
        }
      ]
    }
  ];

  private selectedQuiz: any;
  private score: number = 0;

  getQuizzes(): any[] {
    return this.quizzes;
  }

  setSelectedQuiz(quiz: any): void {
    this.selectedQuiz = quiz;
  }

  getSelectedQuiz(): any {
    return this.selectedQuiz;
  }

  calculateScore(selectedAnswers: any[]): number {
    let score = 0;
    this.selectedQuiz.questions.forEach((question:any, index:any) => {
      if (question.answer === selectedAnswers[index]) {
        score++;
      }
    });
    this.score = score;
    return score;
  }

  getScore(): number {
    return this.score;
  }

  getTotalQuestions(): number {
    return this.selectedQuiz.questions.length;
  }

  constructor() { }
}
