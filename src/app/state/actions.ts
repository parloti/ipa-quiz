import { createAction, props } from '@ngrx/store';
import { IQuiz, IQuizID } from '../models/iquiz';
import { ISession, ISessionID } from '../models/isession';
import { IState } from '../models/istate';
import { IVowelID } from '../models/ivowel';

export const actions = {
  addQuiz: createAction('[Quiz] Add Quiz', props<{ quiz: IQuiz }>()),
  addSession: createAction(
    '[Quiz] Add Session',
    props<{ session: ISession }>(),
  ),
  previousQuestion: createAction('[Quiz] Previous Question'),
  nextQuestion: createAction('[Quiz] Next Question'),
  answerCurrent: createAction(
    '[Quiz] Answer Current',
    props<{ date: string }>(),
  ),
  openQuiz: createAction('[Quiz] Open Quiz', props<{ quizId: IQuizID }>()),
  createQuizSession: createAction(
    '[Quiz] Create Session',
    props<{ quiz: IQuiz }>(),
  ),
  goToNewSession: createAction('[Quiz] Go To New Session'),
  goBack: createAction('[Quiz] Go back'),
  openSession: createAction(
    '[Quiz] Open Session',
    props<{ quizId: IQuizID; sessionId: ISessionID }>(),
  ),
  selectAnswer: createAction(
    '[Quiz] Select Answer',
    props<{ selectedAnswer: IVowelID }>(),
  ),
  updateQuestionSoundIndex: createAction(
    '[Quiz] Update Question Sound Played',
    props<{ soundIndex: number }>(),
  ),
  updateOptionSoundIndex: createAction(
    '[Quiz] Update Option Sound Played',
    props<{ optionIndex: number; soundIndex: number }>(),
  ),
  restoreState: createAction(
    '[App] Restore State',
    props<{ restoring: IState }>(),
  ),
  practiceOpened: createAction(
    '[Quiz] Practice Opened',
    props<{ quizId: IQuizID }>(),
  ),
  restoreStateFailed: createAction('[App] Restore State Failed'),
  saveState: createAction('[App] Save State', props<{ state: IState }>()),
};
