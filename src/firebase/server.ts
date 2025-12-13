import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';

interface FirebaseAdminServices {
  app: App;
  auth: Auth;
  db: Firestore;
  storage: Storage;
}

let services: FirebaseAdminServices | null = null;

// This function initializes and returns the Firebase Admin SDK services.
// It uses a memoization pattern to ensure that initialization only happens once.
export function getFirebaseAdmin(): FirebaseAdminServices {
  if (services) {
    return services;
  }

  if (getApps().length === 0) {
    // In a deployed environment, `initializeApp` will use the default credentials
    // provided by the environment (e.g., Google Application Default Credentials).
    // For local development, you might need to provide a service account key.
    initializeApp();
  }
  
  const app = getApps()[0];
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

  services = { app, auth, db, storage };
  
  return services;
}
