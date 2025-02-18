import type {
  RouterNavigatedAction,
  RouterNavigationAction,
} from '@ngrx/router-store';
import { ROUTER_NAVIGATED, ROUTER_NAVIGATION } from '@ngrx/router-store';
import type { Action, ActionCreator } from '@ngrx/store';
import type { IAppRouterState } from './iapp-router-state';

type IRouterNavigatedType = typeof ROUTER_NAVIGATED;
type IRouterNavigatedCreator = ActionCreator<
  IRouterNavigatedType,
  (
    props: RouterNavigatedAction<IAppRouterState>,
  ) => typeof props & Action<IRouterNavigatedType>
>;

/**
 * Strong type alias for {@link ROUTER_NAVIGATED}, should never be dispatched.
 */
export const APP_ROUTER_NAVIGATED = {
  type: ROUTER_NAVIGATED,
} as IRouterNavigatedCreator;

type IRouterNavigationType = typeof ROUTER_NAVIGATION;
type IRouterNavigationCreator = ActionCreator<
  IRouterNavigationType,
  (
    props: RouterNavigationAction<IAppRouterState>,
  ) => typeof props & Action<IRouterNavigationType>
>;

/**
 * Strong type alias for {@link ROUTER_NAVIGATION}, should never be dispatched.
 */
export const APP_ROUTER_NAVIGATION = {
  type: ROUTER_NAVIGATION,
} as IRouterNavigationCreator;
