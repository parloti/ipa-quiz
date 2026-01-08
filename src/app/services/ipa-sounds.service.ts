import { Injectable } from '@angular/core';
import { defer, from, type Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import type { IpaSoundManifest } from '../models/ipa-sounds';

@Injectable({ providedIn: 'root' })
export class IpaSoundsService {
  readonly jillHouseManifest$: Observable<IpaSoundManifest> = defer(() =>
    from(this.fetchManifest('sounds/ipa/jill_house/manifest.json')),
  ).pipe(shareReplay({ bufferSize: 1, refCount: false }));

  private async fetchManifest(relativeUrl: string): Promise<IpaSoundManifest> {
    const url = new URL(relativeUrl, document.baseURI).toString();
    const response = await fetch(url, { cache: 'force-cache' });

    if (!response.ok) {
      throw new Error(
        `Failed to load IPA sound manifest: ${response.status} ${response.statusText}`,
      );
    }

    return (await response.json()) as IpaSoundManifest;
  }
}
