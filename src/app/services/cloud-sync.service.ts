import { inject, Injectable } from '@angular/core';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { IState } from '../models/istate';
import { logCloudDiff } from './cloud-logger';
import { FirebaseService } from './firebase.service';
import { PhonemeSoundsService } from './phoneme-sounds.service';
import {
  denormalizeState,
  INormalizedState,
  normalizeState,
} from './state-normalization';

/**
 * Minimal cloud sync service.
 *
 * Behavior:
 * - Normalizes state before syncing (strips static IVowel/IQuiz data)
 * - Keeps a copy of the last-sent normalized state and computes a deep diff
 * - Sends only the changed keys as a partial object to the server
 * - Static data (quiz metadata, vowel definitions) stays local and is never synced
 */
@Injectable({ providedIn: 'root' })
export class CloudSyncService {
  private lastSentState: INormalizedState | undefined;
  private uid: string | undefined;
  private idToken: string | undefined;
  private firebaseService = inject(FirebaseService);
  private phonemeService = inject(PhonemeSoundsService);

  /**
   * Set the current user context for cloud sync.
   * @param uid Firebase user id (uid)
   * @param idToken Optional Firebase ID token for authenticated requests
   */
  public setUser(uid: string, idToken?: string) {
    this.uid = uid;
    this.idToken = idToken;
  }

  /**
   * Fetch the user's remote normalized state from Firestore and return a
   * denormalized `IState` suitable for restoring into the store.
   */
  public async fetchRemoteState(
    uid?: string,
  ): Promise<import('../models/istate').IState | undefined> {
    const useUid = uid ?? this.uid;
    if (!useUid) {
      return undefined;
    }
    const db = this.firebaseService.getFirestore();
    if (!db) {
      return undefined;
    }

    try {
      const userDocRef = doc(db, 'users', useUid);
      const snap = await getDoc(userDocRef);
      console.info('[CloudSync] fetched user doc', {
        uid: useUid,
        exists: snap.exists(),
      });
      if (!snap.exists()) {
        return undefined;
      }
      const data = snap.data() as INormalizedState;
      console.info('[CloudSync] user doc data keys', Object.keys(data ?? {}));
      if (!data) {
        return undefined;
      }
      // Set lastSentState so we don't immediately resend the same data back
      try {
        this.lastSentState = this.clone(data) as INormalizedState;
      } catch {
        // ignore clone errors
      }

      try {
        return denormalizeState(data);
      } catch (e) {
        console.warn('Failed to denormalize remote state', e);
        return undefined;
      }
    } catch (e) {
      console.warn('Failed to fetch remote state', e);
      return undefined;
    }
  }

  async sync(state: IState): Promise<void> {
    try {
      if (!this.uid) {
        return;
      }

      console.info('[CloudSync] preparing sync for', this.uid);

      // Normalize state - strip static data, keep only user-specific fields
      const normalizedState = normalizeState(state);

      const changes = this.computeDiff(this.lastSentState, normalizedState);
      if (
        !changes ||
        Object.keys(changes as Record<string, unknown>).length === 0
      ) {
        return;
      }

      // Log changes in a readable, colorful group for debugging
      try {
        logCloudDiff(
          this.constructor.name,
          changes as Record<string, unknown>,
          this.lastSentState as any,
          normalizedState as any,
        );
      } catch {
        // ignore logger errors
      }

      const db = this.firebaseService.getFirestore();
      if (db) {
        const userDoc = doc(db, 'users', this.uid);
        console.info(
          '[CloudSync] writing changes for',
          this.uid,
          Object.keys(changes),
        );
        await setDoc(userDoc, changes, { merge: true });
        console.info('[CloudSync] write complete for', this.uid);
      }

      // Update lastSentState on successful send
      this.lastSentState = this.clone(normalizedState);
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
