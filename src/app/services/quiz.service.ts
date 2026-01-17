import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IMovingAverage } from '../models/imoving-average';
import { IQuestion } from '../models/iquestion';
import { IQuiz, IQuizID } from '../models/iquiz';
import { ISession } from '../models/isession';
import { IState } from '../models/istate';
import { IStatistics } from '../models/istatistics';
import { IVowel, IVowelID } from '../models/ivowel';
import { actions } from '../state/actions';
import { quizFeature } from '../state/quiz-feature';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  practiceOpened(quizId: IQuizID) {
    this.store$.dispatch(actions.practiceOpened({ quizId }));
  }


  nextOptionSound(vowel: IVowel) {
    const currentForType = vowel as IVowel & { soundIndex?: number };
    const sounds = vowel.sounds ?? [];
    if (sounds.length === 0) return;

    const currentIndex = currentForType.soundIndex ?? 0;
    const soundIndex = (currentIndex + 1) % sounds.length;

    this.store$.dispatch(
      actions.updateOptionSoundIndex({ optionId: vowel.id, soundIndex }),
    );
  }

  nextQuestionSound(vowel: IVowel) {
    const currentForType = vowel as IVowel & { soundIndex?: number };
    const sounds = vowel.sounds ?? [];
    if (sounds.length === 0) return;

    const currentIndex = currentForType.soundIndex ?? 0;
    const soundIndex = (currentIndex + 1) % sounds.length;

    this.store$.dispatch(actions.updateQuestionSoundIndex({ soundIndex }));
  }

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
  public openQuiz(quizId: IQuizID) {
    this.store$.dispatch(actions.openQuiz({ quizId }));
  }

  public selectAnswer(selectedAnswer: IVowelID): void {
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

  private readonly _selectedAnswer$: Observable<IVowelID | undefined>;
  public get selectedAnswer$(): Observable<IVowelID | undefined> {
    return this._selectedAnswer$;
  }

  private readonly _state$: Observable<IState | undefined>;
  public get state$(): Observable<IState | undefined> {
    return this._state$;
  }

  private readonly _currentSession$: Observable<ISession | undefined>;
  public get currentSession$(): Observable<ISession | undefined> {
    return this._currentSession$;
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

  private readonly _answered$: Observable<boolean | undefined>;
  public get answered$(): Observable<boolean | undefined> {
    return this._answered$;
  }

  private readonly _questionsLength$: Observable<number | undefined>;
  public get questionsLength$(): Observable<number | undefined> {
    return this._questionsLength$;
  }
  private readonly _movingAverages$: Observable<IMovingAverage[] | undefined> =
    this.store$.select(quizFeature.selectMovingAverages);

  private readonly _statsBySession$: Observable<IStatistics[] | undefined> =
    this.store$.select(quizFeature.selectStatsBySession);
  public get statsBySession$(): Observable<IStatistics[] | undefined> {
    return this._statsBySession$;
  }

  public get movingAverages$(): Observable<IMovingAverage[] | undefined> {
    return this._movingAverages$;
  }

  private readonly _totalStats$: Observable<IStatistics | undefined> =
    this.store$.select(quizFeature.selectTotalStats);
  public get totalStats$(): Observable<IStatistics | undefined> {
    return this._totalStats$;
  }
  constructor() {
    this._finished$ = this.store$.select(quizFeature.selectFinished);

    this._quizzes$ = this.store$
      .select(quizFeature.selectQuizzes)
      .pipe(
        map(q =>
          Object.values(q ?? {}).sort((a, b) => a.id.localeCompare(b.id)),
        ),
      );
    this._openedQuiz$ = this.store$.select(quizFeature.selectCurrentQuiz);
    this._selectedAnswer$ = this.store$.select(
      quizFeature.selectCurrentQuestionSelectedAnswer,
    );
    this._state$ = this.store$.select(quizFeature.selectQuizState);
    this._currentSession$ = this.store$.select(
      quizFeature.selectCurrentSession,
    );
    this._questions$ = this.store$
      .select(quizFeature.selectSessionQuestions)
      .pipe(map(q => (q ? Object.values(q) : undefined)));
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
