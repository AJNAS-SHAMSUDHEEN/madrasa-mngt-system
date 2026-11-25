import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyCi8L9OReVSErTQE9gEKKqLQqukqnfYV-s",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "madrasa-mngt.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "madrasa-mngt",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "madrasa-mngt.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "94574006419",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:94574006419:web:928a6a1e836d91e6e13d66",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-P3TTE3BZF5",
};

export const firebaseApp: FirebaseApp = getApps().some((a) => a.name === "[DEFAULT]")
  ? getApp("[DEFAULT]")
  : initializeApp(firebaseConfig);

export const firebaseAuth: Auth = getAuth(firebaseApp);
export const firestoreDb: Firestore = getFirestore(firebaseApp);

export function getSecondaryAuth(): Auth {
  const existing = getApps().find((a) => a.name === "secondary-provisioner");
  const secondaryApp =
    existing || initializeApp(firebaseConfig, "secondary-provisioner");
  return getAuth(secondaryApp);
}

let analyticsPromise: Promise<Analytics | null> | null = null;

export function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") {
    return Promise.resolve(null);
  }
  if (!analyticsPromise) {
    analyticsPromise = isSupported()
      .then((supported) => (supported ? getAnalytics(firebaseApp) : null))
      .catch(() => null);
  }
  return analyticsPromise;
}
