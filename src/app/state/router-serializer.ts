import type { RouterStateSnapshot } from '@angular/router';
import { MinimalRouterStateSerializer } from '@ngrx/router-store';
import type { IAppRouterState } from './iapp-router-state';

/**
 * Serializes the router, providing custom information.
 */
export class RouterSerializer extends MinimalRouterStateSerializer {
  /**
   * Serializes the current {@link RouterStateSnapshot}.
   * @param routerState - The last router snapshot.
   * @returns The updated route state.
   */
  public override serialize(routerState: RouterStateSnapshot): IAppRouterState {
    const minimalSnapshot = super.serialize(routerState);
    const path = minimalSnapshot.root.firstChild?.routeConfig?.path;

    return { ...minimalSnapshot, path };
  }
}
