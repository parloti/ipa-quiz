import { Injectable, inject } from '@angular/core';
import { doc, setDoc } from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { FirebaseService } from './firebase.service';

/**
 * Minimal cloud sync service.
 *
 * Behavior:
 * - Keeps a copy of the last-sent state and computes a simple deep diff
 *   (object shape) against the new state.
 * - Sends only the changed keys as a partial object to the server.
 * - Server endpoint is a placeholder `/api/state-sync` — replace with real
 *   backend endpoint and add auth headers as needed.
 */
@Injectable({ providedIn: 'root' })
export class CloudSyncService {
  private lastSentState: unknown | undefined;
  private uid: string | undefined;
  private idToken: string | undefined;
  private firebaseService = inject(FirebaseService);

  /**
   * Set the current user context for cloud sync.
   * @param uid Firebase user id (uid)
   * @param idToken Optional Firebase ID token for authenticated requests
   */
  public setUser(uid: string, idToken?: string) {
    this.uid = uid;
    this.idToken = idToken;
  }

  async sync(state: unknown): Promise<void> {
    try {
      const changes = this.computeDiff(this.lastSentState, state);
      if (
        !changes ||
        Object.keys(changes as Record<string, unknown>).length === 0
      ) {
        // Nothing to send
        return;
      }

      // Prefer Firestore if configured and initialized
      const db = this.firebaseService.getFirestore();
      if (db && this.uid) {
        // Write partial changes with merge: true to only update changed fields
        const userDoc = doc(db, 'users', this.uid);
        await setDoc(userDoc, changes, { merge: true });
      } else {
        // Fallback: If RTDB URL configured use REST, otherwise POST to generic endpoint
        const dbUrl = (environment as any).firebaseDatabaseUrl;
        if (dbUrl && this.uid) {
          const q = this.idToken
            ? `?auth=${encodeURIComponent(this.idToken)}`
            : '';
          const url = `${dbUrl.replace(/\/+$/, '')}/users/${encodeURIComponent(
            this.uid,
          )}/state.json${q}`;
          await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(changes),
          });
        } else {
          await fetch('/api/state-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              changes,
              timestamp: new Date().toISOString(),
            }),
          });
        }
      }

      // Update lastSentState on successful send
      this.lastSentState = this.clone(state);
    } catch (error) {
      // Network failures or other errors are ignored here; you may want to
      // queue and retry later in a production implementation.
      console.warn('Cloud sync failed:', error);
    }
  }

  private computeDiff(prev: any, next: any): any {
    if (prev === undefined) {
      // First time: send a shallow copy of the whole state (or keep empty to avoid sending everything)
      // We'll send a shallow copy so the server can bootstrap the user's cloud state.
      return this.clone(next) ?? {};
    }

    if (prev === next) {
      return {};
    }

    if (!this.isObject(prev) || !this.isObject(next)) {
      // Primitive replaced — send the new value
      return this.clone(next);
    }

    const out: any = {};
    const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
    for (const key of keys) {
      const p = prev?.[key];
      const n = next?.[key];
      if (this.isObject(p) && this.isObject(n)) {
        const child = this.computeDiff(p, n);
        if (child && Object.keys(child).length > 0) {
          out[key] = child;
        }
      } else if (Array.isArray(p) && Array.isArray(n)) {
        if (p.length !== n.length || JSON.stringify(p) !== JSON.stringify(n)) {
          out[key] = this.clone(n);
        }
      } else if (p !== n) {
        out[key] = this.clone(n);
      }
    }

    return out;
  }

  private isObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  private clone<T>(v: T): T {
    try {
      return JSON.parse(JSON.stringify(v));
    } catch {
      return v;
    }
  }
}
