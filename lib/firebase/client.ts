import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

function getEnv(value: string | undefined): string | undefined {
  if (!value || value === 'undefined' || value.trim() === '') return undefined;
  return value;
}

const firebaseConfig = {
  apiKey: getEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY) || 'AIzaSyCWKBxIi9DTuA8hiSMCDUCkNiG_fsFlxyg',
  authDomain: getEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) || 'campaign-prep-fc9ed.firebaseapp.com',
  projectId: getEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) || 'campaign-prep-fc9ed',
  storageBucket: getEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) || 'campaign-prep-fc9ed.firebasestorage.app',
  messagingSenderId: getEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) || '549573496390',
  appId: getEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID) || '1:549573496390:web:0e718df86b18bbbbb28447',
};



let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (_app) return _app;
  console.log('[getFirebaseApp] Initializing with config:', {
    apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.slice(0, 8)}...` : 'undefined',
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
  });
  _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return _app;
}

export function getFirebaseAuth(): Auth {
  if (_auth) return _auth;
  _auth = getAuth(getFirebaseApp());
  return _auth;
}

export function getDb(): Firestore {
  if (_db) return _db;
  _db = getFirestore(getFirebaseApp());
  return _db;
}

export const googleProvider = new GoogleAuthProvider();
