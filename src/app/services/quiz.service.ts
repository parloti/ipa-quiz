import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { IQuestion } from '../models/iquestion';
import { IQuiz } from '../models/iquiz';
import { ISession } from '../models/isession';
import { IState } from '../models/istate';
import { actions } from '../state/actions';
import { quizFeature } from '../state/quiz-feature';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  next() {
    this.store$.dispatch(actions.nextQuestion());
  }

  answerCurrent() {
    this.store$.dispatch(
      actions.answerCurrent({ date: new Date().toISOString() }),
    );
  }
  openQuiz(quiz: IQuiz) {
    this.store$.dispatch(actions.openQuiz({ quiz }));
  }

  public selectAnswer(selectedAnswer: number | undefined): void {
    this.store$.dispatch(actions.selectAnswer({ selectedAnswer }));
  }

  private readonly _quizzes$: Observable<IQuiz[]>;
  public get quizzes$(): Observable<IQuiz[]> {
    return this._quizzes$;
  }

  private readonly _finished$: Observable<boolean | undefined>;
  public get finished$(): Observable<boolean | undefined> {
    return this._finished$;
  }

  private readonly _openedQuiz$: Observable<IQuiz | undefined>;
  public get openedQuiz$(): Observable<IQuiz | undefined> {
    return this._openedQuiz$;
  }

  private readonly _selectedAnswer$: Observable<number | undefined>;
  public get selectedAnswer$(): Observable<number | undefined> {
    return this._selectedAnswer$;
  }

  private readonly _state$: Observable<IState | undefined>;
  public get state$(): Observable<IState | undefined> {
    return this._state$;
  }

  private readonly _session$: Observable<ISession | undefined>;
  public get session$(): Observable<ISession | undefined> {
    return this._session$;
  }

  private readonly _questions$: Observable<IQuestion[] | undefined>;
  public get questions$(): Observable<IQuestion[] | undefined> {
    return this._questions$;
  }

  private readonly _question$: Observable<IQuestion | undefined>;
  public get question$(): Observable<IQuestion | undefined> {
    return this._question$;
  }

  private readonly _currentQuestionIndex$: Observable<number | undefined>;
  public get currentQuestionIndex$(): Observable<number | undefined> {
    return this._currentQuestionIndex$;
  }

  private readonly _answered$: Observable<boolean>;
  public get answered$(): Observable<boolean> {
    return this._answered$;
  }

  getUserStatistics(): any {}

  constructor(private readonly store$: Store<{ root: IState }>) {
    this._finished$ = this.store$.select(quizFeature.selectFinished);

    this._quizzes$ = this.store$.select(quizFeature.selectQuizzes);
    this._openedQuiz$ = this.store$.select(quizFeature.selectOpenedQuiz);
    this._selectedAnswer$ = this.store$.select(
      quizFeature.selectCurrentQuestionSelectedAnswer,
    );
    this._state$ = this.store$.select(quizFeature.selectQuizState);
    this._session$ = this.store$.select(quizFeature.selectSession);
    this._questions$ = this.store$.select(quizFeature.selectSessionQuestions);
    this._question$ = this.store$.select(quizFeature.selectCurrentQuestion);
    this._currentQuestionIndex$ = this.store$.select(
      quizFeature.selectCurrentQuestionIndex,
    );

    this._answered$ = this.store$.select(
      quizFeature.selectCurrentQuestionAnswered,
    );
  }
}
