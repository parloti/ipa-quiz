import type { ActionType } from '@ngrx/store';
import type { OperatorFunction } from 'rxjs';
import { map } from 'rxjs';
import {
  APP_ROUTER_NAVIGATED,
  APP_ROUTER_NAVIGATION,
} from './app-router-actions';

type IRouterAction = ActionType<
  typeof APP_ROUTER_NAVIGATION | typeof APP_ROUTER_NAVIGATED
>;

/**
 * Pluck the path of a router action.
 * @returns - TThe path of route.
 */
export function pluckPath(): OperatorFunction<
  IRouterAction,
  string | undefined
> {
  const project = (action: IRouterAction): string | undefined =>
    action.payload.routerState.path;
  return map(project);
}
