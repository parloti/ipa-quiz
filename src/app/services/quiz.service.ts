import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { IMovingAverage } from '../models/imoving-average';
import { IQuestion } from '../models/iquestion';
import { IQuiz } from '../models/iquiz';
import { ISession } from '../models/isession';
import { IState } from '../models/istate';
import { IStatistics } from '../models/istatistics';
import { IVowel } from '../models/ivowel';
import { actions } from '../state/actions';
import { quizFeature } from '../state/quiz-feature';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  goBack() {
    this.store$.dispatch(actions.goBack());
  }
  private readonly store$ = inject(Store);
  public goToNewSession() {
    this.store$.dispatch(actions.goToNewSession());
  }

  public previousQuestion() {
    this.store$.dispatch(actions.previousQuestion());
  }

  public next() {
    this.store$.dispatch(actions.nextQuestion());
  }

  public answerCurrent() {
    this.store$.dispatch(
      actions.answerCurrent({ date: new Date().toISOString() }),
    );
  }
  public openQuiz(quizId: IQuiz['id']) {
    this.store$.dispatch(actions.openQuiz({ quizId }));
  }

  public selectAnswer(selectedAnswer: IVowel['id']): void {
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

  private readonly _selectedAnswer$: Observable<IVowel['id'] | undefined>;
  public get selectedAnswer$(): Observable<IVowel['id'] | undefined> {
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

  private readonly _questionsLength$: Observable<number>;
  public get questionsLength$(): Observable<number> {
    return this._questionsLength$;
  }
  private readonly _movingAverages$: Observable<IMovingAverage[]> =
    this.store$.select(quizFeature.selectMovingAverages);

  private readonly _statsBySession$: Observable<IStatistics[]> =
    this.store$.select(quizFeature.selectStatsBySession);
  public get statsBySession$(): Observable<IStatistics[]> {
    return this._statsBySession$;
  }

  public get movingAverages$(): Observable<IMovingAverage[]> {
    return this._movingAverages$;
  }

  private readonly _totalStats$: Observable<IStatistics> = this.store$.select(
    quizFeature.selectTotalStats,
  );
  public get totalStats$(): Observable<IStatistics> {
    return this._totalStats$;
  }
  constructor() {
    this._finished$ = this.store$.select(quizFeature.selectFinished);

    this._quizzes$ = this.store$.select(quizFeature.selectQuizzes);
    this._openedQuiz$ = this.store$.select(quizFeature.selectCurrentQuiz);
    this._selectedAnswer$ = this.store$.select(
      quizFeature.selectCurrentQuestionSelectedAnswer,
    );
    this._state$ = this.store$.select(quizFeature.selectQuizState);
    this._session$ = this.store$.select(quizFeature.selectCurrentSession);
    this._questions$ = this.store$.select(quizFeature.selectSessionQuestions);
    this._question$ = this.store$.select(quizFeature.selectCurrentQuestion);
    this._currentQuestionIndex$ = this.store$.select(
      quizFeature.selectCurrentQuestionIndex,
    );

    this._answered$ = this.store$.select(
      quizFeature.selectCurrentQuestionAnswered,
    );
    this._questionsLength$ = this.store$.select(
      quizFeature.selectQuestionsLength,
    );
  }
}
