import {
  ApplicationConfig,
  importProvidersFrom,
  isDevMode,
  provideEnvironmentInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { HammerModule } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, RouteReuseStrategy, withComponentInputBinding } from '@angular/router';
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
import { AppEffects } from './state/app.effects';
import { provideMetaReducer } from './state/meta-reducers';
import { quizFeature } from './state/quiz-feature';
import { RouterSerializer } from './state/router-serializer';
import { routerDebugTracing } from './router-debug-tracing';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideEnvironmentInitializer(routerDebugTracing),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    provideAnimationsAsync(),
    importProvidersFrom(HammerModule),
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
    provideStore(
      { [DEFAULT_ROUTER_FEATURENAME]: routerReducer },
      {
        runtimeChecks: {
          strictStateSerializability: true,
          strictActionSerializability: true,
          strictActionWithinNgZone: true,
          strictActionTypeUniqueness: true,
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
