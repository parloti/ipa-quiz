import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { QuizHomeComponent } from './quiz-home/quiz-home.component';
import { QuizComponent } from './quiz/quiz.component';
import { QuizzesHomeComponent } from './quizzes-home/quizzes-home.component';

export const routes: Routes = [
  {
    pathMatch: 'full',
    path: '',
    component: QuizzesHomeComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'quiz/:id',
    component: QuizComponent,
  },
  {
    path: 'quiz-home/:id',
    component: QuizHomeComponent,
  },
];
