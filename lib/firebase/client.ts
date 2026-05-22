import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

function getEnv(value: string | undefined): string | undefined {
  if (!value || value === 'undefined' || value.trim() === '') return undefined;
  return value;
}

const firebaseConfig = {
  apiKey: 'AIzaSyCWKBxIi9DTuA8hiSMCDUCkNiG_fsFlxyg',
  authDomain: 'campaign-prep-fc9ed.firebaseapp.com',
  projectId: 'campaign-prep-fc9ed',
  storageBucket: 'campaign-prep-fc9ed.firebasestorage.app',
  messagingSenderId: '549573496390',
  appId: '1:549573496390:web:0e718df86b18bbbbb28447',
};



let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (_app) return _app;
  
  const APP_NAME = 'gmbuilder-app';
  const existingApp = getApps().find(app => app.name === APP_NAME);
  
  if (existingApp) {
    _app = existingApp;
  } else {
    _app = initializeApp(firebaseConfig, APP_NAME);
  }
  
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
