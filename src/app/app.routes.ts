import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { QuizComponent } from './quiz/quiz.component';
import { QuizzesHomeComponent } from './quizzes-home/quizzes-home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
  },
  {
    path: 'quizzes-home',
    component: QuizzesHomeComponent,
  },
  {
    path: 'quiz',
    component: QuizComponent,
  },
];
