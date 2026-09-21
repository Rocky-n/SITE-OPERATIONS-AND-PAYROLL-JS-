import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyFakeKeyForConstructionDemo2026',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'construction-mgmt-demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'construction-mgmt-demo',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'construction-mgmt-demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef1234567890',
};

let app;
let auth;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
} catch (error) {
  console.warn('Firebase initialization warning:', error.message);
}

export { auth, RecaptchaVerifier, signInWithPhoneNumber };
