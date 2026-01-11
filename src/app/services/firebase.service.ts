import { Injectable } from '@angular/core';
import {
  FirebaseApp,
  getApp,
  initializeApp,
  type FirebaseOptions,
} from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private app: FirebaseApp | undefined;
  private db: Firestore | undefined;

  init(): FirebaseApp | undefined {
    if (this.app) return this.app;
    const cfg = environment.firebaseConfig as FirebaseOptions | undefined;
    if (!cfg) return undefined;
    try {
      this.app = initializeApp(cfg);
      try {
        this.db = getFirestore(this.app);
      } catch {
        // ignore
      }
      return this.app;
    } catch (e) {
      // If already initialized, return existing
      try {
        this.app = getApp();
        return this.app;
      } catch {
        console.warn('Firebase init failed', e);
        return undefined;
      }
    }
  }

  getFirestore(): Firestore | undefined {
    if (this.db) return this.db;
    const app = this.init();
    if (!app) return undefined;
    try {
      this.db = getFirestore(app);
      return this.db;
    } catch {
      return undefined;
    }
  }
}
