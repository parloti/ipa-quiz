import { createAction, props } from '@ngrx/store';
import { IQuiz } from '../models/iquiz';
import { ISession } from '../models/isession';
import { IState } from '../models/istate';

export const actions = {
  addQuiz: createAction('[Quiz] Add Quiz', props<{ quiz: IQuiz }>()),
  addSession: createAction(
    '[Quiz] Add Session',
    props<{ session: ISession }>(),
  ),
  nextQuestion: createAction('[Quiz] Next Question'),
  answerCurrent: createAction(
    '[Quiz] Answer Current',
    props<{ date: string }>(),
  ),
  openQuiz: createAction('[Quiz] Open Quiz', props<{ quiz: IQuiz }>()),
  createQuizSession: createAction(
    '[Quiz] Create Session',
    props<{ quiz: IQuiz }>(),
  ),
  selectAnswer: createAction(
    '[Quiz] Select Answer',
    props<{ selectedAnswer: number | undefined }>(),
  ),
  restoreState: createAction(
    '[App] Restore State',
    props<{ restoring: IState }>(),
  ),
  saveState: createAction('[App] Save State', props<{ state: IState }>()),
};
