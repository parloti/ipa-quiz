import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { BehaviorSubject } from 'rxjs';
import { IQuestion } from '../models/iquestion';
import { actions } from '../state/actions';
import { enrichQuestionsWithSounds } from '../state/create-questions';
import { CloudSyncService } from './cloud-sync.service';
import { FirebaseService } from './firebase.service';
import { PhonemeSoundsService } from './phoneme-sounds.service';

/**
 * Lightweight Firebase Auth wrapper.
 * - Initializes Firebase (if configured)
 * - Provides `signInAnonymously()` for quick setup
 * - On auth change, sets `CloudSyncService` user context with uid and ID token
 */
@Injectable({ providedIn: 'root' })
export class FirebaseAuthService {
  private firebaseService = inject(FirebaseService);
  private cloudSync = inject(CloudSyncService);
  private phonemeSoundsService = inject(PhonemeSoundsService);
  private store = inject(Store);

  private authInitialized = false;

  public readonly user$ = new BehaviorSubject<User | null>(null);

  init(): void {
    if (this.authInitialized) {
      return;
    }
    const app = this.firebaseService.init();
    if (!app) {
      return;
    }
    const auth = getAuth(app);
    onAuthStateChanged(auth, async user => this.handleUser(user));
    this.authInitialized = true;
  }

  async signInAnonymously(): Promise<void> {
    this.init();
    const app = this.firebaseService.init();
    if (!app) {
      return;
    }
    const auth = getAuth(app);
    await signInAnonymously(auth);
  }

  async signInWithGoogle(): Promise<void> {
    this.init();
    const app = this.firebaseService.init();
    if (!app) {
      return;
    }
    const auth = getAuth(app);
    await signInWithPopup(auth, new GoogleAuthProvider());
  }

  async signInWithEmail(email: string, pass: string): Promise<void> {
    this.init();
    const app = this.firebaseService.init();
    if (!app) {
      return;
    }
    const auth = getAuth(app);
    await signInWithEmailAndPassword(auth, email, pass);
  }

  async signUpWithEmail(email: string, pass: string): Promise<void> {
    this.init();
    const app = this.firebaseService.init();
    if (!app) {
      return;
    }
    const auth = getAuth(app);
    await createUserWithEmailAndPassword(auth, email, pass);
  }

  async signOut(): Promise<void> {
    const app = this.firebaseService.init();
    if (!app) {
      return;
    }
    const auth = getAuth(app);
    await signOut(auth);
    this.cloudSync.setUser(undefined as any, undefined);
  }

  private async handleUser(user: User | null) {
    this.user$.next(user);
    if (!user) {
      this.cloudSync.setUser(undefined as any, undefined);
      return;
    }

    try {
      const idToken = await user.getIdToken();
      this.cloudSync.setUser(user.uid, idToken);
    } catch (e) {
      console.warn('Failed to obtain ID token for cloud sync', e);
      this.cloudSync.setUser(user.uid);
    }

    console.info('[FirebaseAuth] detected user', {
      uid: user.uid,
      anonymous: user.isAnonymous,
    });

    // Attempt to fetch remote state for this user and restore it into the store
    try {
      console.info(
        '[FirebaseAuth] attempting to fetch remote state for',
        user.uid,
      );
      const remote = await this.cloudSync.fetchRemoteState();
      if (remote) {
        // Enrich all questions with sounds before restoring state
        const allQuestions: IQuestion[] = [];
        for (const quiz of Object.values(remote.quizzes)) {
          for (const session of Object.values(quiz.sessions ?? {})) {
            allQuestions.push(...Object.values(session.questions ?? {}));
          }
        }
        if (allQuestions.length > 0) {
          await enrichQuestionsWithSounds(
            allQuestions,
            this.phonemeSoundsService,
          );
        }

        console.info(
          '[FirebaseAuth] remote state fetched, dispatching restoreState',
        );
        this.store.dispatch(actions.restoreState({ restoring: remote }));
      } else {
        console.info('[FirebaseAuth] no remote state found for', user.uid);
      }
    } catch (e) {
      // non-fatal
      console.warn('Failed to restore remote state', e);
    }
  }
}
