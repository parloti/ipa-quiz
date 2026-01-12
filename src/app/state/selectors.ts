import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IQuizID } from '../models/iquiz';
import { IState } from '../models/istate';

const selectRoot = createFeatureSelector<IState>('root');

export const selectors = {
  selectRoot,
  selectQuizzes: createSelector(selectRoot, state => state.quizzes),
  selectOpenedQuiz: createSelector(selectRoot, state => state.currentQuizId),
  selectQuizById: (state: IState, props: { id: IQuizID }) =>
    state.quizzes[props.id],
  selectQuizStatistics: (state: IState, props: { id: IQuizID }) =>
    state.quizzes[props.id]?.statistics,
};
