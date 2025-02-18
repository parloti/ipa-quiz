import { BaseRouteReuseStrategy } from '@angular/router';

export class CustomReuseStrategy extends BaseRouteReuseStrategy {
  override shouldReuseRoute(): boolean {
    return false;
  }
}
