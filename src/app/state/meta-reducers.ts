import type { FactoryProvider } from '@angular/core';
import type { Action, ActionReducer, MetaReducer } from '@ngrx/store';
import { META_REDUCERS } from '@ngrx/store';

const stateIcon = String.fromCharCode(10227);
const docIcon = String.fromCharCode(55357, 56782);

type Reducer = ActionReducer<object>;

type Redution = (
  reducer: Reducer,
  state: object | undefined,
  action: Action,
) => object;

const createLabel = (icon: string, iconColor: string, actionColor: string) => {
  const label = (actionType: string) => [
    `%c${stateIcon} %c${icon} %c${actionType} ${new Date().toISOString()}`,
    'color: #A829C3; font-weight: bold',
    `color: ${iconColor}; font-weight: bold`,
    `color: ${actionColor}; font-weight: bold`,
  ];
  return label;
};

const createMetaReducer = (
  logger: Console,
  redution: Redution,
  label: (type: string) => string[],
) => {
  return (reducer: Reducer): Reducer => {
    return (state, action) => {
      const result = redution(reducer, state, action);

      logger.groupCollapsed(...label(action.type));
      logger.log('%c prev state', 'color: #9E9E9E; font-weight: bold', state);
      logger.log('%c action', 'color: #03A9F4; font-weight: bold', action);
      logger.log('%c next state', 'color: #4CAF50; font-weight: bold', result);
      logger.groupEnd();

      return result;
    };
  };
};

const metaReducersFactory = (logger: Console): MetaReducer<object> => {
  const log = createMetaReducer(
    logger,
    (reducer, state, action) => reducer(state, action),
    createLabel(docIcon, '#808080', '#A829C3'),
  );

  return reducer => (state, action) => log(reducer)(state, action);
};

/**
 * Configures in a module the {@link META_REDUCERS} to inject the meta reducer.
 */
export const provideMetaReducer = (): FactoryProvider => ({
  multi: true,
  provide: META_REDUCERS,
  useFactory: () => metaReducersFactory(console),
});
