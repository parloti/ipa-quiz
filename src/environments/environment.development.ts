import { FirebaseOptions } from 'firebase/app';

export const environment: {
  firebaseConfig: FirebaseOptions;
} = {
  firebaseConfig: {
    apiKey: 'apiKey',
    authDomain: 'authDomain',
    projectId: 'projectId',
    storageBucket: 'storageBucket',
    messagingSenderId: 'messagingSenderId',
    appId: 'appId',
    measurementId: 'measurementId',
  },
};
