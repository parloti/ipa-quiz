import type { Route } from '@angular/router';
import type { MinimalRouterStateSnapshot } from '@ngrx/router-store';

/**
 * Represents the state of the feature router.
 */
export interface IAppRouterState extends MinimalRouterStateSnapshot {
  /**
   * The configured path for the current route.
   * See {@link Route.path | path}.
   */
  path: string | undefined;
}
