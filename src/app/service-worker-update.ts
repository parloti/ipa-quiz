import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SwUpdate } from '@angular/service-worker';

export function serviceWorkerUpdateInitializer(): void {
  const swUpdate = inject(SwUpdate);
  const snackBar = inject(MatSnackBar);

  if (!swUpdate.isEnabled) {
    console.warn('Service worker is not enabled.');
    return;
  }

  swUpdate.versionUpdates.subscribe({
    next: event => {
      if (event.type !== 'VERSION_READY') {
        return;
      }

      console.info('Service worker fetched a new version, activating.');
      swUpdate.activateUpdate().then(
        () => {
          const snackBarRef = snackBar.open('New version available', 'Reload');
          snackBarRef.onAction().subscribe(() => {
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          });
        },
        err => console.error('Failed to activate service worker update', err),
      );
    },
    error: err => console.error('Service worker version stream failed', err),
  });
}
