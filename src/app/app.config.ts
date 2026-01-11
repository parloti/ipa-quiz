import {
  ApplicationConfig,
  isDevMode,
  provideBrowserGlobalErrorListeners,
  provideEnvironmentInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  provideRouter,
  RouteReuseStrategy,
  withComponentInputBinding,
} from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { provideEffects } from '@ngrx/effects';
import {
  DEFAULT_ROUTER_FEATURENAME,
  provideRouterStore,
  routerReducer,
  RouterState,
} from '@ngrx/router-store';
import { provideState, provideStore } from '@ngrx/store';
import 'hammerjs';
import { routes } from './app.routes';
import { CustomReuseStrategy } from './reuse-strategy';
import { routerDebugTracing } from './router-debug-tracing';
import { AppEffects } from './state/app.effects';
import { provideMetaReducer } from './state/meta-reducers';
import { quizFeature } from './state/quiz-feature';
import { RouterSerializer } from './state/router-serializer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideEnvironmentInitializer(routerDebugTracing),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
    provideStore(
      { [DEFAULT_ROUTER_FEATURENAME]: routerReducer },
      {
        runtimeChecks: {
          strictActionSerializability: false,
          strictActionTypeUniqueness: true,
          strictActionWithinNgZone: false,
          strictStateSerializability: false,
        },
      },
    ),
    provideState(quizFeature),
    provideMetaReducer(),
    provideEffects(AppEffects),
    provideRouterStore({
      serializer: RouterSerializer,
      stateKey: 'router2',
      routerState: RouterState.Full,
    }),
  ],
};
