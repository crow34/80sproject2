import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, connectAuthEmulator } from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache,
  persistentSingleTabManager,
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED
} from 'firebase/firestore';
import { firebaseConfig } from './config';

// Initialize Firebase app
export const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(error => {
  console.warn('Auth persistence failed:', error);
});

// Initialize Firestore with enhanced offline support
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentSingleTabManager({
      forceOwnership: true
    })
  }),
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
});

// Enable enhanced offline persistence
enableIndexedDbPersistence(db, {
  forceOwnership: true
}).catch((err) => {
  console.warn('Firestore persistence failed:', err);
  if (err.code === 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab at a time
    console.info('Multiple tabs open, persistence enabled in another tab');
  } else if (err.code === 'unimplemented') {
    // The current browser doesn't support persistence
    console.info('Current browser doesn\'t support persistence');
  }
});

// Enable better error messages in development
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8080);
}