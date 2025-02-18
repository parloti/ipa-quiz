import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { QuizService } from '../services/quiz.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [NgFor],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private _title: string =
    'Master the IPA – Quiz Your Way to Phonetic Prowess!';
  public get title(): string {
    return this._title;
  }

  private _welcome: string =
    "Dive into the world of sounds with our interactive IPA quiz app. Whether you're a linguistics enthusiast, a language learner, or just curious about phonetics, we've got a fun and challenging journey for you!";
  public get welcome(): string {
    return this._welcome;
  }

  private _features: { title: string; description: string }[] = [
    {
      title: 'Interactive Quizzes',
      description:
        'Test your knowledge of IPA symbols and their corresponding sounds.',
    },
    {
      title: 'Progress Tracker',
      description: "See how far you've come and what areas need more practice.",
    },
    {
      title: 'Learning Resources',
      description:
        'Access detailed explanations and examples for each IPA symbol.',
    },
    {
      title: 'Leaderboard',
      description:
        'Compete with friends and other users to see who can master the IPA chart the fastest.',
    },
  ];
  public get features(): { title: string; description: string }[] {
    return this._features;
  }

  private _action: string = 'Start Quiz Now!';
  public get action(): string {
    return this._action;
  }

  private _links: { href: string; icon:string, title: string }[] = [
    {
      href: '',
      title: 'GitHub',
icon: 'fab fa-github'
    },
    {
      href: '',
      title: 'LinkedIn',
      icon: 'fab fa-linkedin'
    },
    {
      href: '',
      title: 'Twitter',
      icon: 'fab fa-twitter'
    },
  ];
  public get links(): { href: string; title: string }[] {
    return this._links;
  }

  quizzes: any[] = [];

  constructor(private quizService: QuizService, private router: Router) {}

  ngOnInit(): void {
    this.quizzes = this.quizService.getQuizzes();
  }

  selectQuiz(quiz: any): void {
    this.quizService.setSelectedQuiz(quiz);
  }

  startQuiz(): void {
    this.router.navigate(['/quiz']);
  }

  currentSlide: number = 0;
  setSlide(index: number): void {
    this.currentSlide = index;
  }
}
