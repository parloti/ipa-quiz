import { inject } from '@angular/core';
import { Router } from '@angular/router';

const icon = String.fromCharCode(10021);

/**
 * Enables tracing of activated routes.
 */
export function routerDebugTracing(): void {
  if (typeof ngDevMode === 'undefined' || Boolean(ngDevMode)) {
    inject(Router).events.subscribe({
      complete: () => {
        debugger;
      },
      error: (err: unknown) => {
        console.error(err);
      },
      next: (e) => {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string -- TODO: Testar regra
        const description = e.toString();
        console.groupCollapsed(
          `%c${icon} Router Event: ${e.constructor.name}`,
          'color: #866c3e; font-weight: 700',
        );
        console.log(description);
        console.log(e);
        console.groupEnd();
      },
    });
  }
}
